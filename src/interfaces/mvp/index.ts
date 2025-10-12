/**
 * @fileoverview MVP activity interfaces index
 * @description Exports all MVP activity interfaces
 */

export type { MVPActivityBase } from "./MVPActivityBase.js";
export type { MVPVideoActivity } from "./MVPVideoActivity.js";
export type { MVPBlogActivity } from "./MVPBlogActivity.js";
export type { MVPSpeakingActivity } from "./MVPSpeakingActivity.js";
export type { MVPBookActivity } from "./MVPBookActivity.js";

import type { MVPVideoActivity } from "./MVPVideoActivity.js";
import type { MVPBlogActivity } from "./MVPBlogActivity.js";
import type { MVPSpeakingActivity } from "./MVPSpeakingActivity.js";
import type { MVPBookActivity } from "./MVPBookActivity.js";

/**
 * Union type of all MVP activity types
 */
export type MVPActivity = MVPVideoActivity | MVPBlogActivity | MVPSpeakingActivity | MVPBookActivity;
