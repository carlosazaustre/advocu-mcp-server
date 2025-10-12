# MVP Token Capture Tool

**For Claude Desktop users only** (not Claude Code)

This directory contains tools for capturing your Microsoft MVP API token and automatically updating your Claude Desktop configuration.

## Quick Start

```bash
npm run capture-mvp-token
```

## How It Works

The `capture-mvp-token.ts` script:

1. **Opens your default browser** to the MVP portal (no automation detection!)
2. Shows you detailed instructions to capture the token from DevTools
3. Waits for you to paste the token
4. **Automatically updates your Claude Desktop config file with the fresh token!** 🎉

## Usage Instructions

1. Run the script:
   ```bash
   npm run capture-mvp-token
   ```

2. Your default browser will open to https://mvp.microsoft.com/en-US/account/

3. **If not already logged in**, log in with your Microsoft account (2FA supported)

4. **Open DevTools** (F12 or Cmd+Option+I on Mac)

5. Navigate through the portal:
   - Click on the **Network** tab in DevTools
   - Navigate to "Add activity" or edit an existing activity
   - Fill out any field in the form

6. In the Network tab:
   - Look for a request to `mavenapi-prod.azurewebsites.net`
   - Click on that request
   - Go to the **Headers** tab
   - Find the **Authorization** header
   - Copy the token (the long string after "Bearer ")

7. **Paste the token** in the terminal when prompted

8. The script will:
   - Validate the token
   - **Automatically update your Claude Desktop config**
   - Show you a success message

9. **Restart Claude Desktop** (Cmd+Q then reopen) to use the fresh token!

## What We're Looking For

### Key Endpoints to Identify:

1. **GET endpoints** for listing contributions:
   - Example: `GET /api/contributions`
   - Example: `GET /api/v1/profile/contributions`

2. **POST endpoints** for creating contributions:
   - Example: `POST /api/contributions`
   - Example: `POST /api/v1/contributions/create`

3. **PUT/PATCH endpoints** for updating contributions:
   - Example: `PATCH /api/contributions/{id}`

4. **GET endpoints** for reference data:
   - Contribution types list
   - Technology areas
   - Visibility options

### Authentication Headers:

Look for headers like:
- `Authorization: Bearer <token>`
- `X-API-Key: <key>`
- `Cookie: <session-cookies>`

### Payload Structure:

When you add or edit a contribution, capture the JSON payload to understand:
- Required fields
- Field names and formats
- Date formats
- How arrays/objects are structured

## Example Output

After running the script and interacting with the portal, you should see:

```json
{
  "timestamp": "2025-01-12T10:30:00.000Z",
  "method": "POST",
  "url": "https://mvp.microsoft.com/api/contributions",
  "headers": {
    "authorization": "Bearer eyJ...",
    "content-type": "application/json"
  },
  "postData": "{\"title\":\"My Article\",\"type\":\"Article\",\"date\":\"2025-01-01\"...}",
  "response": {
    "status": 201,
    "body": "{\"id\":\"12345\",\"success\":true}"
  }
}
```

## Automatic Token Refresh

The script **automatically updates your Claude Desktop config** when you paste the token! No more manual editing of config files.

When your token expires:
1. Run `npm run capture-mvp-token`
2. Browser opens (log in if needed)
3. Open DevTools and capture the token
4. Paste the token in the terminal
5. ✅ Token automatically updated!
6. Restart Claude Desktop

**Advantages over automated browser:**
- ✅ No browser automation detection
- ✅ Works with any browser (Chrome, Firefox, Safari, Edge)
- ✅ Supports 2FA/MFA seamlessly
- ✅ Uses your real browser session

## Troubleshooting

### Browser doesn't open automatically
- The script uses the macOS `open` command
- If it fails, manually open: https://mvp.microsoft.com/en-US/account/
- The rest of the script will still work

### Can't find the token in DevTools
1. Make sure you're logged into the MVP portal
2. **Open DevTools BEFORE navigating** (F12 or Cmd+Option+I)
3. Go to the **Network** tab
4. Navigate to "Add activity" or edit an existing one
5. **Fill out ANY field** in the form (this triggers the API call)
6. Look for requests to `mavenapi-prod.azurewebsites.net`
7. Click on that request → Headers tab → Authorization header

### "Invalid token" error
- Make sure you copied the ENTIRE token (it's very long, 500+ characters)
- Don't include the word "Bearer", only the token itself
- Check that you copied from the **Authorization** header, not another field

### Browser automation detection
This new script **doesn't use browser automation**, so you won't see the "Chrome is being controlled by automated software" warning. It simply opens your regular browser with the `open` command.

## Privacy Note

The captured data in `captured-api-calls.json` will contain:
- Your authentication tokens
- Your personal contributions data
- Session cookies

**DO NOT commit this file to git!** It's already in `.gitignore`.

Your Claude Desktop config file is updated automatically but remains private on your machine.
