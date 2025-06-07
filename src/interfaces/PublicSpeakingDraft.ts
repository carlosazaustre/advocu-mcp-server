/**
 * @fileoverview Public speaking activity draft interface
 * @description Interface for talks, conferences, and public presentations
 */

import type { Country } from "../types/Country.js";
import type { EventFormat } from "../types/EventFormat.js";
import type { ActivityDraftBase } from "./ActivityDraftBase.js";

/**
 * Interface for public speaking activity drafts
 * Used for talks, conferences, and public presentations
 */
export interface PublicSpeakingDraft extends ActivityDraftBase {
  /** Metrics related to attendance */
  metrics: {
    /** Total number of people who attended the session */
    attendees: number;
  };
  /** Format of the event (In-Person, Virtual, or Hybrid) */
  eventFormat: EventFormat;
  /** Country where the event took place (required if eventFormat is In-Person or Hybrid) */
  country?: Country;
  /** Number of in-person attendees (required if eventFormat is Hybrid or In-Person) */
  inPersonAttendees?: number;
  /** URL link to the event or presentation */
  activityUrl: string;
}
