/**
 * @fileoverview Blog/Article MVP activity interface
 * @description Interface for blog posts and articles
 */

import type { MVPActivityBase } from "./MVPActivityBase.js";

/**
 * Interface for Blog/Article activities
 * Used for blog posts, articles, and written content
 */
export interface MVPBlogActivity extends MVPActivityBase {
  /** Number of views */
  numberOfViews: number;
  /** Subscriber base (if applicable) */
  subscriberBase?: number;
}
