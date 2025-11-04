/**
 * @fileoverview Video/Webinar/Livestream MVP activity interface
 * @description Interface for video content activities
 */

import type { MVPActivityBase } from "./MVPActivityBase.js";

/**
 * Interface for Video/Webinar/Online Training/Livestream activities
 * Used for webcasts, online training, videos, and livestreams
 */
export interface MVPVideoActivity extends MVPActivityBase {
  /** Number of livestream views */
  liveStreamViews: number;
  /** Number of on-demand views */
  onDemandViews: number;
  /** Number of sessions/episodes */
  numberOfSessions: number;
  /** In-person attendees (usually 0 for online videos) */
  inPersonAttendees?: number;
  /** Subscriber base */
  subscriberBase?: number;
}
