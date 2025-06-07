import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";

// Import shared domain types and enums
import type {
  ContentCreationDraft,
  GooglerInteractionDraft,
  MentoringDraft,
  ProductFeedbackDraft,
  PublicSpeakingDraft,
  StoryDraft,
  WorkshopDraft,
} from "./interfaces";
import {
  ContentType,
  Country,
  EventFormat,
  InteractionFormat,
  InteractionType,
  ProductFeedbackContentType,
  SignificanceType,
} from "./types";

export class ActivityReportingServer {
  private readonly server: Server;
  private readonly accessToken: string;
  private readonly baseUrl = process.env.ADVOCU_API_URL ?? "https://api.advocu.com/personal-api/v1/gde";

  constructor() {
    this.server = new Server(
      {
        name: "activity-reporting-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.accessToken = process.env.ADVOCU_ACCESS_TOKEN ?? "";
    if (!this.accessToken) {
      console.error("ADVOCU_ACCESS_TOKEN is not set. Please set it in your environment variables.");
      process.exit(1);
    }

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "submit_content_creation",
            description: "Submit a content creation activity draft",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "What was the title?",
                  minLength: 3,
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  description: "What was it about?",
                  maxLength: 2000,
                },
                activityDate: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Date published (YYYY-MM-DD format)",
                },
                contentType: {
                  type: "string",
                  description: "Content type",
                  enum: Object.values(ContentType),
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags (optional)",
                  minItems: 0,
                },
                metrics: {
                  type: "object",
                  properties: {
                    readers: {
                      type: "integer",
                      minimum: 1,
                      description: "How many people read your content?",
                    },
                  },
                  required: ["readers"],
                },
                activityUrl: {
                  type: "string",
                  maxLength: 500,
                  pattern: "^https?://.*",
                  description: "Link to Content",
                },
                additionalInfo: {
                  type: "string",
                  maxLength: 2000,
                  description: "Additional information (optional)",
                },
                private: {
                  type: "boolean",
                  description: "Do you want to make this activity private? (optional)",
                },
              },
              required: ["title", "description", "activityDate", "contentType", "metrics", "activityUrl"],
            },
          },
          {
            name: "submit_public_speaking",
            description: "Submit a public speaking activity draft",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "What was the title of your talk?",
                  minLength: 3,
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  description: "What was it about?",
                  maxLength: 2000,
                },
                activityDate: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Date of your talk (YYYY-MM-DD format)",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags (optional)",
                  minItems: 0,
                },
                metrics: {
                  type: "object",
                  properties: {
                    attendees: {
                      type: "integer",
                      minimum: 1,
                      description: "How many people attended your session in total?",
                    },
                  },
                  required: ["attendees"],
                },
                eventFormat: {
                  type: "string",
                  enum: Object.values(EventFormat),
                  description: "Select event format",
                },
                country: {
                  type: "string",
                  enum: Object.values(Country),
                  description: "Country (required if eventFormat is In-Person or Hybrid)",
                },
                inPersonAttendees: {
                  type: "integer",
                  minimum: 0,
                  description: "In-person attendees (required if eventFormat is Hybrid or In-Person)",
                },
                activityUrl: {
                  type: "string",
                  maxLength: 500,
                  pattern: "^https?://.*",
                  description: "Event link or relevant URL",
                },
                additionalInfo: {
                  type: "string",
                  maxLength: 2000,
                  description: "Additional information (optional)",
                },
                private: {
                  type: "boolean",
                  description: "Do you want to make this activity private? (optional)",
                },
              },
              required: ["title", "description", "activityDate", "metrics", "eventFormat", "activityUrl"],
            },
          },
          {
            name: "submit_workshop",
            description: "Submit a workshop activity draft",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "What was the name of your workshop session?",
                  minLength: 3,
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  description: "What was it about?",
                  maxLength: 2000,
                },
                activityDate: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Date of your workshop (YYYY-MM-DD format)",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags (optional)",
                  minItems: 0,
                },
                metrics: {
                  type: "object",
                  properties: {
                    attendees: {
                      type: "integer",
                      minimum: 1,
                      description: "How many people have been trained?",
                    },
                  },
                  required: ["attendees"],
                },
                eventFormat: {
                  type: "string",
                  enum: Object.values(EventFormat),
                  description: "Select event format",
                },
                country: {
                  type: "string",
                  enum: Object.values(Country),
                  description: "Country (required if eventFormat is In-Person or Hybrid)",
                },
                inPersonAttendees: {
                  type: "integer",
                  minimum: 0,
                  description: "In-person attendees (required if eventFormat is Hybrid or In-Person)",
                },
                activityUrl: {
                  type: "string",
                  maxLength: 500,
                  pattern: "^https?://.*",
                  description: "Workshop/event link",
                },
                additionalInfo: {
                  type: "string",
                  maxLength: 2000,
                  description: "Additional information (optional)",
                },
                private: {
                  type: "boolean",
                  description: "Do you want to make this activity private? (optional)",
                },
              },
              required: ["title", "description", "activityDate", "metrics", "eventFormat", "activityUrl"],
            },
          },
          {
            name: "submit_mentoring",
            description: "Submit a mentoring activity draft",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "What was the name of your mentoring session?",
                  minLength: 3,
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  description: "What was it about?",
                  maxLength: 2000,
                },
                activityDate: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Date of your mentoring session (YYYY-MM-DD format)",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags (optional)",
                  minItems: 0,
                },
                metrics: {
                  type: "object",
                  properties: {
                    attendees: {
                      type: "integer",
                      minimum: 1,
                      description: "How many people have been mentored in total?",
                    },
                  },
                  required: ["attendees"],
                },
                eventFormat: {
                  type: "string",
                  enum: Object.values(EventFormat),
                  description: "Select event format",
                },
                country: {
                  type: "string",
                  enum: Object.values(Country),
                  description: "Country (required if eventFormat is In-Person or Hybrid)",
                },
                inPersonAttendees: {
                  type: "integer",
                  minimum: 0,
                  description: "In-person attendees (required if eventFormat is Hybrid or In-Person)",
                },
                activityUrl: {
                  type: "string",
                  maxLength: 500,
                  pattern: "^https?://.*",
                  description: "Event or relevant link",
                },
                additionalInfo: {
                  type: "string",
                  maxLength: 2000,
                  description: "Additional information (optional)",
                },
                private: {
                  type: "boolean",
                  description: "Do you want to make this activity private? (optional)",
                },
              },
              required: ["title", "description", "activityDate", "metrics", "eventFormat", "activityUrl"],
            },
          },
          {
            name: "submit_product_feedback",
            description: "Submit a product feedback activity draft",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Title",
                  minLength: 3,
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  description: "Description",
                  maxLength: 2000,
                },
                activityDate: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Participation Date (YYYY-MM-DD format)",
                },
                contentType: {
                  type: "string",
                  enum: Object.values(ProductFeedbackContentType),
                  description: "Content type",
                },
                productDescription: {
                  type: "string",
                  maxLength: 500,
                  description: "What product was it about?",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags (optional)",
                  minItems: 0,
                },
                metrics: {
                  type: "object",
                  properties: {
                    timeSpent: {
                      type: "integer",
                      minimum: 1,
                      description: "Time spent (in minutes)",
                    },
                  },
                  required: ["timeSpent"],
                },
                additionalInfo: {
                  type: "string",
                  maxLength: 2000,
                  description: "Additional information (optional)",
                },
                private: {
                  type: "boolean",
                  description: "Do you want to make this activity private? (optional)",
                },
              },
              required: ["title", "description", "activityDate", "contentType", "productDescription", "metrics"],
            },
          },
          {
            name: "submit_googler_interaction",
            description: "Submit an interaction with Googlers activity draft",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Title",
                  minLength: 3,
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  description: "Description",
                  maxLength: 2000,
                },
                activityDate: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Interaction Date (YYYY-MM-DD format)",
                },
                format: {
                  type: "string",
                  enum: Object.values(InteractionFormat),
                  description: "Format",
                },
                interactionType: {
                  type: "string",
                  enum: Object.values(InteractionType),
                  description: "Interaction Type",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags (optional)",
                  minItems: 0,
                },
                metrics: {
                  type: "object",
                  properties: {
                    timeSpent: {
                      type: "integer",
                      minimum: 1,
                      description: "Time spent (in minutes)",
                    },
                  },
                  required: ["timeSpent"],
                },
                additionalInfo: {
                  type: "string",
                  maxLength: 2000,
                  description: "Additional information (optional)",
                },
                additionalLinks: {
                  type: "string",
                  maxLength: 2000,
                  description: "Additional links (optional)",
                },
                private: {
                  type: "boolean",
                  description: "Do you want to make this activity private? (optional)",
                },
              },
              required: ["title", "description", "activityDate", "format", "interactionType", "metrics"],
            },
          },
          {
            name: "submit_story",
            description: "Submit a story activity draft",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Title of the story",
                  minLength: 3,
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  description: "Description",
                  maxLength: 2000,
                },
                activityDate: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description: "Activity Date (YYYY-MM-DD format)",
                },
                whyIsSignificant: {
                  type: "string",
                  maxLength: 2000,
                  description: "Why is it significant",
                },
                significanceType: {
                  type: "string",
                  enum: Object.values(SignificanceType),
                  description: "Significance type",
                },
                activityUrl: {
                  type: "string",
                  maxLength: 500,
                  pattern: "^https?://.*",
                  description: "Link",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags (optional)",
                  minItems: 0,
                },
                metrics: {
                  type: "object",
                  properties: {
                    impact: {
                      type: "integer",
                      minimum: 1,
                      description: "Impact (views, reads, attendees, etc.)",
                    },
                  },
                  required: ["impact"],
                },
                additionalInfo: {
                  type: "string",
                  maxLength: 2000,
                  description: "Additional information (optional)",
                },
                private: {
                  type: "boolean",
                  description: "Do you want to make this activity private? (optional)",
                },
              },
              required: [
                "title",
                "description",
                "activityDate",
                "whyIsSignificant",
                "significanceType",
                "activityUrl",
                "metrics",
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
          case "submit_content_creation":
            return await this.submitActivityDraft("content-creation", args as unknown as ContentCreationDraft);
          case "submit_public_speaking":
            return await this.submitActivityDraft("public-speaking", args as unknown as PublicSpeakingDraft);
          case "submit_workshop":
            return await this.submitActivityDraft("workshop", args as unknown as WorkshopDraft);
          case "submit_mentoring":
            return await this.submitActivityDraft("mentoring", args as unknown as MentoringDraft);
          case "submit_product_feedback":
            return await this.submitActivityDraft("product-feedback-given", args as unknown as ProductFeedbackDraft);
          case "submit_googler_interaction":
            return await this.submitActivityDraft(
              "interaction-with-googlers",
              args as unknown as GooglerInteractionDraft,
            );
          case "submit_story":
            return await this.submitActivityDraft("stories", args as unknown as StoryDraft);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Error executing tool: ${error}`);
      }
    });
  }

  private async submitActivityDraft(
    endpoint: string,
    data:
      | ContentCreationDraft
      | PublicSpeakingDraft
      | WorkshopDraft
      | MentoringDraft
      | ProductFeedbackDraft
      | GooglerInteractionDraft
      | StoryDraft,
  ): Promise<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }> {
    const url = `${this.baseUrl}/activity-drafts/${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new McpError(ErrorCode.InternalError, "Rate limit exceeded. Please try again later.");
        }

        const errorText = await response.text();
        throw new McpError(ErrorCode.InternalError, `API request failed: ${response.status} - ${errorText}`);
      }

      const result = (await response.json()) as Record<string, unknown>;

      return {
        content: [
          {
            type: "text",
            text: `Activity draft submitted successfully!\n\nEndpoint: ${endpoint}\nStatus: ${response.status}\nResponse: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(ErrorCode.InternalError, `Network error: ${error}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Activity Reporting MCP server running on stdio");
  }
}
