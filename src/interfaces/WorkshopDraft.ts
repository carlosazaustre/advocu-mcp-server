/**
 * @fileoverview Workshop activity draft interface
 * @description Interface for training workshops and educational sessions
 */

import type { Country } from "../types/Country.js";
import type { EventFormat } from "../types/EventFormat.js";
import type { ActivityDraftBase } from "./ActivityDraftBase.js";

/**
 * Interface for workshop activity drafts
 * Used for training workshops and educational sessions
 */
export interface WorkshopDraft extends ActivityDraftBase {
  /** Metrics related to training reach */
  metrics: {
    /** Number of people who have been trained */
    attendees: number;
  };
  /** Format of the event (In-Person, Virtual, or Hybrid) */
  eventFormat: EventFormat;
  /** Country where the event took place (required if eventFormat is In-Person or Hybrid) */
  country?: Country;
  /** Number of in-person attendees (required if eventFormat is Hybrid or In-Person) */
  inPersonAttendees?: number;
  /** URL link to the workshop or event */
  activityUrl: string;
}
