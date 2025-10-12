/**
 * @fileoverview Book/E-book MVP activity interface
 * @description Interface for book and e-book activities
 */

import type { MVPActivityBase } from "./MVPActivityBase.js";

/**
 * Interface for Book/E-book activities
 * Used for books, e-books, and published materials
 */
export interface MVPBookActivity extends MVPActivityBase {
  /** Number of copies sold or distributed */
  copiesSold?: number;
  /** Subscriber base or reader count */
  subscriberBase?: number;
}
