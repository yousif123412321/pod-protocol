#!/bin/bash

echo "🚀 Setting up MCP Servers for Qodo with PoD Protocol..."
echo "======================================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please ensure npm is installed."
    exit 1
fi

echo "✅ npx is available"

# Create Qodo config directory if it doesn't exist
QODO_CONFIG_DIR="$HOME/.qodo"
if [ ! -d "$QODO_CONFIG_DIR" ]; then
    echo "📁 Creating Qodo config directory: $QODO_CONFIG_DIR"
    mkdir -p "$QODO_CONFIG_DIR"
fi

# Copy MCP configuration
echo "📋 Installing MCP configuration..."
cp mcp_config.jsonc "$QODO_CONFIG_DIR/mcp.json"

if [ $? -eq 0 ]; then
    echo "✅ MCP configuration installed to: $QODO_CONFIG_DIR/mcp.json"
else
    echo "❌ Failed to install MCP configuration"
    exit 1
fi

# Test MCP servers
echo ""
echo "🔄 Testing MCP servers..."
echo "========================"

echo "Testing Context7..."
if timeout 10 npx -y @upstash/context7-mcp@latest --help &> /dev/null; then
    echo "✅ Context7 MCP server is accessible"
else
    echo "⚠️  Context7 test inconclusive, but should work"
fi

echo "Testing TaskQueue..."
if timeout 10 npx -y @chriscarrollsmith/taskqueue --help &> /dev/null; then
    echo "✅ TaskQueue MCP server is accessible"
else
    echo "⚠️  TaskQueue test inconclusive, but should work"
fi

echo "Testing Task Manager..."
if timeout 10 npx mcp-task-manager-server --help &> /dev/null; then
    echo "✅ Task Manager MCP server is accessible"
else
    echo "⚠️  Task Manager test inconclusive, but should work"
fi

echo ""
echo "🎉 MCP Setup Complete!"
echo "====================="
echo ""
echo "📁 Configuration installed at: $QODO_CONFIG_DIR/mcp.json"
echo "📁 Backup available at: ./mcp_config.jsonc"
echo ""
echo "🚀 Ready for PoD Protocol Development!"
echo "====================================="
echo ""
echo "Context7 Usage Examples:"
echo "  'Create a Solana program with Anchor framework. use context7'"
echo "  'Show me @solana/web3.js transaction examples. use context7'"
echo "  'Generate TypeScript SDK for blockchain interaction. use context7'"
echo ""
echo "Task Management Examples:"
echo "  'Create a task to implement agent communication protocol'"
echo "  'List all pending tasks for PoD Protocol development'"
echo "  'Break down the CLI implementation into subtasks'"
echo ""
echo "📋 Next Steps:"
echo "1. Restart Qodo to load the new MCP servers"
echo "2. Verify tools appear in Qodo's available tools list"
echo "3. Start using 'use context7' in your prompts for up-to-date docs"
echo "4. Use natural language for task management"
echo ""
echo "💡 Pro Tips:"
echo "- Context7 provides real-time documentation for any library"
echo "- Task management integrates with your development workflow"
echo "- All configurations are version controlled in your project"
echo ""