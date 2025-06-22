#!/usr/bin/env node

/**
 * Quick test script to verify MCP servers are accessible
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

console.log('🚀 Testing MCP Servers for PoD Protocol...\n');

// Test if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
    console.error(`❌ Node.js version ${nodeVersion} is too old. Need >= 18.0.0`);
    process.exit(1);
}

console.log(`✅ Node.js version ${nodeVersion} is compatible`);

// Function to test MCP server availability
async function testMCPServer(name, command, args) {
    return new Promise((resolve) => {
        console.log(`🔄 Testing ${name}...`);
        
        const child = spawn(command, [...args, '--help'], {
            stdio: 'pipe',
            timeout: 10000
        });

        let output = '';
        let errorOutput = '';

        child.stdout?.on('data', (data) => {
            output += data.toString();
        });

        child.stderr?.on('data', (data) => {
            errorOutput += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0 || output.length > 0) {
                console.log(`✅ ${name} is accessible`);
                resolve(true);
            } else {
                console.log(`⚠️  ${name} test failed, but may still work in MCP context`);
                resolve(false);
            }
        });

        child.on('error', (error) => {
            console.log(`⚠️  ${name} test failed: ${error.message}`);
            resolve(false);
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            child.kill();
            console.log(`⚠️  ${name} test timed out, but may still work`);
            resolve(false);
        }, 10000);
    });
}

// Test all MCP servers
async function testAllServers() {
    const servers = [
        {
            name: 'Context7',
            command: 'npx',
            args: ['-y', '@upstash/context7-mcp@latest']
        },
        {
            name: 'TaskQueue',
            command: 'npx',
            args: ['-y', '@chriscarrollsmith/taskqueue']
        },
        {
            name: 'Task Manager',
            command: 'npx',
            args: ['mcp-task-manager-server']
        }
    ];

    console.log('\n📋 Testing MCP Servers:\n');

    const results = [];
    for (const server of servers) {
        const result = await testMCPServer(server.name, server.command, server.args);
        results.push({ ...server, working: result });
    }

    console.log('\n📊 Test Results:');
    console.log('================');
    
    results.forEach(server => {
        const status = server.working ? '✅ Working' : '⚠️  Needs verification';
        console.log(`${server.name}: ${status}`);
    });

    // Check if config files exist
    console.log('\n📁 Configuration Files:');
    console.log('=======================');
    
    try {
        await fs.access('./mcp_config.json');
        console.log('✅ mcp_config.json exists');
    } catch {
        console.log('❌ mcp_config.json not found');
    }

    try {
        await fs.access('./qodo_mcp_config.json');
        console.log('✅ qodo_mcp_config.json exists');
    } catch {
        console.log('❌ qodo_mcp_config.json not found');
    }

    console.log('\n🎉 MCP Server test complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Copy mcp_config.json to your Qodo configuration directory');
    console.log('2. Restart Qodo to load the MCP servers');
    console.log('3. Start using Context7 with "use context7" in your prompts');
    console.log('4. Use task management commands naturally');
    
    return results;
}

// Run the tests
testAllServers().catch(console.error);