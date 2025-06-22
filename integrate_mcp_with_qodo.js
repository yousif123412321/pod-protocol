#!/usr/bin/env node

/**
 * Integration script to set up MCP servers with Qodo for PoD Protocol
 */

import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

console.log('🚀 Integrating MCP Servers with Qodo for PoD Protocol...\n');

// MCP Configuration
const mcpConfig = {
    mcpServers: {
        context7: {
            command: "npx",
            args: ["-y", "@upstash/context7-mcp@latest"],
            description: "Up-to-date documentation and code examples for any library"
        },
        taskqueue: {
            command: "npx",
            args: ["-y", "@chriscarrollsmith/taskqueue"],
            description: "Structured task management with progress tracking"
        },
        "task-manager": {
            command: "npx",
            args: ["mcp-task-manager-server"],
            description: "Local task management with SQLite persistence"
        }
    }
};

// Possible Qodo config locations
const possibleQodoLocations = [
    path.join(os.homedir(), '.qodo', 'mcp.json'),
    path.join(os.homedir(), '.config', 'qodo', 'mcp.json'),
    path.join(os.homedir(), '.qodo', 'config', 'mcp.json'),
    path.join(process.cwd(), '.qodo', 'mcp.json'),
    path.join(process.cwd(), 'qodo_mcp.json')
];

async function findQodoConfigDir() {
    console.log('🔍 Looking for Qodo configuration directory...');
    
    for (const location of possibleQodoLocations) {
        const dir = path.dirname(location);
        try {
            await fs.access(dir);
            console.log(`✅ Found potential Qodo config directory: ${dir}`);
            return location;
        } catch {
            // Directory doesn't exist, continue
        }
    }
    
    // If no existing directory found, create one
    const defaultLocation = path.join(os.homedir(), '.qodo', 'mcp.json');
    const defaultDir = path.dirname(defaultLocation);
    
    try {
        await fs.mkdir(defaultDir, { recursive: true });
        console.log(`📁 Created Qodo config directory: ${defaultDir}`);
        return defaultLocation;
    } catch (error) {
        console.log(`⚠️  Could not create ${defaultDir}, using project directory`);
        return path.join(process.cwd(), 'qodo_mcp.json');
    }
}

async function installMCPConfig() {
    try {
        const configPath = await findQodoConfigDir();
        
        // Write the configuration
        await fs.writeFile(configPath, JSON.stringify(mcpConfig, null, 2));
        console.log(`✅ MCP configuration written to: ${configPath}`);
        
        // Also create a backup in the project directory
        const backupPath = path.join(process.cwd(), 'qodo_mcp_backup.json');
        await fs.writeFile(backupPath, JSON.stringify(mcpConfig, null, 2));
        console.log(`✅ Backup configuration created: ${backupPath}`);
        
        return configPath;
    } catch (error) {
        console.error(`❌ Error writing MCP configuration: ${error.message}`);
        throw error;
    }
}

async function testMCPServer(name, command, args) {
    return new Promise((resolve) => {
        console.log(`🔄 Testing ${name}...`);
        
        const child = spawn(command, [...args, '--version'], {
            stdio: 'pipe',
            timeout: 15000
        });

        let hasOutput = false;

        child.stdout?.on('data', () => {
            hasOutput = true;
        });

        child.stderr?.on('data', () => {
            hasOutput = true;
        });

        child.on('close', (code) => {
            if (code === 0 || hasOutput) {
                console.log(`✅ ${name} is accessible`);
                resolve(true);
            } else {
                console.log(`⚠️  ${name} may need manual verification`);
                resolve(false);
            }
        });

        child.on('error', (error) => {
            console.log(`⚠️  ${name} test failed: ${error.message}`);
            resolve(false);
        });

        setTimeout(() => {
            child.kill();
            console.log(`⚠️  ${name} test timed out`);
            resolve(false);
        }, 15000);
    });
}

async function main() {
    try {
        console.log('📋 Step 1: Installing MCP Configuration...');
        const configPath = await installMCPConfig();
        
        console.log('\n📋 Step 2: Testing MCP Servers...');
        const servers = Object.entries(mcpConfig.mcpServers);
        
        for (const [name, config] of servers) {
            await testMCPServer(name, config.command, config.args);
        }
        
        console.log('\n🎉 Integration Complete!');
        console.log('========================');
        console.log(`📁 Configuration installed at: ${configPath}`);
        console.log('📁 Backup available at: ./qodo_mcp_backup.json');
        
        console.log('\n🚀 Ready to use with PoD Protocol!');
        console.log('==================================');
        console.log('Context7 Usage:');
        console.log('  "Create a Solana program with Anchor. use context7"');
        console.log('  "Show me how to use @solana/web3.js. use context7"');
        console.log('  "Generate TypeScript SDK for Solana. use context7"');
        
        console.log('\nTask Management Usage:');
        console.log('  "Create a task to implement agent communication protocol"');
        console.log('  "List all pending tasks for the PoD Protocol development"');
        console.log('  "Break down the CLI development into subtasks"');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Restart Qodo to load the new MCP servers');
        console.log('2. Verify the tools appear in Qodo\'s tool list');
        console.log('3. Start using Context7 and task management in your prompts');
        
        console.log('\n💡 Pro Tips:');
        console.log('- Use "use context7" for up-to-date documentation');
        console.log('- Task management works with natural language');
        console.log('- All configurations are backed up in your project directory');
        
    } catch (error) {
        console.error(`❌ Integration failed: ${error.message}`);
        process.exit(1);
    }
}

main();