# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A unified MCP (Model Context Protocol) server that enables both Google Developer Experts (GDEs) and Microsoft MVPs to report their activities through AI-powered conversational interfaces. The server integrates with:
- **Advocu GDE API** for Google GDE activity submissions
- **Microsoft MVP API** for Microsoft MVP activity submissions

Both integrations are optional - users can configure one or both depending on their needs.

## Package Manager

This project uses **npm** (not pnpm or yarn). All commands should use npm.

## Common Commands

### Development
```bash
npm run dev          # Run server in development mode (uses tsx)
npm start            # Run compiled server from dist/
```

### Building
```bash
npm run build        # Compile TypeScript to dist/
```

### Linting and Formatting
```bash
npm run lint         # Check code with Biome
npm run format       # Format code with Biome (writes changes)
```

### Publishing
```bash
npm run prepublishOnly    # Runs before publishing (builds automatically)
npm run publish:dry       # Test publish without actually publishing
npm run release           # Create new release with standard-version
npm run release:patch     # Patch version bump
npm run release:minor     # Minor version bump
npm run release:major     # Major version bump
npm run postrelease       # Pushes tags and publishes to npm
```

## Architecture

### Entry Point and Server Flow

1. **index.ts** - Entry point that loads environment variables and instantiates the unified server
2. **unifiedServer.ts** - Main unified server class (`UnifiedActivityReportingServer`) that:
   - Initializes MCP server with stdio transport
   - Validates environment variables for both GDE and MVP (at least one must be configured)
   - Registers tools for enabled integrations:
     - 7 GDE activity tools (if `ADVOCU_ACCESS_TOKEN` is set)
     - 3+ MVP activity tools (if `MVP_ACCESS_TOKEN` and `MVP_USER_PROFILE_ID` are set)
   - Routes tool calls to the appropriate API (GDE or MVP)
3. **server.ts** - Legacy GDE-only server (kept for backwards compatibility)
4. **mvpServer.ts** - Standalone MVP server (can be used independently)

### Activity Type System

The codebase uses a type-safe, inheritance-based structure for activity drafts:

#### GDE Activity Types (in `src/interfaces/`)
- **ActivityDraftBase** - Base interface with common properties (title, description, activityDate, tags, additionalInfo, private)
- **Specific activity interfaces** extend the base and add unique properties:
  - `ContentCreationDraft` - For articles, videos, podcasts, etc.
  - `PublicSpeakingDraft` - For talks and presentations
  - `WorkshopDraft` - For training sessions
  - `MentoringDraft` - For mentoring activities
  - `ProductFeedbackDraft` - For product feedback submissions
  - `GooglerInteractionDraft` - For interactions with Google employees
  - `StoryDraft` - For success stories

#### MVP Activity Types (in `src/interfaces/mvp/`)
- **MVPActivityBase** - Base interface with common MVP properties (title, description, date, url, targetAudience, role, technologyFocusArea, etc.)
- **Specific MVP activity interfaces** extend the base and add metrics:
  - `MVPVideoActivity` - For videos, webinars, livestreams (liveStreamViews, onDemandViews, numberOfSessions)
  - `MVPBlogActivity` - For blog posts and articles (numberOfViews, subscriberBase)
  - `MVPSpeakingActivity` - For speaking engagements (inPersonAttendees, liveStreamViews, onDemandViews)
  - `MVPBookActivity` - For books and e-books (copiesSold, subscriberBase)

### Type Definitions

#### GDE Enums (in `src/types/`)
- `ContentType` - 8 types (Articles, Books, Videos, etc.)
- `EventFormat` - 3 formats (In-Person, Virtual, Hybrid)
- `Country` - 251 country codes
- `InteractionFormat` - 8 formats for Googler interactions
- `InteractionType` - 6 types of interactions
- `ProductFeedbackContentType` - 2 types
- `SignificanceType` - 6 types for stories

