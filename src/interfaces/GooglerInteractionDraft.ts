/**
 * @fileoverview Googler interaction activity draft interface
 * @description Interface for direct interactions with Google personnel
 */

import type { InteractionFormat } from "../types/InteractionFormat.js";
import type { InteractionType } from "../types/InteractionType.js";
import type { ActivityDraftBase } from "./ActivityDraftBase.js";

/**
 * Interface for Googler interaction activity drafts
 * Used for direct interactions with Google team members
 */
export interface GooglerInteractionDraft extends ActivityDraftBase {
  /** Format of the interaction */
  format: InteractionFormat;
  /** Type of interaction with Google personnel */
  interactionType: InteractionType;
  /** Metrics related to time investment */
  metrics: {
    /** Time spent in the interaction (in minutes) */
    timeSpent: number;
  };
  /** Optional additional links related to the interaction */
  additionalLinks?: string;
}
