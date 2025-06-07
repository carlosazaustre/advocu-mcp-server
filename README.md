# Activity Reporting MCP Server

## Motivation

This project empowers Google Developer Experts (GDEs) to effortlessly report their activities through AI-powered conversational interfaces. By integrating the Advocu API with the Model Context Protocol (MCP), GDEs can now submit their content creation, speaking engagements, workshops, mentoring sessions, and other activities directly through AI chat models or command-line tools. This streamlines the reporting process, making it more intuitive and accessible while maintaining the detailed tracking that the GDE program requires.

A Model Context Protocol (MCP) server for reporting activities to the Advocu GDE API.

## Quick Installation

### Local Setup
```bash
git clone <your-repo>
cd advocu-mcp-server
chmod +x setup.sh
./setup.sh
```

## Manual Configuration

### Prerequisites
- Node.js 20+
- Advocu GDE API access token

### Installation Steps

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd advocu-mcp-server
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Create .env file
   echo "ADVOCU_ACCESS_TOKEN=your_token_here" > .env
   echo "ADVOCU_API_URL=https://api.advocu.com/personal-api/v1/gde" >> .env
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Configure Claude Desktop:**
   
   **macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   **Windows**: Edit `%APPDATA%/Claude/claude_desktop_config.json`
   
   ```json
   {
     "mcpServers": {
       "activity-reporting": {
         "command": "node",
         "args": ["/absolute/path/to/project/dist/index.js"],
         "env": {
          "ADVOCU_ACCESS_TOKEN": "your_advocu_token"
       }
     }
   }
   ```

5. **Restart Claude Desktop**

## Available Tools

Once configured, you'll have access to these tools in Claude:

- **submit_content_creation** - Report content creation activities
- **submit_public_speaking** - Report public speaking engagements
- **submit_workshop** - Report workshop sessions
- **submit_mentoring** - Report mentoring activities
- **submit_product_feedback** - Report product feedback submissions
- **submit_googler_interaction** - Report interactions with Google employees
- **submit_story** - Report success stories

## Usage Examples

In Claude, you can use commands like:

```
"Submit a content creation activity for my blog post about React hooks published on Medium"

"Create a public speaking draft for my presentation at ReactConf 2024"

"Report a mentoring session I had with 3 junior developers about TypeScript"
```

## API Reference

For detailed information about all available endpoints, parameters, and data formats, see the [API Documentation](docs/API.md).

## Development

### Development mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint and format
```bash
npm run lint
npm run format
```

## Rate Limiting

The API has a limit of 30 requests per minute. The server automatically handles 429 errors.

## Project Structure

```
advocu-mcp-server/
├── src/
│   ├── index.ts                    # Entry point
│   ├── server.ts                   # Main server class
│   ├── interfaces/                 # Interfaces
│   └── types/                      # Types
├── dist/                           # Compiled output
├── docs/                           # Documentation
├── .env                            # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Error: "Command not found"
- Verify that the path in `claude_desktop_config.json` is absolute
- Ensure the file is executable: `chmod +x dist/index.js`

### Error: "Authentication failed"
- Verify that your token in `.env` is correct
- The token must have permissions for the Personal API

### Error: "ADVOCU_ACCESS_TOKEN is not set"
- Make sure your `.env` file exists in the project root
- Verify the token is properly set in the `.env` file

### Error: "Rate limit exceeded"
- Wait one minute before making more requests
- The API limits to 30 requests per minute

## Contributing

1. Fork the project
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Create a Pull Request

## License

MIT License - see LICENSE file for details.