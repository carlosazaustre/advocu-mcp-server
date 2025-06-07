#!/usr/bin/env node

import dotenv from "dotenv";
import { ActivityReportingServer } from "./server.js";

// Load environment variables from .env file
dotenv.config();

/**
 * Entry point for the Activity Reporting MCP Server
 * This file is responsible for instantiating and running the server
 */
async function main() {
  try {
    const server = new ActivityReportingServer();
    await server.run();
  } catch (error) {
    console.error("Failed to start Activity Reporting MCP Server:", error);
    process.exit(1);
  }
}

// Run the server
main().catch(console.error);
