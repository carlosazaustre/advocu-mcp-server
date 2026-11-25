# Unified Activity Reporting MCP Server

## 🎯 Overview

A unified MCP (Model Context Protocol) server that enables **both Google Developer Experts (GDEs) and Microsoft MVPs** to report their activities through AI-powered conversational interfaces.

**Stop the boring manual data entry!** Just talk to Claude and submit your activities naturally - whether it's a YouTube video, blog post, conference talk, or mentoring session.

### Supported Programs

- ✅ **Microsoft MVP** - Direct API integration with the MVP portal
- ✅ **Google GDE** - Integration with Advocu API
- 🔧 **Both at once** - If you're both an MVP and GDE, use one tool for everything!

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Claude Desktop
- At least one access token (MVP or GDE)

### Installation

#### Option 1: Local Development (Recommended)

```bash
git clone https://github.com/carlosazaustre/advocu-mcp-server.git
cd advocu-mcp-server
npm install
npm run build
```

#### Option 2: Global Install

```bash
npm install -g advocu-mcp-server
```

### Configuration

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

#### For Both MVP + GDE:

```json
{
  "mcpServers": {
    "activity-reporting": {
      "command": "node",
      "args": ["/absolute/path/to/advocu-mcp-server/dist/index.js"],
      "env": {
        "MVP_ACCESS_TOKEN": "your_mvp_bearer_token",
        "MVP_USER_PROFILE_ID": "your_mvp_profile_id",
        "ADVOCU_ACCESS_TOKEN": "your_gde_token",
        "DOCS_DIR": "/absolute/path/to/advocu-mcp-server/docs"
      }
    }
  }
}
```

> **📚 Important**: The `DOCS_DIR` environment variable is **required** for documentation tools to work. Set it to the absolute path of the `docs` directory in your installation.

#### MVP Only:

```json
{
  "mcpServers": {
    "activity-reporting": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "MVP_ACCESS_TOKEN": "your_mvp_bearer_token",
        "MVP_USER_PROFILE_ID": "your_mvp_profile_id",
        "DOCS_DIR": "/absolute/path/to/advocu-mcp-server/docs"
      }
    }
  }
}
```

#### GDE Only:

```json
{
  "mcpServers": {
    "activity-reporting": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "ADVOCU_ACCESS_TOKEN": "your_gde_token",
        "DOCS_DIR": "/absolute/path/to/advocu-mcp-server/docs"
      }
    }
  }
}
```

### Get Your Tokens

#### Microsoft MVP Token

**For Claude Desktop users only** (not Claude Code):

```bash
npm run capture-mvp-token
```

This tool will:
1. **Open your default browser** to the MVP portal (you should already be logged in)
2. Show you detailed instructions to capture the token from DevTools
3. **Paste your token** when prompted
4. **Automatically update your Claude Desktop config file** with the new token
5. No browser automation detection - uses your real browser session!

#### Google GDE Token

