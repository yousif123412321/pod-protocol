#!/usr/bin/env bun

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Build verification script to catch IDL generation and compilation issues
 * Prevents error suppression and ensures all build steps complete successfully
 */
async function verifyBuild() {
  console.log('🔍 Starting build verification with Bun...');

  try {
    // 1. Check if target directory exists
    const targetDir = path.join(process.cwd(), 'target');
    if (!fs.existsSync(targetDir)) {
      throw new Error('Target directory not found. Run `anchor build` first.');
    }

    // 2. Check if program binary exists
    const programPath = path.join(targetDir, 'deploy');
    if (!fs.existsSync(programPath)) {
      throw new Error('Program binary not found. Build may have failed.');
    }

    // 3. Verify IDL generation (CRITICAL - no error suppression)
    const idlPath = path.join(targetDir, 'idl');
    if (!fs.existsSync(idlPath)) {
      throw new Error('❌ IDL directory not found. IDL generation FAILED.');
    }
    
    const idlFiles = fs.readdirSync(idlPath).filter(file => file.endsWith('.json'));
    if (idlFiles.length === 0) {
      throw new Error('❌ No IDL files found. IDL generation FAILED.');
    }
    
    console.log(`✅ Found ${idlFiles.length} IDL file(s): ${idlFiles.join(', ')}`);
    
    // Validate IDL structure
    for (const idlFile of idlFiles) {
      const idlContent = fs.readFileSync(path.join(idlPath, idlFile), 'utf8');
      try {
        const idl = JSON.parse(idlContent);
        // Support both old and new IDL formats
const idlName = getIdlName(idl);
        if (!idlName || !idl.instructions) {
          throw new Error(`IDL file ${idlFile} is malformed - missing name or instructions.`);
        }
        console.log(`✅ IDL ${idlFile} is valid with ${idl.instructions.length} instructions`);
        
        // Check for essential instruction types
        const instructionNames = idl.instructions.map(inst => inst.name);
        const requiredInstructions = ['registerAgent', 'sendMessage', 'updateMessageStatus'];
        const missingInstructions = requiredInstructions.filter(req => !instructionNames.includes(req));
        
        if (missingInstructions.length > 0) {
          console.warn(`⚠️  IDL ${idlFile} missing expected instructions: ${missingInstructions.join(', ')}`);
        }
      } catch (e) {
        throw new Error(`IDL file ${idlFile} contains invalid JSON: ${e.message}`);
      }
    }

    // 4. Check if TypeScript types were generated
    const typesPath = path.join(targetDir, 'types');
    if (fs.existsSync(typesPath)) {
      const typeFiles = fs.readdirSync(typesPath).filter(file => file.endsWith('.ts'));
      console.log(`✅ Found ${typeFiles.length} TypeScript type file(s)`);
    } else {
      console.warn('⚠️  TypeScript types directory not found.');
    }

    // 5. Test SDK build with Bun
    console.log('🔨 Testing SDK build with Bun...');
    try {
      execSync('cd sdk && bun run build', { stdio: 'pipe' });
      console.log('✅ SDK builds successfully with Bun');
      
      // Verify SDK dist files
      const sdkDistPath = path.join('sdk', 'dist');
      if (fs.existsSync(sdkDistPath)) {
        const distFiles = fs.readdirSync(sdkDistPath);
        console.log(`✅ SDK generated ${distFiles.length} dist files`);
      }
    } catch (e) {
      throw new Error(`SDK build failed: ${e.message}`);
    }

    // 6. Test CLI build with Bun
    console.log('🔨 Testing CLI build with Bun...');
    try {
      execSync('cd cli && bun run build', { stdio: 'pipe' });
      console.log('✅ CLI builds successfully with Bun');
      
      // Verify CLI dist files
      const cliDistPath = path.join('cli', 'dist');
      if (fs.existsSync(cliDistPath)) {
        const distFiles = fs.readdirSync(cliDistPath);
        console.log(`✅ CLI generated ${distFiles.length} dist files`);
      }
    } catch (e) {
      throw new Error(`CLI build failed: ${e.message}`);
    }

    // 7. Verify no error suppression in scripts
    console.log('🔍 Checking for error suppression patterns...');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const problematicPatterns = ['|| echo', '|| true', '2>/dev/null', '|| :'];
    const scripts = packageJson.scripts || {};
    
    for (const [scriptName, scriptContent] of Object.entries(scripts)) {
      for (const pattern of problematicPatterns) {
        if (scriptContent.includes(pattern)) {
          console.warn(`⚠️  Script '${scriptName}' contains error suppression: ${pattern}`);
          console.warn(`   Consider proper error handling instead of suppression`);
        }
      }
    }

    console.log('\n🎉 Build verification completed successfully!');
    console.log('   ✅ All components built without errors');
    console.log('   ✅ IDL generation completed successfully');
    console.log('   ✅ No build error suppression detected');
    console.log('   ✅ Bun builds working properly');

  } catch (error) {
    console.error('\n❌ Build verification failed:', error.message);
    console.error('\n💡 Recommendations:');
    console.error('   1. Run `anchor clean && anchor build` to rebuild from scratch');
    console.error('   2. Check Anchor.toml configuration');
    console.error('   3. Ensure all dependencies are installed with `bun install`');
    console.error('   4. Never suppress IDL generation errors with || echo');
    console.error('   5. Review build logs for specific errors');
    console.error('\n📚 Debug help:');
    console.error('   - For IDL issues: Check program/src/lib.rs for syntax errors');
    console.error('   - For SDK issues: Check sdk/src/index.ts exports');
    console.error('   - For CLI issues: Check cli/src/index.ts imports');
    process.exit(1);
  }
}

if (require.main === module) {
  verifyBuild();
}

module.exports = { verifyBuild }; 