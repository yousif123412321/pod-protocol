# Qodo MCP Servers Setup

This directory contains configuration files and setup scripts for integrating MCP (Model Context Protocol) servers with Qodo.

## 📁 Files Created

- `mcp_config.json` - Basic MCP server configuration
- `qodo_mcp_config.json` - Enhanced configuration with descriptions
- `setup_mcp_servers.sh` - Setup and validation script
- `MCP_SETUP_README.md` - This documentation file

## 🚀 Quick Setup

1. **Run the setup script:**
   ```bash
   chmod +x setup_mcp_servers.sh
   ./setup_mcp_servers.sh
   ```

2. **Copy configuration to Qodo:**
   ```bash
   # Find your Qodo config directory (one of these locations):
   # ~/.qodo/
   # ~/.config/qodo/
   # Or check Qodo documentation for the correct path
   
   # Copy the configuration file:
   cp mcp_config.json ~/.qodo/mcp.json
   # OR
   cp qodo_mcp_config.json ~/.qodo/mcp.json
   ```

3. **Restart Qodo** to load the new MCP servers

## 🛠️ MCP Servers Included

### 1. Context7
- **Purpose:** Provides up-to-date documentation and code examples
- **Usage:** Add `use context7` to your prompts
- **Example:** `"Create a React component with hooks. use context7"`

### 2. TaskQueue
- **Purpose:** Structured task management with progress tracking
- **Features:** User approval checkpoints, multiple LLM provider support
- **Usage:** Natural language task management commands

### 3. Task Manager
- **Purpose:** Local task management with SQLite persistence
- **Features:** Project-based organization, hierarchical tasks
- **Usage:** Create, update, and track development tasks

## 💡 Usage Examples

### Context7 Examples:
```
"How do I use the new Next.js app router? use context7"
"Show me Python requests library error handling. use context7"
"Create a FastAPI CRUD endpoint. use context7"
```

### Task Management Examples:
```
"Create a new task to implement user authentication"
"List all pending tasks for the frontend module"
"Mark the database migration task as completed"
"Break down the API development into subtasks"
```

## 🔧 Configuration Details

The MCP configuration follows this structure:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "description": "Optional description"
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues:

1. **Node.js not found:**
   - Install Node.js 18.0.0 or higher from [nodejs.org](https://nodejs.org/)

2. **MCP servers not appearing in Qodo:**
   - Check configuration file location
   - Restart Qodo after configuration changes
   - Verify JSON syntax is correct

3. **Connection errors:**
   - Ensure internet connection is stable
   - Try using `bunx` instead of `npx` if issues persist:
     ```json
     {
       "command": "bunx",
       "args": ["-y", "package-name"]
     }
     ```

4. **Permission errors:**
   - Make sure the setup script is executable: `chmod +x setup_mcp_servers.sh`

### Alternative Runtime Options:

If you encounter issues with `npx`, try these alternatives:

**Using Bun:**
```json
{
  "context7": {
    "command": "bunx",
    "args": ["-y", "@upstash/context7-mcp@latest"]
  }
}
```

**Using Deno:**
```json
{
  "context7": {
    "command": "deno", 
    "args": ["run", "--allow-net", "npm:@upstash/context7-mcp"]
  }
}
```

## 📚 Additional Resources

- [Qodo Documentation](https://docs.qodo.ai/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Context7 GitHub](https://github.com/upstash/context7)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

## 🔄 Updating MCP Servers

To update the MCP servers to their latest versions:

```bash
# Clear npm cache
npm cache clean --force

# The servers will automatically download the latest versions
# when Qodo starts them with the @latest tag
```

## 📞 Support

If you encounter issues:

1. Check the Qodo documentation for MCP configuration
2. Verify Node.js and npm are properly installed
3. Test the configuration with the provided setup script
4. Check Qodo logs for error messages

---

**Note:** This setup assumes you're using Qodo Gen CLI or Qodo with MCP support. Make sure your Qodo version supports MCP integration.