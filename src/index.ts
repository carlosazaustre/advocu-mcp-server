#!/usr/bin/env node

// Load environment variables early
import dotenv from "dotenv";
dotenv.config();

import { ActivityReportingServer } from "./server.js";

/**
 * Entry point for the Activity Reporting MCP Server
 * This file instantiates, validates, and runs the server with proper
 * environment handling and graceful shutdown support.
 */

async function main() {
  console.log("🚀 Starting Activity Reporting MCP Server...");

  // Optional: check critical environment variables
  const requiredEnv = ["PORT", "DATABASE_URL"];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missing.join(", ")}`
    );
  }

  let server;

  try {
    server = new ActivityReportingServer();

    // Run the server (await ensures startup completes before continuing)
    await server.run();

    console.log("✅ Activity Reporting MCP Server is now running.");

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      try {
        if (server && typeof server.stop === "function") {
          await server.stop();
          console.log("✅ Server stopped cleanly.");
        }
      } catch (err) {
        console.error("Error during shutdown:", err);
      } finally {
        process.exit(0);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start Activity Reporting MCP Server:", error);
    process.exit(1);
  }
}

// Run the server
main().catch((err) => {
  console.error("Unhandled startup error:", err);
  process.exit(1);
});
