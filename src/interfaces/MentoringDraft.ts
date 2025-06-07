/**
 * @fileoverview Mentoring activity draft interface
 * @description Interface for mentoring sessions and guidance activities
 */

import type { Country } from "../types/Country.js";
import type { EventFormat } from "../types/EventFormat.js";
import type { ActivityDraftBase } from "./ActivityDraftBase.js";

/**
 * Interface for mentoring activity drafts
 * Used for mentoring sessions and guidance activities
 */
export interface MentoringDraft extends ActivityDraftBase {
  /** Metrics related to mentoring reach */
  metrics: {
    /** Number of people who have been mentored in total */
    attendees: number;
  };
  /** Format of the event (In-Person, Virtual, or Hybrid) */
  eventFormat: EventFormat;
  /** Country where the event took place (required if eventFormat is In-Person or Hybrid) */
  country?: Country;
  /** Number of in-person attendees (required if eventFormat is Hybrid or In-Person) */
  inPersonAttendees?: number;
  /** URL link to the event or relevant resource */
  activityUrl: string;
}
