/**
 * @fileoverview Speaking/Conference MVP activity interface
 * @description Interface for speaking engagements, conferences, and presentations
 */

import type { MVPActivityBase } from "./MVPActivityBase.js";

/**
 * Interface for Speaking activities
 * Used for conference talks, presentations, and speaking engagements
 */
export interface MVPSpeakingActivity extends MVPActivityBase {
  /** Number of in-person attendees */
  inPersonAttendees: number;
  /** Number of sessions */
  numberOfSessions: number;
  /** Livestream views (if streamed) */
  liveStreamViews?: number;
  /** On-demand views (if recorded) */
  onDemandViews?: number;
}
