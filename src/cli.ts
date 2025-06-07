#!/usr/bin/env node

/**
 * CLI for Advocu MCP Server
 * Allows users to configure and run the server via npx
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".advocu-mcp");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  accessToken?: string;
  apiUrl?: string;
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function saveConfig(config: Config): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function showHelp(): void {
  console.log(`
🚀 Advocu MCP Server CLI

Usage:
  npx advocu-mcp-server [command]

Commands:
  config              Configure API credentials
  start               Start the MCP server
  reset              Reset configuration
  help               Show this help

Examples:
  npx advocu-mcp-server config
  npx advocu-mcp-server start
  
For more information, visit:
https://github.com/carlosazaustre/advocu-mcp-server
`);
}

function configureCredentials(): void {
  console.log("🔧 Configuring Advocu MCP Server...\n");

  const config = loadConfig();

  console.log("Please provide your Advocu API credentials:");
  console.log("You can find your token at: https://advocu.com/settings/api");
  console.log("\nTo configure, set these environment variables:");
  console.log("export ADVOCU_ACCESS_TOKEN=your_token_here");
  console.log("export ADVOCU_API_URL=https://api.advocu.com/personal-api/v1/gde");
  console.log("\nOr create a .env file in your current directory with:");
  console.log("ADVOCU_ACCESS_TOKEN=your_token_here");
  console.log("ADVOCU_API_URL=https://api.advocu.com/personal-api/v1/gde");

  const defaultConfig = {
    apiUrl: "https://api.advocu.com/personal-api/v1/gde",
  };

  saveConfig({ ...config, ...defaultConfig });
  console.log("\n✅ Base configuration saved!");
  console.log("Don't forget to set your ADVOCU_ACCESS_TOKEN environment variable.");
}

function resetConfig(): void {
  ensureConfigDir();
  saveConfig({});
  console.log("✅ Configuration reset!");
}

async function startServer(): Promise<void> {
  console.log("🚀 Starting Advocu MCP Server...");

  // Validate environment
  if (!process.env.ADVOCU_ACCESS_TOKEN) {
    console.error("❌ Error: ADVOCU_ACCESS_TOKEN environment variable is required");
    console.log("Run 'npx advocu-mcp-server config' for setup instructions");
    process.exit(1);
  }

  try {
    // Dynamic import to avoid compilation issues
    const { ActivityReportingServer } = await import("./server.js");
    const server = new ActivityReportingServer();
    await server.run();
    console.log("✅ Advocu MCP Server is running!");
    console.log("Configure your MCP client to connect to this server.");
  } catch (error) {
    console.error("❌ Failed to start server:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  switch (command) {
    case "config":
    case "configure":
      configureCredentials();
      break;

    case "start":
    case "run":
      await startServer();
      break;

    case "reset":
      resetConfig();
      break;

    default:
      showHelp();
      break;
  }
}

/**
 * Export CLI function for use from main entry point
 */
export async function runCLI(): Promise<void> {
  await main();
}

// Handle uncaught errors gracefully when run directly
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection:", reason);
  process.exit(1);
});

// Run CLI only if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ CLI error:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
