/**
 * @fileoverview Story activity draft interface
 * @description Interface for stories and significant experiences
 */

import type { SignificanceType } from "../types/SignificanceType.js";
import type { ActivityDraftBase } from "./ActivityDraftBase.js";

/**
 * Interface for story activity drafts
 * Used for stories and significant experiences that impact the community
 */
export interface StoryDraft extends ActivityDraftBase {
  /** Explanation of why this story is significant */
  whyIsSignificant: string;
  /** Type of significance or impact category */
  significanceType: SignificanceType;
  /** URL link to the story or related content */
  activityUrl: string;
  /** Metrics related to impact */
  metrics: {
    /** Impact measurement (views, reads, attendees, etc.) */
    impact: number;
  };
}
