/**
 * @fileoverview Base interface for activity drafts
 * @description Common properties shared by all activity draft types
 */

/**
 * Base interface for all activity drafts
 * Contains the common properties that all activity types must have
 */
export interface ActivityDraftBase {
  /** Title of the activity */
  title: string;
  /** Description of what the activity was about */
  description: string;
  /** Date when the activity took place (YYYY-MM-DD format) */
  activityDate: string;
  /** Optional tags to categorize the activity */
  tags?: string[];
  /** Optional additional information about the activity */
  additionalInfo?: string;
  /** Whether to make the activity private (defaults to false) */
  private?: boolean;
}
