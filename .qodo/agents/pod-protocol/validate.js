#!/usr/bin/env node

/**
 * PoD-Protocol Agent Configuration Validator
 * 
 * This script validates that the agent configuration is properly set up
 * and all required tools and dependencies are available.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AGENT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(AGENT_DIR, '../../..');

console.log('🤖 PoD-Protocol Agent Configuration Validator\n');

// Validation functions
const validations = [
  {
    name: 'Agent Configuration File',
    check: () => {
      const configPath = path.join(AGENT_DIR, 'agent.toml');
      if (!fs.existsSync(configPath)) {
        throw new Error('agent.toml not found');
      }
      const content = fs.readFileSync(configPath, 'utf8');
      if (!content.includes('PoD-Protocol Full-Stack AI Agent')) {
        throw new Error('Invalid agent configuration');
      }
      return 'agent.toml is valid';
    }
  },
  {
    name: 'MCP Configuration',
    check: () => {
      const mcpPath = path.join(PROJECT_ROOT, 'mcp.json');
      if (!fs.existsSync(mcpPath)) {
        throw new Error('mcp.json not found');
      }
      const config = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
      const requiredServers = ['fs', 'git', 'context7', 'task-manager'];
      for (const server of requiredServers) {
        if (!config.mcpServers[server]) {
          throw new Error(`Missing MCP server: ${server}`);
        }
      }
      return 'MCP configuration is valid';
    }
  },
  {
    name: 'Project Structure',
    check: () => {
      const requiredDirs = [
        'programs/pod-com',
        'sdk',
        'cli',
        'docs',
        'examples',
        'scripts',
        'tests'
      ];
      for (const dir of requiredDirs) {
        const dirPath = path.join(PROJECT_ROOT, dir);
        if (!fs.existsSync(dirPath)) {
          throw new Error(`Missing directory: ${dir}`);
        }
      }
      return 'Project structure is valid';
    }
  },
  {
    name: 'Core Files',
    check: () => {
      const requiredFiles = [
        'programs/pod-com/src/lib.rs',
        'sdk/src/client.ts',
        'cli/src/index.ts',
        'package.json',
        'Anchor.toml'
      ];
      for (const file of requiredFiles) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Missing file: ${file}`);
        }
      }
      return 'Core files are present';
    }
  },
  {
    name: 'Node.js Dependencies',
    check: () => {
      try {
        execSync('node --version', { stdio: 'pipe' });
        execSync('npm --version', { stdio: 'pipe' });
        return 'Node.js and npm are available';
      } catch (error) {
        throw new Error('Node.js or npm not found');
      }
    }
  },
  {
    name: 'Rust Toolchain',
    check: () => {
      try {
        execSync('rustc --version', { stdio: 'pipe' });
        execSync('cargo --version', { stdio: 'pipe' });
        return 'Rust toolchain is available';
      } catch (error) {
        throw new Error('Rust toolchain not found');
      }
    }
  },
  {
    name: 'Anchor Framework',
    check: () => {
      try {
        const output = execSync('anchor --version', { stdio: 'pipe', encoding: 'utf8' });
        if (!output.includes('anchor-cli')) {
          throw new Error('Invalid Anchor installation');
        }
        return `Anchor is available: ${output.trim()}`;
      } catch (error) {
        throw new Error('Anchor framework not found');
      }
    }
  },
  {
    name: 'Solana CLI',
    check: () => {
      try {
        const output = execSync('solana --version', { stdio: 'pipe', encoding: 'utf8' });
        return `Solana CLI is available: ${output.trim()}`;
      } catch (error) {
        throw new Error('Solana CLI not found');
      }
    }
  }
];

// Run validations
let passed = 0;
let failed = 0;

for (const validation of validations) {
  try {
    const result = validation.check();
    console.log(`✅ ${validation.name}: ${result}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${validation.name}: ${error.message}`);
    failed++;
  }
}

console.log(`\n📊 Validation Results:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 All validations passed! The agent is ready to use.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some validations failed. Please fix the issues above.');
  process.exit(1);
}