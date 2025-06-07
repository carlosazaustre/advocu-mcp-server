/**
 * @fileoverview Product feedback activity draft interface
 * @description Interface for product feedback and testing activities
 */

import type { ProductFeedbackContentType } from "../types/ProductFeedbackContentType.js";
import type { ActivityDraftBase } from "./ActivityDraftBase.js";

/**
 * Interface for product feedback activity drafts
 * Used for early access programs and product feedback sessions
 */
export interface ProductFeedbackDraft extends ActivityDraftBase {
  /** Type of product feedback content */
  contentType: ProductFeedbackContentType;
  /** Description of what product the feedback was about */
  productDescription: string;
  /** Metrics related to time investment */
  metrics: {
    /** Time spent providing feedback (in minutes) */
    timeSpent: number;
  };
}
