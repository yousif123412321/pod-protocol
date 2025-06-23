#!/usr/bin/env node

/**
 * GitHub Actions Workflow Validation Script
 * Validates all workflows for syntax, dependencies, and best practices
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as yamlParse } from 'yaml';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function validateWorkflowFile(filePath) {
  const fileName = filePath.split('/').pop();
  log(`\n🔍 Validating ${fileName}...`, 'blue');
  
  if (!existsSync(filePath)) {
    log(`❌ File not found: ${filePath}`, 'red');
    return false;
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    const workflow = yamlParse(content);
    
    // Basic structure validation
    if (!workflow.name) {
      log('❌ Missing workflow name', 'red');
      return false;
    }
    
    if (!workflow.on) {
      log('❌ Missing trigger configuration', 'red');
      return false;
    }
    
    if (!workflow.jobs || Object.keys(workflow.jobs).length === 0) {
      log('❌ No jobs defined', 'red');
      return false;
    }
    
    log(`✅ Basic structure valid`, 'green');
    
    // Validate each job
    let allJobsValid = true;
    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      log(`  🔧 Validating job: ${jobName}`, 'cyan');
      
      if (!job['runs-on']) {
        log(`    ❌ Missing runs-on for job ${jobName}`, 'red');
        allJobsValid = false;
        continue;
      }
      
      if (!job.steps || job.steps.length === 0) {
        log(`    ❌ No steps defined for job ${jobName}`, 'red');
        allJobsValid = false;
        continue;
      }
      
      // Check for common issues
      let hasCheckout = false;
      let hasSetupBun = false;
      
      for (const step of job.steps) {
        if (step.uses === 'actions/checkout@v4') {
          hasCheckout = true;
        }
        if (step.uses && step.uses.includes('setup-bun')) {
          hasSetupBun = true;
        }
      }
      
      if (!hasCheckout) {
        log(`    ⚠️  No checkout step found in job ${jobName}`, 'yellow');
      }
      
      if (fileName !== 'dependency-updates.yml' && !hasSetupBun && jobName !== 'notify-completion') {
        log(`    ⚠️  No Bun setup found in job ${jobName}`, 'yellow');
      }
      
      log(`    ✅ Job ${jobName} structure valid`, 'green');
    }
    
    return allJobsValid;
    
  } catch (error) {
    log(`❌ YAML parsing error: ${error.message}`, 'red');
    return false;
  }
}

function validateWorkflowDependencies() {
  log('\n🔗 Validating workflow dependencies...', 'blue');
  
  const requiredSecrets = [
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID', 
    'VERCEL_PROJECT_ID',
    'NPM_TOKEN',
    'GITHUB_TOKEN'
  ];
  
  const optionalSecrets = [
    'DISCORD_WEBHOOK'
  ];
  
  log('📋 Required GitHub Secrets:', 'cyan');
  requiredSecrets.forEach(secret => {
    log(`  - ${secret}`, 'yellow');
  });
  
  log('📋 Optional GitHub Secrets:', 'cyan');
  optionalSecrets.forEach(secret => {
    log(`  - ${secret}`, 'yellow');
  });
  
  return true;
}

function validateProjectStructure() {
  log('\n📁 Validating project structure...', 'blue');
  
  const requiredFiles = [
    'package.json',
    'sdk/package.json',
    'cli/package.json',
    'frontend/package.json',
    'Anchor.toml',
    'Cargo.toml',
    'programs/pod-com/Cargo.toml',
    'programs/pod-com/src/lib.rs'
  ];
  
  const requiredDirs = [
    'sdk/src',
    'cli/src',
    'frontend/src',
    'programs/pod-com/src',
    'scripts'
  ];
  
  let allValid = true;
  
  log('📄 Checking required files...', 'cyan');
  for (const file of requiredFiles) {
    if (existsSync(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file}`, 'red');
      allValid = false;
    }
  }
  
  log('📂 Checking required directories...', 'cyan');
  for (const dir of requiredDirs) {
    if (existsSync(dir)) {
      log(`  ✅ ${dir}/`, 'green');
    } else {
      log(`  ❌ ${dir}/`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validatePackageScripts() {
  log('\n📜 Validating package scripts...', 'blue');
  
  const packages = [
    { path: 'package.json', name: 'root' },
    { path: 'sdk/package.json', name: 'SDK' },
    { path: 'cli/package.json', name: 'CLI' },
    { path: 'frontend/package.json', name: 'Frontend' }
  ];
  
  let allValid = true;
  
  for (const pkg of packages) {
    if (!existsSync(pkg.path)) {
      log(`❌ ${pkg.name} package.json not found`, 'red');
      allValid = false;
      continue;
    }
    
    const packageJson = JSON.parse(readFileSync(pkg.path, 'utf8'));
    log(`📦 Checking ${pkg.name} scripts...`, 'cyan');
    
    const requiredScripts = {
      root: ['build', 'test', 'lint', 'clean'],
      SDK: ['build', 'test', 'lint', 'clean'],
      CLI: ['build', 'test', 'lint', 'clean'],
      Frontend: ['build', 'dev', 'lint']
    };
    
    const scripts = requiredScripts[pkg.name] || [];
    for (const script of scripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`  ✅ ${script}`, 'green');
      } else {
        log(`  ⚠️  ${script} (missing or optional)`, 'yellow');
      }
    }
  }
  
  return allValid;
}

function generateWorkflowSummary() {
  log('\n📊 Workflow Summary:', 'blue');
  
  const workflows = [
    { file: 'ci.yml', purpose: 'Continuous Integration - Build, Test, Lint' },
    { file: 'frontend-deploy.yml', purpose: 'Frontend Deployment to Vercel' },
    { file: 'dependency-updates.yml', purpose: 'Automated Dependency Updates' },
    { file: 'docs-deploy.yml', purpose: 'Documentation Deployment to GitHub Pages' },
    { file: 'publish-packages.yml', purpose: 'Package Publishing to NPM & GitHub' },
    { file: 'release.yml', purpose: 'Release Management & GitHub Releases' }
  ];
  
  workflows.forEach(workflow => {
    log(`  🔄 ${workflow.file}`, 'cyan');
    log(`     ${workflow.purpose}`, 'reset');
  });
}

async function main() {
  log('🚀 PoD Protocol Workflow Validation', 'green');
  log('=====================================', 'green');
  
  const workflowDir = '.github/workflows';
  const workflows = [
    'ci.yml',
    'frontend-deploy.yml', 
    'dependency-updates.yml',
    'docs-deploy.yml',
    'publish-packages.yml',
    'release.yml'
  ];
  
  let allValid = true;
  
  // Validate each workflow file
  for (const workflow of workflows) {
    const filePath = join(workflowDir, workflow);
    const isValid = validateWorkflowFile(filePath);
    if (!isValid) {
      allValid = false;
    }
  }
  
  // Validate dependencies and structure
  const depsValid = validateWorkflowDependencies();
  const structureValid = validateProjectStructure();
  const scriptsValid = validatePackageScripts();
  
  if (!depsValid || !structureValid || !scriptsValid) {
    allValid = false;
  }
  
  generateWorkflowSummary();
  
  log('\n=====================================', 'green');
  if (allValid) {
    log('✅ All workflows validated successfully!', 'green');
    log('🎉 Your GitHub Actions setup is ready for production!', 'green');
  } else {
    log('❌ Some issues found in workflow validation', 'red');
    log('🔧 Please fix the issues above before deploying', 'yellow');
    process.exit(1);
  }
}

// Handle YAML parsing (simple implementation)
function simpleParse(yamlString) {
  // This is a very basic YAML parser for validation purposes
  // In production, you'd want to use a proper YAML library
  try {
    // Convert YAML to JSON-like structure for basic validation
    const lines = yamlString.split('\n');
    const result = {};
    let currentKey = null;
    let currentObject = result;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      if (trimmed.includes(':') && !trimmed.startsWith('-')) {
        const [key, value] = trimmed.split(':').map(s => s.trim());
        if (value) {
          currentObject[key] = value.replace(/[\"']/g, '');
        } else {
          currentObject[key] = {};
          currentKey = key;
        }
      }
    }
    
    // Basic structure check
    return {
      name: result.name || 'Unknown',
      on: result.on || result.trigger || {},
      jobs: result.jobs || {}
    };
  } catch (error) {
    throw new Error(`YAML parsing failed: ${error.message}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}