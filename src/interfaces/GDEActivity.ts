/**
 * @fileoverview GDE activity read models
 * @description Types for activities returned by the Advocu `GET /activities` endpoint
 */

/**
 * An activity already registered in Advocu
 */
export interface GDEActivity {
  /** Unique identifier of the activity */
  activityId: string;
  /** Activity type (e.g. content creation, public speaking, workshop...) */
  type: string;
  /** Activity-specific data (title, description, metrics, etc.) */
  data: Record<string, unknown>;
  /** Submission date, e.g. 2026-01-01T00:00:00Z */
  submissionDate: string;
  /** Last update date, e.g. 2026-01-01T00:00:00Z */
  updatedDate: string;
  /** Archive date, only present for archived activities */
  archiveDate?: string;
}

/**
 * A page of activities returned by `GET /activities`
 */
export interface GDEActivitiesPage {
  content: GDEActivity[];
  /** Any additional paging metadata returned by the API (e.g. `last`, `totalPages`) */
  [key: string]: unknown;
}

/**
 * Parameters accepted by the `list_gde_activities` tool
 */
export interface ListGDEActivitiesParams {
  /** Filter by submission date from (inclusive), ISO-8601 UTC */
  from?: string;
  /** Filter by submission date to (exclusive), ISO-8601 UTC */
  to?: string;
  /** Filter activities updated after this date, ISO-8601 UTC */
  updatedAfter?: string;
  /** Page number (>= 0) */
  page?: number;
  /** Page size (1-100) */
  size?: number;
  /** Automatically fetch every page starting at `page` */
  fetchAll?: boolean;
}
