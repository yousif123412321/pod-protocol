#!/bin/bash

echo "Setting up MCP servers for Qodo..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js version 18.0.0 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to version 18.0.0 or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible"

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please ensure npm is properly installed."
    exit 1
fi

echo "✅ npx is available"

# Test MCP servers installation
echo "🔄 Testing MCP server installations..."

echo "Testing Context7..."
if npx -y @upstash/context7-mcp@latest --help &> /dev/null; then
    echo "✅ Context7 MCP server is accessible"
else
    echo "⚠️  Context7 MCP server test failed, but it may still work"
fi

echo "Testing TaskQueue..."
if npx -y @chriscarrollsmith/taskqueue --help &> /dev/null; then
    echo "✅ TaskQueue MCP server is accessible"
else
    echo "⚠️  TaskQueue MCP server test failed, but it may still work"
fi

echo "Testing Task Manager..."
if npx mcp-task-manager-server --help &> /dev/null; then
    echo "✅ Task Manager MCP server is accessible"
else
    echo "⚠️  Task Manager MCP server test failed, but it may still work"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📁 Configuration files created:"
echo "   - mcp_config.json (basic configuration)"
echo "   - qodo_mcp_config.json (configuration with descriptions)"
echo ""
echo "📋 Next steps:"
echo "1. Copy one of the configuration files to your Qodo configuration directory"
echo "2. The typical locations are:"
echo "   - ~/.qodo/mcp.json"
echo "   - ~/.config/qodo/mcp.json"
echo "   - Or as specified in your Qodo documentation"
echo ""
echo "3. Restart Qodo to load the new MCP servers"
echo ""
echo "🚀 Usage examples:"
echo "   - Context7: 'Create a React component with hooks. use context7'"
echo "   - Task management: 'Create a new task to review the authentication system'"
echo ""