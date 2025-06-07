#!/bin/bash
# setup.sh - Initial setup script

set -e

echo "🚀 Setting up Activity Reporting MCP Server..."

# Verify we're in the correct directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if token exists
if [[ ! -f ".env" ]]; then
    echo "⚠️  Creating .env file..."
    echo "ADVOCU_ACCESS_TOKEN=your_token_here" > .env
    echo "📝 Please edit .env with your actual token"
fi

# Compile the project
echo "🔨 Compiling TypeScript..."
npm run build

# Verify compilation
if [[ ! -f "dist/index.js" ]]; then
    echo "❌ Error: Compilation failed"
    exit 1
fi

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your actual Advocu token"
echo "2. Run: npm run start (to test)"
echo "3. Configure Claude Desktop with the path: $(pwd)/dist/index.js"
echo ""