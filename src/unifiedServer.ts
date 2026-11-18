/**
 * @fileoverview Unified Activity Reporting Server
 * @description MCP server that supports both GDE (Advocu) and Microsoft MVP activity submissions
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// GDE imports
import type {
  ContentCreationDraft,
  GDEActivitiesPage,
  GDEActivity,
  GooglerInteractionDraft,
  ListGDEActivitiesParams,
  MentoringDraft,
  ProductFeedbackDraft,
  PublicSpeakingDraft,
  StoryDraft,
  WorkshopDraft,
} from "./interfaces/index.js";
import {
  ContentType,
  Country,
  EventFormat,
  InteractionFormat,
  InteractionType,
  ProductFeedbackContentType,
  SignificanceType,
} from "./types/index.js";

// MVP imports
import type { MVPVideoActivity, MVPBlogActivity, MVPSpeakingActivity } from "./interfaces/mvp/index.js";
import { MVPActivityType, MVPActivityRole, MVPTargetAudience } from "./types/mvp/index.js";

// Get the docs directory from environment variable or fallback
// IMPORTANT: Set DOCS_DIR in Claude Desktop config to the full path
// Example: /Users/username/work/mcp-mvp-gde/docs
const DOCS_DIR = process.env.DOCS_DIR || join(process.cwd(), "docs");

// Define available documentation resources
const DOCUMENTATION_RESOURCES = [
  {
    uri: "docs://api-reference",
    name: "API Reference",
    description: "Complete API documentation for both Microsoft MVP and Google GDE (Advocu) APIs",
    mimeType: "text/markdown",
    file: "API.md",
  },
  {
    uri: "docs://mvp-api-reference",
    name: "MVP API Reference",
    description: "Detailed Microsoft MVP API reference with field specifications and examples",
    mimeType: "text/markdown",
    file: "MVP_API_REFERENCE.md",
  },
  {
    uri: "docs://mvp-fixes-changelog",
    name: "MVP Integration Fixes Changelog",
    description: "Complete changelog of fixes applied to MVP integration",
    mimeType: "text/markdown",
    file: "CHANGELOG_MVP_FIXES.md",
  },
  {
    uri: "docs://error-handling",
    name: "Error Handling Improvements",
    description: "Documentation of error handling improvements and best practices",
    mimeType: "text/markdown",
    file: "ERROR_HANDLING_IMPROVEMENTS.md",
  },
  {
    uri: "docs://mcp-resources",
    name: "MCP Resources Guide",
    description: "Guide on how to use MCP resources to access documentation",
    mimeType: "text/markdown",
    file: "MCP_RESOURCES.md",
  },
] as const;

// ISO-8601 UTC timestamp accepted by the Advocu activities filters, e.g. 2026-01-01T00:00:00Z
const ISO_DATE_TIME_PATTERN = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$";

// Safety cap for `fetchAll` pagination (the Advocu API allows 30 requests per minute)
const GDE_MAX_PAGES = 25;

type GDEActivitiesPageResult = { ok: true; data: GDEActivitiesPage } | { ok: false; error: string };

export class UnifiedActivityReportingServer {
  private readonly server: Server;

  // GDE configuration
  private readonly gdeAccessToken: string | null;
  private readonly gdeBaseUrl: string;
  private readonly gdeEnabled: boolean;

  // MVP configuration
  private readonly mvpAccessToken: string | null;
  private readonly mvpUserProfileId: number | null;
  private readonly mvpBaseUrl: string;
  private readonly mvpEnabled: boolean;

  /**
   * Extract a meaningful error message from various error types
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object") {
      if ("message" in error && typeof error.message === "string") {
        return error.message;
      }
      if ("error" in error && typeof error.error === "string") {
        return error.error;
      }
      if ("statusText" in error && typeof error.statusText === "string") {
        return error.statusText;
      }
    }
    return JSON.stringify(error);
  }

  constructor() {
    this.server = new Server(
      {
        name: "activity-reporting-server",
        version: "0.2.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      },
    );

    // Setup GDE
    this.gdeAccessToken = process.env.ADVOCU_ACCESS_TOKEN || null;
    this.gdeBaseUrl = process.env.ADVOCU_API_URL ?? "https://api.advocu.com/personal-api/v1/gde";
    this.gdeEnabled = !!this.gdeAccessToken;

    if (!this.gdeEnabled) {
      console.error("⚠️  ADVOCU_ACCESS_TOKEN not set - GDE tools will be disabled");
    }

    // Setup MVP
    this.mvpAccessToken = process.env.MVP_ACCESS_TOKEN || null;
    const mvpProfileId = process.env.MVP_USER_PROFILE_ID || null;
    this.mvpUserProfileId = mvpProfileId ? Number.parseInt(mvpProfileId, 10) : null;
    this.mvpBaseUrl = process.env.MVP_API_URL ?? "https://mavenapi-prod.azurewebsites.net/api";
    this.mvpEnabled = !!(this.mvpAccessToken && this.mvpUserProfileId);

    if (!this.mvpEnabled) {
      if (!this.mvpAccessToken) {
        console.error("⚠️  MVP_ACCESS_TOKEN not set - MVP tools will be disabled");
      }
      if (!this.mvpUserProfileId) {
        console.error("⚠️  MVP_USER_PROFILE_ID not set - MVP tools will be disabled");
      }
    }

    if (!this.gdeEnabled && !this.mvpEnabled) {
      console.error("❌ Neither GDE nor MVP credentials configured. At least one must be set.");
      process.exit(1);
    }

    console.error(`✅ Server initialized:`);
    console.error(`   GDE: ${this.gdeEnabled ? "enabled" : "disabled"}`);
    console.error(`   MVP: ${this.mvpEnabled ? "enabled" : "disabled"}`);
    console.error(`   Docs: ${DOCS_DIR}`);

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Array<{
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
      }> = [];

      // Add GDE tools if enabled
      if (this.gdeEnabled) {
        tools.push(
          {
            name: "submit_gde_content_creation",
            description: "Submit a content creation activity to Google GDE program (Advocu)",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 3, maxLength: 200 },
                description: { type: "string", maxLength: 2000 },
                activityDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                contentType: { type: "string", enum: Object.values(ContentType) },
                tags: { type: "array", items: { type: "string" }, minItems: 0 },
                metrics: {
                  type: "object",
                  properties: { readers: { type: "integer", minimum: 1 } },
                  required: ["readers"],
                },
                activityUrl: { type: "string", maxLength: 500, pattern: "^https?://.*" },
                additionalInfo: { type: "string", maxLength: 2000 },
                private: { type: "boolean" },
              },
              required: ["title", "description", "activityDate", "contentType", "metrics", "activityUrl"],
            },
          },
          {
            name: "list_gde_activities",
            description:
              "List your existing GDE activities from Advocu (read-only), sorted by submission date in ascending order. Supports date filters and pagination; set fetchAll to retrieve every page.",
            inputSchema: {
              type: "object",
              properties: {
                from: {
                  type: "string",
                  pattern: ISO_DATE_TIME_PATTERN,
                  description: "Filter by submission date from (inclusive), e.g. 2026-01-01T00:00:00Z",
                },
                to: {
                  type: "string",
                  pattern: ISO_DATE_TIME_PATTERN,
                  description: "Filter by submission date to (exclusive), e.g. 2027-01-01T00:00:00Z",
                },
                updatedAfter: {
                  type: "string",
                  pattern: ISO_DATE_TIME_PATTERN,
                  description: "Filter activities updated after this date, e.g. 2026-01-01T00:00:00Z",
                },
                page: { type: "integer", minimum: 0, default: 0, description: "Page number (cannot be negative)" },
                size: {
                  type: "integer",
                  minimum: 1,
                  maximum: 100,
                  default: 10,
                  description: "Page size (1-100). Defaults to 100 when fetchAll is true.",
                },
                fetchAll: {
                  type: "boolean",
                  default: false,
                  description: `Automatically fetch every page starting at \`page\` (up to ${GDE_MAX_PAGES} pages)`,
                },
              },
              required: [],
            },
          },
          // Add other GDE tools...
        );
      }

      // Add documentation tools (always available)
      tools.push(
        {
          name: "list_documentation",
          description: "List all available documentation resources",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_documentation",
          description: "Get a specific documentation file by name",
          inputSchema: {
            type: "object",
            properties: {
              documentName: {
                type: "string",
                enum: [
                  "api-reference",
                  "mvp-api-reference",
                  "mvp-fixes-changelog",
                  "error-handling",
                  "mcp-resources",
                ],
                description: "Name of the documentation to retrieve",
              },
            },
            required: ["documentName"],
          },
        },
      );

      // Add MVP tools if enabled
      if (this.mvpEnabled) {
        tools.push(
          {
            name: "submit_mvp_video",
            description: "Submit a video activity to Microsoft MVP. Valid roles for videos: Host, Presenter, Speaker.",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 1, maxLength: 100 },
                description: { type: "string", maxLength: 1000 },
                date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                url: { type: "string", pattern: "^https?://.*" },
                targetAudience: {
                  type: "array",
                  items: { type: "string", enum: Object.values(MVPTargetAudience) },
                  minItems: 1,
                },
                role: {
                  type: "string",
                  enum: ["Host", "Presenter", "Speaker"],
                  description: "Valid roles for video activities"
                },
                technologyFocusArea: { type: "string", description: "Main technology area (e.g., 'Web Development', 'Cloud & AI')" },
                liveStreamViews: { type: "integer", minimum: 0 },
                onDemandViews: { type: "integer", minimum: 0 },
                numberOfSessions: { type: "integer", minimum: 1, default: 1 },
                isPrivate: { type: "boolean", default: false },
              },
              required: [
                "title",
                "description",
                "date",
                "url",
                "targetAudience",
                "role",
                "technologyFocusArea",
                "liveStreamViews",
                "onDemandViews",
              ],
            },
          },
          {
            name: "submit_mvp_blog",
            description: "Submit a blog post activity to Microsoft MVP",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 1, maxLength: 100 },
                description: { type: "string", maxLength: 1000 },
                date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                url: { type: "string", pattern: "^https?://.*" },
                targetAudience: {
                  type: "array",
                  items: { type: "string", enum: Object.values(MVPTargetAudience) },
                  minItems: 1,
                },
                role: { type: "string", enum: Object.values(MVPActivityRole) },
                technologyFocusArea: { type: "string" },
                additionalTechnologyAreas: { type: "array", items: { type: "string" } },
                numberOfViews: { type: "integer", minimum: 0 },
                subscriberBase: { type: "integer", minimum: 0 },
                isPrivate: { type: "boolean", default: false },
              },
              required: [
                "title",
                "description",
                "date",
                "url",
                "targetAudience",
                "role",
                "technologyFocusArea",
                "numberOfViews",
              ],
            },
          },
          {
            name: "submit_mvp_speaking",
            description: "Submit a speaking/conference activity to Microsoft MVP",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 1, maxLength: 100 },
                description: { type: "string", maxLength: 1000 },
                date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                url: { type: "string", pattern: "^https?://.*" },
                targetAudience: {
                  type: "array",
                  items: { type: "string", enum: Object.values(MVPTargetAudience) },
                  minItems: 1,
                },
                role: { type: "string", enum: Object.values(MVPActivityRole) },
                technologyFocusArea: { type: "string" },
                additionalTechnologyAreas: { type: "array", items: { type: "string" } },
                inPersonAttendees: { type: "integer", minimum: 0 },
                numberOfSessions: { type: "integer", minimum: 1, default: 1 },
                liveStreamViews: { type: "integer", minimum: 0 },
                onDemandViews: { type: "integer", minimum: 0 },
                isPrivate: { type: "boolean", default: false },
              },
              required: [
                "title",
                "description",
                "date",
                "url",
                "targetAudience",
                "role",
                "technologyFocusArea",
                "inPersonAttendees",
                "numberOfSessions",
              ],
            },
          },
        );
      }

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Documentation tools
        if (name === "list_documentation") {
          return await this.listDocumentation();
        }
        if (name === "get_documentation") {
          return await this.getDocumentation(args as { documentName: string });
        }

        // MVP tools
        if (name.startsWith("submit_mvp_")) {
          if (!this.mvpEnabled) {
            throw new McpError(ErrorCode.InvalidRequest, "MVP tools are not enabled. Please configure MVP credentials.");
          }
          switch (name) {
            case "submit_mvp_video":
              return await this.submitMVPVideoActivity(args as unknown as MVPVideoActivity);
            case "submit_mvp_blog":
              return await this.submitMVPBlogActivity(args as unknown as MVPBlogActivity);
            case "submit_mvp_speaking":
              return await this.submitMVPSpeakingActivity(args as unknown as MVPSpeakingActivity);
          }
        }

        // GDE tools
        if (name === "list_gde_activities") {
          if (!this.gdeEnabled) {
            throw new McpError(ErrorCode.InvalidRequest, "GDE tools are not enabled. Please configure GDE credentials.");
          }
          return await this.listGDEActivities((args ?? {}) as ListGDEActivitiesParams);
        }

        if (name.startsWith("submit_gde_")) {
          if (!this.gdeEnabled) {
            throw new McpError(ErrorCode.InvalidRequest, "GDE tools are not enabled. Please configure GDE credentials.");
          }
          switch (name) {
            case "submit_gde_content_creation":
              return await this.submitGDEActivityDraft("content-creation", args as unknown as ContentCreationDraft);
            // Add other GDE handlers...
          }
        }

        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        const errorMsg = this.getErrorMessage(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to execute tool '${name}': ${errorMsg}`
        );
      }
    });
  }

  private setupResourceHandlers() {
    // List available documentation resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: DOCUMENTATION_RESOURCES.map((doc) => ({
          uri: doc.uri,
          name: doc.name,
          description: doc.description,
          mimeType: doc.mimeType,
        })),
      };
    });

    // Read a specific documentation resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      // Find the requested resource
      const resource = DOCUMENTATION_RESOURCES.find((doc) => doc.uri === uri);

      if (!resource) {
        throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }

      try {
        // Read the file from the docs directory
        const filePath = join(DOCS_DIR, resource.file);
        const content = await readFile(filePath, "utf-8");

        return {
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType,
              text: content,
            },
          ],
        };
      } catch (error) {
        const errorMsg = this.getErrorMessage(error);
        throw new McpError(ErrorCode.InternalError, `Failed to read resource '${resource.name}': ${errorMsg}`);
      }
    });
  }

  // Documentation Tools
  private async listDocumentation() {
    const docsList = DOCUMENTATION_RESOURCES.map((doc) => ({
      name: doc.uri.replace("docs://", ""),
      title: doc.name,
      description: doc.description,
    }));

    return {
      content: [
        {
          type: "text",
          text: `📚 Available Documentation:\n\n${docsList
            .map((doc, i) => `${i + 1}. **${doc.title}** (${doc.name})\n   ${doc.description}`)
            .join("\n\n")}`,
        },
      ],
    };
  }

  private async getDocumentation(args: { documentName: string }) {
    const { documentName } = args;
    const uri = `docs://${documentName}`;

    // Find the resource
    const resource = DOCUMENTATION_RESOURCES.find((doc) => doc.uri === uri);

    if (!resource) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Documentation not found: ${documentName}\n\nAvailable docs: ${DOCUMENTATION_RESOURCES.map((d) => d.uri.replace("docs://", "")).join(", ")}`,
          },
        ],
      };
    }

    try {
      // Read the file
      const filePath = join(DOCS_DIR, resource.file);
      const content = await readFile(filePath, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `# ${resource.name}\n\n${content}`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = this.getErrorMessage(error);
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to read ${resource.name}: ${errorMsg}`,
          },
        ],
      };
    }
  }

  // MVP Methods
  private async submitMVPVideoActivity(data: Partial<MVPVideoActivity>) {
    const activity: MVPVideoActivity = {
      id: 0,
      activityTypeName: MVPActivityType.VIDEO,
      typeName: "Video",
      date: new Date(data.date!).toISOString(),
      description: data.description!,
      isPrivate: data.isPrivate ?? false,
      targetAudience: data.targetAudience!,
      tenant: "MVP",
      title: data.title!,
      url: data.url!,
      userProfileId: this.mvpUserProfileId!,
      role: data.role!,
      technologyFocusArea: data.technologyFocusArea!,
      additionalTechnologyAreas: [],
      liveStreamViews: data.liveStreamViews!,
      onDemandViews: data.onDemandViews!,
      numberOfSessions: data.numberOfSessions ?? 1,
      inPersonAttendees: 0,
      subscriberBase: 0,
      imageUrl: "",
    };

    return await this.submitMVPActivity(activity);
  }

  private async submitMVPBlogActivity(data: Partial<MVPBlogActivity>) {
    const activity: MVPBlogActivity = {
      id: 0,
      activityTypeName: MVPActivityType.BLOG,
      typeName: "Blog",
      date: new Date(data.date!).toISOString(),
      description: data.description!,
      isPrivate: data.isPrivate ?? false,
      targetAudience: data.targetAudience!,
      tenant: "MVP",
      title: data.title!,
      url: data.url!,
      userProfileId: this.mvpUserProfileId!,
      role: data.role!,
      technologyFocusArea: data.technologyFocusArea!,
      additionalTechnologyAreas: data.additionalTechnologyAreas,
      numberOfViews: data.numberOfViews!,
      subscriberBase: data.subscriberBase ?? 0,
      imageUrl: "",
    };

    return await this.submitMVPActivity(activity);
  }

  private async submitMVPSpeakingActivity(data: Partial<MVPSpeakingActivity>) {
    const activity: MVPSpeakingActivity = {
      id: 0,
      activityTypeName: MVPActivityType.SPEAKING_CONFERENCE,
      typeName: "Speaking",
      date: new Date(data.date!).toISOString(),
      description: data.description!,
      isPrivate: data.isPrivate ?? false,
      targetAudience: data.targetAudience!,
      tenant: "MVP",
      title: data.title!,
      url: data.url!,
      userProfileId: this.mvpUserProfileId!,
      role: data.role!,
      technologyFocusArea: data.technologyFocusArea!,
      additionalTechnologyAreas: data.additionalTechnologyAreas,
      inPersonAttendees: data.inPersonAttendees!,
      numberOfSessions: data.numberOfSessions ?? 1,
      liveStreamViews: data.liveStreamViews ?? 0,
      onDemandViews: data.onDemandViews ?? 0,
      imageUrl: "",
    };

    return await this.submitMVPActivity(activity);
  }

  private async submitMVPActivity(activity: MVPVideoActivity | MVPBlogActivity | MVPSpeakingActivity) {
    const url = `${this.mvpBaseUrl}/Activities/`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.mvpAccessToken}`,
        },
        body: JSON.stringify({ activity }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `MVP API error (${response.status})`;

        if (response.status === 401) {
          errorMessage = "❌ MVP authentication failed. Your MVP_ACCESS_TOKEN may be expired or invalid.\n\nTo fix:\n1. Log in to https://mvp.microsoft.com/\n2. Open DevTools → Network tab\n3. Create/edit an activity\n4. Export as HAR file\n5. Extract the Bearer token from Authorization header\n6. Update your configuration";
        } else if (response.status === 400) {
          errorMessage = `❌ MVP API rejected the request:\n\n${errorText}\n\nPlease check:\n- Activity type is correct for the data provided\n- Role is valid for this activity type\n- All required fields are present\n- Date format is correct (YYYY-MM-DD)`;
        } else if (response.status === 429) {
          errorMessage = "⏱️ MVP API rate limit exceeded. Please wait a moment and try again.";
        } else {
          errorMessage = `❌ MVP API error (${response.status}):\n\n${errorText}`;
        }

        // Return error as content instead of throwing
        return {
          content: [
            {
              type: "text",
              text: errorMessage,
            },
          ],
        };
      }

      const result = (await response.json()) as Record<string, unknown>;

      return {
        content: [
          {
            type: "text",
            text: `✅ MVP Activity submitted!\n\nType: ${activity.activityTypeName}\nTitle: ${activity.title}\n\nResponse: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMsg = this.getErrorMessage(error);
      throw new McpError(
        ErrorCode.InternalError,
        `❌ Failed to submit MVP activity:\n\n${errorMsg}\n\nActivity type: ${activity.activityTypeName}\nTitle: ${activity.title}`
      );
    }
  }

  // GDE Methods

  /**
   * Build a user-friendly error message for a failed GDE (Advocu) API response
   */
  private buildGDEErrorMessage(status: number, errorText: string, badRequestHint: string): string {
    switch (status) {
      case 401:
        return "❌ GDE authentication failed. Your ADVOCU_ACCESS_TOKEN may be expired or invalid.\n\nPlease check your Advocu access token configuration.";
      case 400:
        return `❌ GDE API rejected the request:\n\n${errorText}\n\nPlease check:\n${badRequestHint}`;
      case 429:
        return "⏱️ GDE API rate limit exceeded (30 requests/minute). Please wait and try again.";
      default:
        return `❌ GDE API error (${status}):\n\n${errorText}`;
    }
  }

  private toTextResult(text: string) {
    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }

  /**
   * Fetch a single page of activities from `GET /activities`
   */
  private async fetchGDEActivitiesPage(
    params: ListGDEActivitiesParams,
    page: number,
    size: number,
  ): Promise<GDEActivitiesPageResult> {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.updatedAfter) query.set("updatedAfter", params.updatedAfter);

    const response = await fetch(`${this.gdeBaseUrl}/activities?${query.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.gdeAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        error: this.buildGDEErrorMessage(
          response.status,
          errorText,
          "- Dates use ISO-8601 UTC format (e.g. 2026-01-01T00:00:00Z)\n- `page` is >= 0 and `size` is between 1 and 100",
        ),
      };
    }

    return { ok: true, data: (await response.json()) as GDEActivitiesPage };
  }

  /**
   * List existing GDE activities, optionally fetching every page
   */
  private async listGDEActivities(params: ListGDEActivitiesParams) {
    const startPage = params.page ?? 0;
    const size = params.size ?? (params.fetchAll ? 100 : 10);

    if (!Number.isInteger(startPage) || startPage < 0) {
      return this.toTextResult("❌ Invalid `page`: it must be an integer greater than or equal to 0.");
    }
    if (!Number.isInteger(size) || size < 1 || size > 100) {
      return this.toTextResult("❌ Invalid `size`: it must be an integer between 1 and 100.");
    }

    if (!params.fetchAll) {
      const result = await this.fetchGDEActivitiesPage(params, startPage, size);
      return this.toTextResult(result.ok ? JSON.stringify(result.data, null, 2) : result.error);
    }

    const activities: GDEActivity[] = [];
    let pagesFetched = 0;
    let truncated = false;
    let error: string | undefined;

    while (true) {
      if (pagesFetched >= GDE_MAX_PAGES) {
        truncated = true;
        break;
      }

      let result: GDEActivitiesPageResult;
      try {
        result = await this.fetchGDEActivitiesPage(params, startPage + pagesFetched, size);
      } catch (fetchError) {
        // Nothing fetched yet: let the tool handler report the failure
        if (pagesFetched === 0) throw fetchError;
        result = { ok: false, error: `❌ Failed to reach the GDE API: ${this.getErrorMessage(fetchError)}` };
      }

      if (!result.ok) {
        if (pagesFetched === 0) return this.toTextResult(result.error);
        // Keep the activities already fetched and report the error alongside them
        error = result.error;
        break;
      }

      const pageContent = Array.isArray(result.data.content) ? result.data.content : [];
      activities.push(...pageContent);
      pagesFetched++;

      if (pageContent.length < size || result.data.last === true) break;
    }

    const summary = {
      content: activities,
      totalFetched: activities.length,
      pagesFetched,
      truncated,
      // Page to request next to continue where this call stopped
      ...(truncated || error ? { nextPage: startPage + pagesFetched } : {}),
      ...(error ? { error } : {}),
    };

    return this.toTextResult(JSON.stringify(summary, null, 2));
  }

  private async submitGDEActivityDraft(endpoint: string, data: ContentCreationDraft) {
    const url = `${this.gdeBaseUrl}/activity-drafts/${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.gdeAccessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = this.buildGDEErrorMessage(
          response.status,
          errorText,
          "- All required fields are present\n- Field values match expected formats\n- Tags are valid\n- Date format is correct (YYYY-MM-DD)",
        );

        // Return error as content instead of throwing
        return {
          content: [
            {
              type: "text",
              text: errorMessage,
            },
          ],
        };
      }

      const result = (await response.json()) as Record<string, unknown>;

      return {
        content: [
          {
            type: "text",
            text: `✅ GDE Activity submitted!\n\nEndpoint: ${endpoint}\n\nResponse: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMsg = this.getErrorMessage(error);
      throw new McpError(
        ErrorCode.InternalError,
        `❌ Failed to submit GDE activity:\n\n${errorMsg}\n\nEndpoint: ${endpoint}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("🚀 Unified Activity Reporting MCP Server running");
  }
}
