# MVP Authentication Tools

**For Claude Desktop users only** (not Claude Code)

This directory contains tools for authenticating with the Microsoft MVP API and automatically updating your Claude Desktop configuration.

## Available Scripts

### 1. `auth-mvp` (Recommended)

**Automated authentication using Playwright** - The easiest way to authenticate.

```bash
npm run auth-mvp
```

#### How It Works

1. Opens a Chromium browser to the MVP portal
2. You log in normally with your Microsoft account (2FA supported!)
3. The script automatically captures your token when you navigate the portal
4. Updates your Claude Desktop config automatically

#### Features

- No DevTools needed
- Supports 2FA/MFA seamlessly
- Captures both the access token AND your user profile ID
- Cross-platform (macOS, Windows, Linux)
- Automatically updates Claude Desktop config

---

### 2. `capture-mvp-token` (Manual)

**Manual token capture** - For cases where automated capture doesn't work.

```bash
npm run capture-mvp-token
```

This opens your default browser and provides step-by-step instructions to manually capture the token from DevTools.

---

## Quick Start

1. Run the automated script:
   ```bash
   npm run auth-mvp
   ```

2. A browser will open - log in with your Microsoft account

3. Navigate to **"My activities"** or **"Add activity"** (this triggers API calls)

4. The script will automatically capture your token and update your config

5. **Restart Claude Desktop** (Cmd+Q / Ctrl+Q then reopen)

6. Done! Your MVP integration is ready to use.

---

## Troubleshooting

### Browser doesn't open
- Make sure you have Playwright browsers installed:
  ```bash
  npx playwright install chromium
  ```

### Token not captured
- Make sure to navigate to **"My activities"** or create/edit an activity after logging in
- The token is captured when the portal makes API calls to `mavenapi-prod.azurewebsites.net`

### Profile ID not captured
- Navigate to your activities page - the profile ID is extracted from API responses
- If not captured automatically, you can find it in the URL when viewing your profile

### Config not updated
- Check that Claude Desktop is installed
- The script looks for the config at:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`

### "Chrome is being controlled by automated software" warning
- This is normal for Playwright - the automation is minimal and only intercepts network requests
- Your login credentials are never stored or transmitted anywhere

---

## Token Expiration

MVP tokens expire after a few hours. When your token expires:

1. Run `npm run auth-mvp`
2. Log in again
3. Navigate to activities
4. Restart Claude Desktop

That's it! The whole process takes less than a minute.

---

## Privacy Note

- Your credentials are entered directly in the browser, not captured by the script
- Only the bearer token and profile ID are extracted from API requests
- Nothing is sent to external servers - everything stays on your machine
- The Claude Desktop config file remains private on your computer
