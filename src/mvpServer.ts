/**
 * @fileoverview Microsoft MVP Activity Reporting Server
 * @description MCP server implementation for Microsoft MVP activity submissions
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";

import type { MVPVideoActivity, MVPBlogActivity, MVPSpeakingActivity, MVPBookActivity } from "./interfaces/mvp/index.js";
import { MVPActivityType, MVPActivityRole, MVPTargetAudience } from "./types/mvp/index.js";

export class MVPActivityReportingServer {
  private readonly server: Server;
  private readonly accessToken: string;
  private readonly userProfileId: number;
  private readonly baseUrl = process.env.MVP_API_URL ?? "https://mavenapi-prod.azurewebsites.net/api";

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
        name: "mvp-activity-reporting-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.accessToken = process.env.MVP_ACCESS_TOKEN ?? "";
    if (!this.accessToken) {
      console.error("MVP_ACCESS_TOKEN is not set. Please set it in your environment variables.");
      throw new Error("MVP_ACCESS_TOKEN is required for MVP functionality");
    }

    const profileId = process.env.MVP_USER_PROFILE_ID ?? "";
    if (!profileId) {
      console.error("MVP_USER_PROFILE_ID is not set. Please set it in your environment variables.");
      throw new Error("MVP_USER_PROFILE_ID is required for MVP functionality");
    }
    this.userProfileId = Number.parseInt(profileId, 10);

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "submit_mvp_video",
            description: "Submit a video/webinar/online training/livestream activity to Microsoft MVP",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Title of the video/webinar",
                  minLength: 1,
                  maxLength: 100,
                },
                description: {
                  type: "string",
                  description: "Description and impact of the activity",
                  maxLength: 1000,
                },
                date: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Publication date (YYYY-MM-DD format)",
                },
                url: {
                  type: "string",
                  pattern: "^https?://.*",
                  description: "URL to the video/webinar",
                },
                targetAudience: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: Object.values(MVPTargetAudience),
                  },
                  description: "Target audience for the activity",
                  minItems: 1,
                },
                role: {
                  type: "string",
                  enum: Object.values(MVPActivityRole),
                  description: "Your role in the activity",
                },
                technologyFocusArea: {
                  type: "string",
                  description: "Primary technology focus area",
                },
                additionalTechnologyAreas: {
                  type: "array",
                  items: { type: "string" },
                  description: "Additional technology areas (optional)",
                },
                liveStreamViews: {
                  type: "integer",
                  minimum: 0,
                  description: "Number of livestream views",
                },
                onDemandViews: {
                  type: "integer",
                  minimum: 0,
                  description: "Number of on-demand views",
                },
                numberOfSessions: {
                  type: "integer",
                  minimum: 1,
                  description: "Number of sessions",
                  default: 1,
                },
                isPrivate: {
                  type: "boolean",
                  description: "Make activity private (optional)",
                  default: false,
                },
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
            description: "Submit a blog post or article activity to Microsoft MVP",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Title of the blog post",
                  minLength: 1,
                  maxLength: 100,
                },
                description: {
                  type: "string",
                  description: "Description and impact of the activity",
                  maxLength: 1000,
                },
                date: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Publication date (YYYY-MM-DD format)",
                },
                url: {
                  type: "string",
                  pattern: "^https?://.*",
                  description: "URL to the blog post",
                },
                targetAudience: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: Object.values(MVPTargetAudience),
                  },
                  description: "Target audience for the activity",
                  minItems: 1,
                },
                role: {
                  type: "string",
                  enum: Object.values(MVPActivityRole),
                  description: "Your role in the activity",
                },
                technologyFocusArea: {
                  type: "string",
                  description: "Primary technology focus area",
                },
                additionalTechnologyAreas: {
                  type: "array",
                  items: { type: "string" },
                  description: "Additional technology areas (optional)",
                },
                numberOfViews: {
                  type: "integer",
                  minimum: 0,
                  description: "Number of views",
                },
                subscriberBase: {
                  type: "integer",
                  minimum: 0,
                  description: "Subscriber base (optional)",
                },
                isPrivate: {
                  type: "boolean",
                  description: "Make activity private (optional)",
                  default: false,
                },
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
            description: "Submit a speaking engagement/conference activity to Microsoft MVP",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Title of the presentation/talk",
                  minLength: 1,
                  maxLength: 100,
                },
                description: {
                  type: "string",
                  description: "Description and impact of the activity",
                  maxLength: 1000,
                },
                date: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Event date (YYYY-MM-DD format)",
                },
                url: {
                  type: "string",
                  pattern: "^https?://.*",
                  description: "URL to the event or slides",
                },
                targetAudience: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: Object.values(MVPTargetAudience),
                  },
                  description: "Target audience for the activity",
                  minItems: 1,
                },
                role: {
                  type: "string",
                  enum: Object.values(MVPActivityRole),
                  description: "Your role in the activity",
                },
                technologyFocusArea: {
                  type: "string",
                  description: "Primary technology focus area",
                },
                additionalTechnologyAreas: {
                  type: "array",
                  items: { type: "string" },
                  description: "Additional technology areas (optional)",
                },
                inPersonAttendees: {
                  type: "integer",
                  minimum: 0,
                  description: "Number of in-person attendees",
                },
                numberOfSessions: {
                  type: "integer",
                  minimum: 1,
                  description: "Number of sessions",
                  default: 1,
                },
                liveStreamViews: {
                  type: "integer",
                  minimum: 0,
                  description: "Livestream views (if streamed)",
                },
                onDemandViews: {
                  type: "integer",
                  minimum: 0,
                  description: "On-demand views (if recorded)",
                },
                isPrivate: {
                  type: "boolean",
                  description: "Make activity private (optional)",
                  default: false,
                },
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
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "submit_mvp_video":
            return await this.submitVideoActivity(args as unknown as MVPVideoActivity);
          case "submit_mvp_blog":
            return await this.submitBlogActivity(args as unknown as MVPBlogActivity);
          case "submit_mvp_speaking":
            return await this.submitSpeakingActivity(args as unknown as MVPSpeakingActivity);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
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

  private async submitVideoActivity(data: Partial<MVPVideoActivity>): Promise<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }> {
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
      userProfileId: this.userProfileId,
      role: data.role!,
      technologyFocusArea: data.technologyFocusArea!,
      additionalTechnologyAreas: [],
      liveStreamViews: data.liveStreamViews!,
      onDemandViews: data.onDemandViews!,
      numberOfSessions: data.numberOfSessions ?? 1,
      inPersonAttendees: 0,
      subscriberBase: data.subscriberBase ?? 0,
      imageUrl: "",
    };

    return await this.submitActivity(activity);
  }

  private async submitBlogActivity(data: Partial<MVPBlogActivity>): Promise<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }> {
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
      userProfileId: this.userProfileId,
      role: data.role!,
      technologyFocusArea: data.technologyFocusArea!,
      additionalTechnologyAreas: data.additionalTechnologyAreas,
      numberOfViews: data.numberOfViews!,
      subscriberBase: data.subscriberBase ?? 0,
      imageUrl: "",
    };

    return await this.submitActivity(activity);
  }

  private async submitSpeakingActivity(data: Partial<MVPSpeakingActivity>): Promise<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }> {
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
      userProfileId: this.userProfileId,
      role: data.role!,
      technologyFocusArea: data.technologyFocusArea!,
      additionalTechnologyAreas: data.additionalTechnologyAreas,
      inPersonAttendees: data.inPersonAttendees!,
      numberOfSessions: data.numberOfSessions ?? 1,
      liveStreamViews: data.liveStreamViews ?? 0,
      onDemandViews: data.onDemandViews ?? 0,
      imageUrl: "",
    };

    return await this.submitActivity(activity);
  }

  private async submitActivity(
    activity: MVPVideoActivity | MVPBlogActivity | MVPSpeakingActivity | MVPBookActivity,
  ): Promise<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }> {
    const url = `${this.baseUrl}/Activities/`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
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
            text: `✅ MVP Activity submitted successfully!\n\nActivity: ${activity.activityTypeName}\nTitle: ${activity.title}\nStatus: ${response.status}\nResponse: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      const errorMsg = this.getErrorMessage(error);
      throw new McpError(
        ErrorCode.InternalError,
        `❌ Failed to submit MVP activity:\n\n${errorMsg}\n\nActivity type: ${activity.activityTypeName}\nTitle: ${activity.title}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MVP Activity Reporting MCP server running on stdio");
  }
}
