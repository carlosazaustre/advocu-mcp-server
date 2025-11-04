/**
 * @fileoverview Base interface for Microsoft MVP activity submissions
 * @description Common properties shared by all MVP activity types
 */

/**
 * Base interface for all MVP activity submissions
 * Contains the common properties that all activity types must have
 */
export interface MVPActivityBase {
  /** Unique identifier (0 for new activities) */
  id: number;
  /** Type of activity */
  activityTypeName: string;
  /** Display type name */
  typeName?: string;
  /** Date when the activity took place (ISO 8601 format) */
  date: string;
  /** Full description of the activity and its impact */
  description: string;
  /** Whether to make the activity private */
  isPrivate: boolean;
  /** Target audience for the activity */
  targetAudience: string[];
  /** Tenant identifier (always "MVP") */
  tenant: string;
  /** Title of the activity */
  title: string;
  /** URL to the activity */
  url: string;
  /** User profile ID from MVP portal */
  userProfileId: number;
  /** Your role in the activity */
  role: string;
  /** Primary technology focus area */
  technologyFocusArea: string;
  /** Additional technology areas (optional) */
  additionalTechnologyAreas?: string[];
  /** Image URL (optional) */
  imageUrl?: string;
}
