/**
 * @fileoverview Content creation activity draft interface
 * @description Interface for content creation activities (articles, videos, etc.)
 */

import type { ContentType } from "../types/ContentType.js";
import type { ActivityDraftBase } from "./ActivityDraftBase.js";

/**
 * Interface for content creation activity drafts
 * Used for articles, books, videos, demos, and other published content
 */
export interface ContentCreationDraft extends ActivityDraftBase {
  /** Type of content created */
  contentType: ContentType;
  /** Metrics related to the content's reach */
  metrics: {
    /** Number of people who read/viewed the content */
    readers: number;
  };
  /** URL link to the published content */
  activityUrl: string;
}