Get your token from the [Advocu Developer Portal](https://advocu.com).

### Restart Claude Desktop

```bash
# Quit completely
Cmd+Q  # macOS
Alt+F4 # Windows

# Then reopen Claude Desktop
```

Look for the 🔨 hammer icon to confirm tools are loaded!

---

## 💬 Usage Examples

Just talk to Claude naturally! Here are examples:

### Documentation Tools

```
"List available documentation"
```

```
"Show me the MVP API reference"
```

```
"What documentation is available?"
```

```
"Get the error handling documentation"
```

### Microsoft MVP Activities

#### Submit a Video

```
"Submit my YouTube video to Microsoft MVP:
- Title: Complete Guide to React Server Components
- Published: October 9, 2025
- URL: https://youtube.com/watch?v=example
- Livestream views: 12,500
- On-demand views: 12,500
- Sessions: 1
- Target audience: Developers, Technical Decision Makers
- My role: Host
- Tech area: Web Development
- Description: A comprehensive tutorial covering React Server Components..."
```

#### Submit a Blog Post

```
"Add my latest blog post to MVP:
- Title: Understanding TypeScript Generics
- Date: 2025-10-01
- URL: https://myblog.com/typescript-generics
- Views: 5,000
- Target audience: Developers
- Role: Author
- Tech area: Developer Tools"
```

#### Submit a Conference Talk

```
"Report my conference presentation to MVP:
- Title: Building Scalable APIs with Node.js
- Date: 2025-09-15
- URL: https://conference.com/my-talk
- In-person attendees: 250
- Sessions: 1
- Target audience: Developers, IT Pros
- Role: Speaker
- Tech area: Cloud & AI"
```

### Google GDE Activities

```
"Submit my workshop to my GDE profile:
- Title: Advanced React Patterns Workshop
- Type: Workshop
- Date: 2025-08-20
- Format: Hybrid
- Country: United States
- In-person attendees: 50
- Total attendees: 150
- URL: https://workshop.com"
```

```
"Create a content creation draft for my Medium article about Next.js 14"
```

```
"Report my mentoring session with 3 developers about TypeScript best practices"
```

```
"List all my GDE activities submitted in 2026"
```

---

## 🔧 Available Tools

### Documentation Tools (2) - Always Available

| Tool | Description | Usage |
|------|-------------|-------|
| `list_documentation` | List all available documentation | "List available documentation" |
| `get_documentation` | Get a specific documentation file | "Show me the MVP API reference" |

**Available Documents:**
- `api-reference` - Complete API documentation for MVP and GDE
- `mvp-api-reference` - Detailed MVP API specifications
- `mvp-fixes-changelog` - MVP integration fixes history
- `error-handling` - Error handling improvements guide
- `mcp-resources` - MCP resources usage guide

> 📚 **Note**: Documentation tools require `DOCS_DIR` to be set in your configuration.

### Microsoft MVP Tools (3)

| Tool | Description | Key Fields |
|------|-------------|------------|
| `submit_mvp_video` | Videos, webinars, livestreams | views, sessions, role, tech area |
| `submit_mvp_blog` | Blog posts, articles | views, subscribers, tech area |
| `submit_mvp_speaking` | Conference talks, presentations | attendees, sessions, tech area |

### Google GDE Tools (8)

| Tool | Description |
|------|-------------|
| `list_gde_activities` | List your existing activities (read-only): date filters (`from`, `to`, `updatedAfter`), pagination (`page`, `size`) and `fetchAll` |
| `submit_gde_content_creation` | Articles, videos, podcasts |
| `submit_gde_public_speaking` | Talks and presentations |
| `submit_gde_workshop` | Training sessions |
| `submit_gde_mentoring` | Mentoring activities |
| `submit_gde_product_feedback` | Product feedback |
| `submit_gde_googler_interaction` | Google employee interactions |
| `submit_gde_story` | Success stories |

---

## 🔄 Token Refresh

### Microsoft MVP Token (Expires: Hours/Days)

Your MVP token expires regularly. When you get a 401 error or your token expires:

**For Claude Desktop users:**

```bash
cd /path/to/advocu-mcp-server
npm run capture-mvp-token
```

**What happens:**
1. 🌐 Your default browser opens to the MVP portal
2. ✅ If you're already logged in, you'll see your account immediately
3. 🔐 If not logged in, log in with Microsoft (2FA supported)
4. 🛠️ Open DevTools (F12 or Cmd+Option+I)
5. 📝 Navigate to "Add activity" and fill any field
6. 🔍 In Network tab, find the request to `mavenapi-prod.azurewebsites.net`
7. 📋 Copy the Bearer token from the Authorization header
8. ⌨️ Paste the token in the terminal
9. ✅ **Your Claude Desktop config file is automatically updated!**
10. 🔄 Restart Claude Desktop

**Advantages:**
- ✅ Uses your real browser (no automation detection)
- ✅ Works with 2FA/MFA
- ✅ Automatically updates your Claude Desktop config file
- ✅ Clear step-by-step instructions

### Google GDE Token (Expires: Less frequently)

Get a fresh token from Advocu when needed and update your config manually.

---

## 📋 Required Fields Reference

### MVP Video Activity

```typescript
{
  title: string;              // Max 100 chars
  description: string;        // Max 1000 chars
  date: string;              // YYYY-MM-DD
  url: string;               // Video URL
  targetAudience: string[];  // Developer, Student, IT Pro, etc.
  role: string;              // Host, Presenter, etc.
  technologyFocusArea: string;
  liveStreamViews: number;
  onDemandViews: number;
  numberOfSessions: number;  // Default: 1
  isPrivate: boolean;        // Optional
}
```

### MVP Blog Activity

```typescript
{
  title: string;
  description: string;
  date: string;
  url: string;
  targetAudience: string[];
  role: string;              // Author, Contributor, etc.
  technologyFocusArea: string;
  numberOfViews: number;
  subscriberBase: number;    // Optional
  isPrivate: boolean;        // Optional
}
```

### MVP Speaking Activity

```typescript
{
  title: string;
  description: string;
  date: string;
  url: string;
  targetAudience: string[];
  role: string;              // Speaker, Panelist, etc.
  technologyFocusArea: string;
  inPersonAttendees: number;
  numberOfSessions: number;
  liveStreamViews: number;   // Optional
  onDemandViews: number;     // Optional
  isPrivate: boolean;        // Optional
}
```

---

## 🏗️ Project Structure

```
advocu-mcp-server/
├── src/
│   ├── index.ts                    # Entry point
│   ├── unifiedServer.ts            # Main unified server (MVP + GDE)
│   ├── server.ts                   # Legacy GDE-only server
│   ├── mvpServer.ts                # Standalone MVP server
│   ├── interfaces/                 # Activity interfaces
│   │   ├── ActivityDraftBase.ts    # GDE base interface
│   │   ├── ContentCreationDraft.ts # GDE content creation
│   │   ├── ...                     # Other GDE interfaces
│   │   └── mvp/                    # MVP interfaces
│   │       ├── MVPActivityBase.ts
│   │       ├── MVPVideoActivity.ts
│   │       ├── MVPBlogActivity.ts
│   │       └── MVPSpeakingActivity.ts
│   └── types/                      # Type definitions
│       ├── ContentType.ts          # GDE types
│       ├── ...
│       └── mvp/                    # MVP types
│           ├── MVPActivityType.ts
│           ├── MVPActivityRole.ts
│           └── MVPTargetAudience.ts
├── scripts/
│   ├── capture-mvp-token.ts        # Token capture tool
│   └── README.md                   # Script documentation
├── dist/                           # Compiled output
└── docs/                           # 📚 Documentation (required for doc tools)
    ├── API.md                      # Complete API reference
    ├── MVP_API_REFERENCE.md        # MVP API specifications
    ├── CHANGELOG_MVP_FIXES.md      # MVP integration changelog
    ├── ERROR_HANDLING_IMPROVEMENTS.md  # Error handling guide
    ├── MCP_RESOURCES.md            # MCP resources guide
    └── RELEASE_NOTES_v0.2.0.md     # Release notes
```

---

## 🛠️ Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Lint and Format

```bash
npm run lint
npm run format
```

### Capture MVP Token

```bash
npm run capture-mvp-token
```

---

## 🐛 Troubleshooting

### Tools Don't Appear in Claude Desktop

1. **Check config path**: Ensure your `claude_desktop_config.json` is in the right location
2. **Verify build**: Run `npm run build` in the project directory
3. **Check logs**: Restart Claude Desktop and check for errors
4. **Verify tokens**: Make sure at least one token (MVP or GDE) is configured

### 401 Unauthorized Error (MVP)

Your token expired. Run:

```bash
npm run capture-mvp-token
```

Follow the instructions to capture a fresh token from DevTools, then restart Claude Desktop.

### "At least one of GDE or MVP must be configured"

You need to set either:
- `ADVOCU_ACCESS_TOKEN` (for GDE), or
- `MVP_ACCESS_TOKEN` + `MVP_USER_PROFILE_ID` (for MVP)

Both can be set if you're both an MVP and GDE!

### Documentation Tools Not Working

If you get errors like "Failed to read resource" or "Documentation not found":

1. **Check `DOCS_DIR` is set**: Make sure you added `DOCS_DIR` to your Claude Desktop config
2. **Verify the path**: The path must be **absolute** and point to the `docs` directory
3. **Example**: `"DOCS_DIR": "/Users/yourname/advocu-mcp-server/docs"`
4. **Check directory exists**: Run `ls "$DOCS_DIR"` to verify the directory exists
5. **Restart Claude Desktop**: Changes to config require a restart

**Example config:**
```json
{
  "env": {
    "MVP_ACCESS_TOKEN": "...",
    "DOCS_DIR": "/absolute/path/to/advocu-mcp-server/docs"
  }
}
```

### MVP Submission Fails

1. **Check your profile ID**: Make sure `MVP_USER_PROFILE_ID` is correct
2. **Verify token**: Run `npm run capture-mvp-token` to get a fresh token
3. **Check required fields**: All required fields must be provided
4. **Target audience**: Must be an array (e.g., `["Developer"]`)

---

## 🔒 Security & Privacy

- **Tokens are stored locally** in your Claude Desktop config
- **Never commit tokens** to version control
- **`captured-api-calls.json` is in `.gitignore`** - it contains sensitive data
- **MVP tokens expire** regularly for security
- **Tokens are never sent** to anyone except the official APIs

---

## 📖 API Documentation

### Microsoft MVP API

- **Base URL**: `https://mavenapi-prod.azurewebsites.net/api`
- **Endpoint**: `POST /Activities/`
- **Authentication**: Bearer token
- **Payload**: `{ "activity": { ...fields } }`

### Google GDE API (Advocu)

- **Base URL**: `https://api.advocu.com/personal-api/v1/gde`
- **Endpoints**: `/activity-drafts/{type}`
- **Authentication**: Bearer token
- **Rate Limit**: 30 requests/minute

For detailed field documentation, see [docs/API.md](docs/API.md).

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes (use conventional commits)
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for Google Developer Experts and Microsoft MVPs
- Powered by [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- Integrates with [Advocu](https://advocu.com) and Microsoft MVP Portal

---

## 💡 Tips

- **Be specific**: The more details you provide to Claude, the better
- **Natural language**: Just describe what you did - Claude will structure it
- **Batch submissions**: Submit multiple activities in one conversation
- **Check responses**: Claude will show you the API response for verification
- **Token expires?** Just run `npm run capture-mvp-token` and paste your new token - takes 30 seconds

---

**Questions or issues?** Open an issue on GitHub or check the [troubleshooting section](#-troubleshooting).

**Want to add more activity types?** Check out the code structure and submit a PR! 🚀
