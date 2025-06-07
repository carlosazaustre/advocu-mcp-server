#!/usr/bin/env node

/**
 * Main entry point for Advocu MCP Server
 * Handles both MCP server execution and CLI commands
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // If no arguments or if stdin is being piped (MCP mode), start the server
  if (args.length === 0 || !process.stdin.isTTY) {
    // MCP Server mode - start the server directly
    const { ActivityReportingServer } = await import("./server.js");
    const server = new ActivityReportingServer();
    await server.run();
    return;
  }

  // Check if first argument is a CLI command
  const command = args[0];
  const cliCommands = ["config", "configure", "start", "run", "reset", "help", "--help", "-h"];

  if (cliCommands.includes(command)) {
    // CLI mode - delegate to CLI module
    const { runCLI } = await import("./cli.js");
    await runCLI();
  } else {
    // Unknown command, default to server mode
    const { ActivityReportingServer } = await import("./server.js");
    const server = new ActivityReportingServer();
    await server.run();
  }
}

// Handle uncaught errors gracefully
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection:", reason);
  process.exit(1);
});

// Run main
main().catch((error) => {
  console.error("❌ Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
