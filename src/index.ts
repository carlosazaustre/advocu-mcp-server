#!/usr/bin/env node

import dotenv from "dotenv";
import { UnifiedActivityReportingServer } from "./unifiedServer.js";

// Load environment variables from .env file
dotenv.config();

/**
 * Entry point for the Unified Activity Reporting MCP Server
 * Supports both Google GDE (Advocu) and Microsoft MVP activity submissions
 *
 * Environment Variables:
 * - ADVOCU_ACCESS_TOKEN: Token for GDE submissions (optional)
 * - MVP_ACCESS_TOKEN: Bearer token for MVP submissions (optional)
 * - MVP_USER_PROFILE_ID: Your MVP profile ID (required if using MVP)
 *
 * At least one of GDE or MVP must be configured.
 */
async function main() {
  try {
    const server = new UnifiedActivityReportingServer();
    await server.run();
  } catch (error) {
    console.error("Failed to start Activity Reporting MCP Server:", error);
    process.exit(1);
  }
}

// Run the server
main().catch(console.error);
