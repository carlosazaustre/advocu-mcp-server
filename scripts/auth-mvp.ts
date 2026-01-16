#!/usr/bin/env tsx
/**
 * Automated MVP Token Capture Tool using Playwright
 *
 * This script automates the token capture process:
 * 1. Opens a browser to the MVP portal
 * 2. User logs in normally (supports 2FA)
 * 3. Script intercepts API calls and captures the token automatically
 * 4. Updates Claude Desktop config with the fresh token
 *
 * Usage: npm run auth-mvp
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { type BrowserContext, type Page, chromium } from "playwright";

// MVP API base URL to intercept
const MVP_API_BASE = "mavenapi-prod.azurewebsites.net";
const MVP_PORTAL_URL = "https://mvp.microsoft.com/en-US/account/";

interface ClaudeConfig {
  mcpServers?: {
    [key: string]: {
      command?: string;
      args?: string[];
      env?: {
        MVP_ACCESS_TOKEN?: string;
        MVP_USER_PROFILE_ID?: string;
        ADVOCU_ACCESS_TOKEN?: string;
        [key: string]: string | undefined;
      };
    };
  };
}

interface CapturedCredentials {
  accessToken: string | null;
  userProfileId: string | null;
}

/**
 * Get the Claude Desktop config path based on OS
 */
function getClaudeConfigPath(): string {
  const os = platform();

  switch (os) {
    case "darwin":
      return join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
    case "win32":
      return join(homedir(), "AppData", "Roaming", "Claude", "claude_desktop_config.json");
    case "linux":
      return join(homedir(), ".config", "Claude", "claude_desktop_config.json");
    default:
      // Fallback to macOS path
      return join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
  }
}

/**
 * Find the MCP server entry in Claude config (handles different naming conventions)
 */
function findMcpServerKey(config: ClaudeConfig): string | null {
  if (!config.mcpServers) return null;

  // Common names for this MCP server
  const possibleNames = ["activity-reporting", "advocu-mcp-server", "advocu", "mvp-gde", "gde-mvp"];

  for (const name of possibleNames) {
    if (config.mcpServers[name]) {
      return name;
    }
  }

  // If not found, return the first one that has MVP or ADVOCU in env
  for (const [key, value] of Object.entries(config.mcpServers)) {
    if (value.env?.MVP_ACCESS_TOKEN !== undefined || value.env?.ADVOCU_ACCESS_TOKEN !== undefined) {
      return key;
    }
  }

  return null;
}

/**
 * Update Claude Desktop config with new credentials
 */
