# Release Notes v0.2.0 - MVP Integration & MCP Resources

## 🎉 What's New

### Microsoft MVP Integration
Complete integration with Microsoft MVP API, enabling MVPs to submit activities directly through Claude Desktop.

**Supported Activity Types:**
- ✅ Videos (YouTube, Vimeo, etc.)
- ✅ Blog posts and articles
- ✅ Speaking engagements and conferences
- 🔜 Books and e-books (coming soon)
- 🔜 Workshops (coming soon)

### Unified Server
Single MCP server supporting both Google GDE (Advocu) and Microsoft MVP programs.

**Features:**
- Conditional tool enablement based on credentials
- Support for users in both programs simultaneously
- Unified configuration via environment variables
- Automatic credential validation on startup

### MCP Resources
Documentation is now accessible directly through MCP resources, making it easy for AIs to access API documentation without manual copy-paste.

**Available Resources:**
- `docs://api-reference` - Complete API documentation
- `docs://mvp-api-reference` - Detailed MVP API reference
- `docs://mvp-fixes-changelog` - MVP integration changelog
- `docs://error-handling` - Error handling guide
- `docs://mcp-resources` - MCP resources usage guide

## 🔧 Improvements

### Enhanced Error Handling
Error messages are now returned as content instead of exceptions, providing clear, actionable feedback.

**Examples:**
```
❌ MVP authentication failed. Your MVP_ACCESS_TOKEN may be expired.

To fix:
1. Log in to https://mvp.microsoft.com/
2. Open DevTools → Network tab
3. Create/edit an activity
4. Export as HAR file
5. Extract the Bearer token
6. Update your configuration
```

### API Validation
Strict validation ensures data integrity before submission.

- Activity type validation
- Role validation per activity type
- Target audience validation
- Technology focus area support
- Date format validation

### Token Management
Simplified token capture and management process.

- HAR file export support for complete token capture
- Environment variable configuration
- Automatic token validation on startup
- Clear expiration warnings

## 🐛 Bug Fixes

### MVP Activity Types
- ❌ Removed invalid `WEBINAR_ONLINE_TRAINING` type
- ✅ Use correct `VIDEO` type for video submissions

### MVP Roles
Fixed role validation per activity type:
- Videos: `Host`, `Presenter`, `Speaker`
- Blogs: `Author`, `Co-Author`, `Contributor`
- Books: `Author`, `Co-Author`
- Speaking: `Speaker`, `Panelist`, `Moderator`, `Presenter`

### Additional Technology Areas
- Force empty array for `additionalTechnologyAreas`
- API currently rejects non-empty values
- Will be investigated in future releases

## 📚 Documentation

### New Documentation Files

1. **API.md** - Unified API documentation for both MVP and GDE
2. **MVP_API_REFERENCE.md** - Detailed MVP API specifications
3. **CHANGELOG_MVP_FIXES.md** - Complete changelog of MVP fixes
4. **ERROR_HANDLING_IMPROVEMENTS.md** - Error handling patterns
5. **MCP_RESOURCES.md** - Guide for using MCP resources
6. **RELEASE_NOTES_v0.2.0.md** - This file!

All documentation is available via MCP resources and accessible to AIs.

## 🧪 Testing

### Successful Tests
- ✅ Video submission (contributionId: 351180)
- ✅ Token capture via HAR file export
- ✅ Error handling across all status codes
- ✅ MCP resources access
- ✅ Unified server with both credentials
- ✅ Unified server with single credential (GDE or MVP)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Claude Desktop
- At least one access token (MVP or GDE)

### Installation

```bash
git clone https://github.com/carlosazaustre/advocu-mcp-server.git
cd advocu-mcp-server
npm install
npm run build
```

### Configuration

Edit your Claude Desktop config:
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "activity-reporting": {
      "command": "node",
      "args": ["/path/to/mcp-mvp-gde/dist/index.js"],
      "env": {
        "MVP_ACCESS_TOKEN": "your-mvp-token",
        "MVP_USER_PROFILE_ID": "your-profile-id",
        "ADVOCU_ACCESS_TOKEN": "your-gde-token"
      }
    }
  }
}
```

### Usage Example

```
"Upload my YouTube video to MVP:
- Title: Building Modern Web Apps
- Date: 2025-10-12
- URL: https://www.youtube.com/watch?v=example
- Views: 1500
- Role: Host
- Audience: Developer
- Tech Area: Web Development
- Description: Tutorial on building modern web applications..."
```

Response:
```
✅ MVP Activity submitted!

Type: Video
Title: Building Modern Web Apps

Response: {
  "contributionId": 351234
}
```

## 👥 Contributors

### New Contributors
- **Alan Buscaglia** ([Gentleman Programming](https://gentleman.programming))
  - Microsoft MVP integration
  - Error handling improvements
  - MCP resources implementation
  - Documentation in English

### Core Team
- **Carlos Azaustre** ([carlosazaustre.es](https://carlosazaustre.es/))
  - Original Google GDE integration
  - Project architecture
  - Unified server design

## 🔮 What's Next

### Planned Features
- [ ] Additional MVP activity types (Workshop, Book/E-book)
- [ ] Additional technology areas investigation
- [ ] Batch activity submission
- [ ] Activity history and management
- [ ] Analytics and reporting
- [ ] Automatic token refresh

### Under Investigation
- [ ] Valid values for `additionalTechnologyAreas`
- [ ] Role validation for remaining activity types
- [ ] Rate limiting strategies
- [ ] Webhook support for activity updates

## 📝 Breaking Changes

None. This release is fully backward compatible with v0.1.x.

## 🆙 Upgrading

### From v0.1.x to v0.2.0

1. Pull latest changes:
```bash
git pull origin main
npm install
npm run build
```

2. Update Claude Desktop config to add MVP credentials (if needed):
```json
{
  "env": {
    "MVP_ACCESS_TOKEN": "your-token",
    "MVP_USER_PROFILE_ID": "your-id",
    "ADVOCU_ACCESS_TOKEN": "your-gde-token"
  }
}
```

3. Restart Claude Desktop (Cmd+Q, then reopen)

That's it! No code changes required.

## 🐛 Known Issues

1. **Additional Technology Areas**: Currently forced to empty array
   - **Workaround**: Leave empty, MVP API rejects non-empty values
   - **Status**: Under investigation

2. **Token Expiration**: MVP tokens expire every few hours
   - **Workaround**: Use `npm run capture-mvp-token` to renew
   - **Status**: Automatic refresh planned for future release

3. **Firefox DevTools**: Header truncation when copying
   - **Workaround**: Export as HAR file instead
   - **Status**: Documented in guides

## 💬 Feedback & Support

### Bug Reports
Please report issues at: https://github.com/carlosazaustre/advocu-mcp-server/issues

### Feature Requests
We welcome feature requests! Please open an issue with:
- Clear description of the feature
- Use case and benefits
- Any implementation ideas

### Questions
For questions, please:
1. Check the documentation first
2. Search existing issues
3. Open a new issue if needed

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Special thanks to:
- Microsoft MVP program for API access
- Google GDE program and Advocu team
- Anthropic for Claude Desktop and MCP
- All contributors and testers

---

**Happy Activity Reporting!** 🎉

Report your activities naturally through conversation, and let the AI handle the boring parts.