#### MVP Enums (in `src/types/mvp/`)
- `MVPActivityType` - 20+ types (Blog, Video, Speaking, Book, Mentorship, Open Source, etc.)
- `MVPActivityRole` - 9 roles (Author, Speaker, Host, Contributor, etc.)
- `MVPTargetAudience` - 6 audiences (Developer, Technical Decision Maker, Business Decision Maker, Student, IT Pro, End User)

### API Integration

#### GDE (Advocu) API
- Base URL: `https://api.advocu.com/personal-api/v1/gde` (configurable via `ADVOCU_API_URL`)
- Endpoints: `/activity-drafts/{activity-type}`
- Authentication: Bearer token via `ADVOCU_ACCESS_TOKEN`
- Rate limit: 30 requests per minute (handled with 429 error detection)

#### Microsoft MVP API
- Base URL: `https://mavenapi-prod.azurewebsites.net/api` (configurable via `MVP_API_URL`)
- Endpoints: `POST /Activities/`
- Authentication: Bearer token via `MVP_ACCESS_TOKEN`
- Additional requirement: `MVP_USER_PROFILE_ID` (your MVP profile ID number)
- Payload format: Wraps activity in `{ "activity": { ...fields } }`

### MCP Tools

#### GDE Tools (when `ADVOCU_ACCESS_TOKEN` is set)
1. `submit_gde_content_creation`
2. `submit_gde_public_speaking`
3. `submit_gde_workshop`
4. `submit_gde_mentoring`
5. `submit_gde_product_feedback`
6. `submit_gde_googler_interaction`
7. `submit_gde_story`

#### MVP Tools (when `MVP_ACCESS_TOKEN` and `MVP_USER_PROFILE_ID` are set)
1. `submit_mvp_video` - For videos, webinars, livestreams
2. `submit_mvp_blog` - For blog posts and articles
3. `submit_mvp_speaking` - For speaking engagements

Each tool has a JSON schema with validation rules (minLength, maxLength, patterns, enums, etc.) that match the respective API requirements.

## Configuration

### Environment Variables

#### GDE Configuration (optional - for GDE functionality)
- `ADVOCU_ACCESS_TOKEN` - API access token for GDE/Advocu authentication
- `ADVOCU_API_URL` (optional) - Override the default GDE API base URL

#### MVP Configuration (optional - for MVP functionality)
- `MVP_ACCESS_TOKEN` - Bearer token for MVP API authentication (get this from browser DevTools when logged into mvp.microsoft.com)
- `MVP_USER_PROFILE_ID` - Your MVP profile ID number (visible in API requests when using MVP portal)
- `MVP_API_URL` (optional) - Override the default MVP API base URL

**Note**: At least one of GDE or MVP must be configured. You can enable both if you're both a GDE and an MVP!

### Claude Desktop Integration
The server is designed to be used with Claude Desktop via MCP. Configuration can be done:
1. Global install: `npm install -g advocu-mcp-server` then use command `advocu-mcp-server`
2. Via npx: `npx -y advocu-mcp-server` (no installation)
3. Local development: `node /path/to/dist/index.js`

## Code Quality Tools

- **Biome** - Used for linting and formatting (replaces ESLint + Prettier)
  - Config: `biome.json`
  - Line width: 120 characters
  - Indent: 2 spaces
  - Quote style: double quotes
- **Husky** - Git hooks for pre-commit and pre-push checks
- **Commitlint** - Enforces conventional commit messages
- **TypeScript** - Strict mode enabled with ES2022 target

## Important Notes

- All source files use `.js` extensions in imports (TypeScript with NodeNext module resolution)
- The server uses stdio transport for MCP communication
- Error handling converts all errors to MCP-compatible `McpError` types
- API responses are returned as formatted JSON text in MCP tool responses
- MVP authentication tokens are short-lived and need to be refreshed periodically from the MVP portal
- The `scripts/capture-mvp-token.ts` tool (for Claude Desktop users) can be used to capture fresh MVP tokens and automatically update the Claude Desktop config file
- MVP activity submissions require the exact `userProfileId` which is tied to your MVP account