function updateClaudeDesktopConfig(credentials: CapturedCredentials): { success: boolean; message: string } {
  try {
    const configPath = getClaudeConfigPath();

    let config: ClaudeConfig = {};

    // Read existing config if it exists
    if (existsSync(configPath)) {
      const configContent = readFileSync(configPath, "utf-8");
      config = JSON.parse(configContent);
    }

    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Find existing server entry or create new one
    let serverKey = findMcpServerKey(config);

    if (!serverKey) {
      serverKey = "activity-reporting";
      config.mcpServers[serverKey] = {
        command: "npx",
        args: ["-y", "advocu-mcp-server"],
        env: {},
      };
    }

    // Ensure env object exists
    if (!config.mcpServers[serverKey].env) {
      config.mcpServers[serverKey].env = {};
    }

    const serverEnv = config.mcpServers[serverKey].env;

    // Update credentials
    if (credentials.accessToken && serverEnv) {
      serverEnv.MVP_ACCESS_TOKEN = credentials.accessToken;
    }

    if (credentials.userProfileId && serverEnv) {
      serverEnv.MVP_USER_PROFILE_ID = credentials.userProfileId;
    }

    // Write back to file
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    return {
      success: true,
      message: `Config updated at: ${configPath}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error updating config: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Extract user profile ID from various API response formats
 */
function extractUserProfileId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  // Direct userProfileId
  if (typeof obj.userProfileId === "number" || typeof obj.userProfileId === "string") {
    return String(obj.userProfileId);
  }

  // Nested in user object
  if (obj.user && typeof obj.user === "object") {
    const user = obj.user as Record<string, unknown>;
    if (typeof user.userProfileId === "number" || typeof user.userProfileId === "string") {
      return String(user.userProfileId);
    }
    if (typeof user.id === "number" || typeof user.id === "string") {
      return String(user.id);
    }
  }

  // Nested in profile object
  if (obj.profile && typeof obj.profile === "object") {
    const profile = obj.profile as Record<string, unknown>;
    if (typeof profile.userProfileId === "number" || typeof profile.userProfileId === "string") {
      return String(profile.userProfileId);
    }
    if (typeof profile.id === "number" || typeof profile.id === "string") {
      return String(profile.id);
    }
  }

  // Array of activities - get from first item
  if (Array.isArray(obj.activities) && obj.activities.length > 0) {
    const firstActivity = obj.activities[0] as Record<string, unknown>;
    if (typeof firstActivity.userProfileId === "number" || typeof firstActivity.userProfileId === "string") {
      return String(firstActivity.userProfileId);
    }
  }

  // Direct id field as fallback
  if (typeof obj.id === "number" || typeof obj.id === "string") {
    // Only use if it looks like a profile ID (numeric, reasonable length)
    const idStr = String(obj.id);
    if (/^\d{4,10}$/.test(idStr)) {
      return idStr;
    }
  }

  return null;
}

/**
 * Main authentication flow
 */
async function authenticateMVP(): Promise<void> {
  const separator = "=".repeat(60);
  console.log(`\n${separator}`);
  console.log("   MVP Automated Authentication Tool");
  console.log(`${separator}\n`);

  console.log("This tool will:");
  console.log("  1. Open a browser to the MVP portal");
  console.log("  2. You log in normally (2FA supported)");
  console.log("  3. Token is captured automatically");
  console.log("  4. Claude Desktop config is updated\n");

  console.log("Starting browser...\n");

  const credentials: CapturedCredentials = {
    accessToken: null,
    userProfileId: null,
  };

  let tokenCaptured = false;

  // Launch browser in non-headless mode so user can interact
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled", // Reduce automation detection
    ],
  });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page: Page = await context.newPage();

  // Intercept all requests to capture the token
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = request.url();

    // Check if this is a request to the MVP API
    if (url.includes(MVP_API_BASE)) {
      const headers = request.headers();
      const authHeader = headers.authorization || headers.Authorization;

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");

        if (!credentials.accessToken && token.length > 100) {
          credentials.accessToken = token;
          console.log(`\n${separator}`);
          console.log("   TOKEN CAPTURED!");
          console.log(separator);
          console.log(`   Length: ${token.length} characters`);
          console.log(`   Preview: ${token.substring(0, 40)}...`);
          console.log(`${separator}\n`);
        }
      }
    }

    // Continue with the request
    await route.continue();
  });

  // Also intercept responses to capture userProfileId
  page.on("response", async (response) => {
    const url = response.url();

    if (url.includes(MVP_API_BASE) && response.status() === 200) {
      try {
        const contentType = response.headers()["content-type"] || "";

        if (contentType.includes("application/json")) {
          const body = await response.json();

          // Try to extract userProfileId
          const profileId = extractUserProfileId(body);

          if (profileId && !credentials.userProfileId) {
            credentials.userProfileId = profileId;
            console.log(`   User Profile ID captured: ${profileId}`);
          }

          // Check if token was captured and we got a successful response
          if (credentials.accessToken && !tokenCaptured) {
            tokenCaptured = true;
            console.log("\n   Authentication successful! You can close the browser.\n");
          }
        }
      } catch {
        // Ignore JSON parse errors for non-JSON responses
      }
    }
  });

  // Navigate to MVP portal
  console.log("Opening MVP portal...");
  console.log("Please log in with your Microsoft account.\n");

  try {
    await page.goto(MVP_PORTAL_URL, { waitUntil: "domcontentloaded" });
  } catch (error) {
    console.log("Note: Initial navigation may redirect, this is normal.\n");
  }

  console.log(separator);
  console.log("   WAITING FOR LOGIN");
  console.log(separator);
  console.log("\n   1. Log in with your Microsoft account");
  console.log("   2. Complete 2FA if prompted");
  console.log("   3. Navigate to your MVP profile or activities");
  console.log("   4. The token will be captured automatically\n");
  console.log("   Tip: Click on 'My activities' or 'Add activity' to trigger API calls\n");
  console.log(`${separator}\n`);

  // Wait for the user to complete login and token to be captured
  // We'll poll for the token with a timeout
  const maxWaitTime = 5 * 60 * 1000; // 5 minutes
  const checkInterval = 1000; // 1 second
  let waitedTime = 0;

  while (!credentials.accessToken && waitedTime < maxWaitTime) {
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
    waitedTime += checkInterval;

    // Check if browser was closed
    if (!browser.isConnected()) {
      console.log("\nBrowser was closed.");
      break;
    }
  }

  // If we captured the token, give a bit more time to capture the profile ID
  if (credentials.accessToken && !credentials.userProfileId) {
    console.log("\nToken captured! Waiting a few more seconds for profile ID...");
    console.log("Tip: Navigate to 'My activities' to capture your profile ID.\n");

    let extraWait = 0;
    const extraMaxWait = 30000; // 30 more seconds

    while (!credentials.userProfileId && extraWait < extraMaxWait && browser.isConnected()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      extraWait += 1000;
    }
  }

  // Close browser
  if (browser.isConnected()) {
    console.log("\nClosing browser...");
    await browser.close();
  }

  // Report results
  console.log(`\n${separator}`);
  console.log("   RESULTS");
  console.log(`${separator}\n`);

  if (credentials.accessToken) {
    console.log("   Access Token: CAPTURED");
    console.log(`   Token Length: ${credentials.accessToken.length} characters`);
  } else {
    console.log("   Access Token: NOT CAPTURED");
    console.log("\n   The token was not captured. This can happen if:");
    console.log("   - You didn't complete the login");
    console.log("   - You closed the browser too early");
    console.log("   - The MVP portal didn't make any API calls");
    console.log("\n   Try again and make sure to navigate to 'My activities' after login.\n");
    return;
  }

  if (credentials.userProfileId) {
    console.log(`   Profile ID:   ${credentials.userProfileId}`);
  } else {
    console.log("   Profile ID:   NOT CAPTURED (you may need to add it manually)");
  }

  console.log(`\n${separator}\n`);

  // Update Claude Desktop config
  console.log("Updating Claude Desktop config...\n");

  const result = updateClaudeDesktopConfig(credentials);

  if (result.success) {
    console.log("   SUCCESS!");
    console.log(`   ${result.message}\n`);

    console.log(separator);
    console.log("   NEXT STEPS");
    console.log(`${separator}\n`);
    console.log("   1. Restart Claude Desktop (Cmd+Q then reopen)");
    console.log("   2. Your MVP integration is ready to use!\n");

    if (!credentials.userProfileId) {
      console.log("   Note: Profile ID was not captured automatically.");
      console.log("   You may need to add MVP_USER_PROFILE_ID manually to your config.");
      console.log("   Find it in the MVP portal URL or API responses.\n");
    }
  } else {
    console.log("   FAILED TO UPDATE CONFIG");
    console.log(`   ${result.message}\n`);
    console.log("   You can manually add these to your Claude Desktop config:\n");
    console.log(`   "MVP_ACCESS_TOKEN": "${credentials.accessToken}"`);
    if (credentials.userProfileId) {
      console.log(`   "MVP_USER_PROFILE_ID": "${credentials.userProfileId}"`);
    }
    console.log();
  }
}

// Run the script
authenticateMVP().catch((error) => {
  console.error("\nError:", error.message || error);
  process.exit(1);
});
