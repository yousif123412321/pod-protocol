# Build Safety Guide

## 🚨 Critical Build Safety Rules

### 1. **NEVER Suppress IDL Generation Errors**

❌ **DON'T DO THIS:**
```bash
# These patterns hide critical errors
"build": "anchor build --no-idl && anchor idl build --no-build || echo 'IDL generation failed, but program compiled successfully'"
"build": "anchor build 2>/dev/null || true"
"build": "anchor build || echo 'Build failed but continuing'"
```

✅ **DO THIS INSTEAD:**
```bash
# Proper error handling without suppression
"build": "anchor build"
"build:safe": "anchor build --no-idl"
"build:idl": "anchor idl build"
"build:full": "bun run build:safe && bun run build:idl"
"verify:build": "bun scripts/verify-build.js"
```

### 2. **Why IDL Generation Errors Are Critical**

IDL (Interface Definition Language) generation failures indicate:
- **Program compilation issues** that aren't caught by basic build
- **Type definition problems** that break SDK integration
- **ABI inconsistencies** between program and client
- **Missing or malformed instruction definitions**

### 3. **Proper Build Process with Bun**

```bash
# 1. Clean build
bun run clean

# 2. Full build with verification
bun run build:verify

# 3. Build all components
bun run build:all

# 4. Manual verification if needed
bun run verify:build
```

### 4. **Build Script Best Practices**

#### ✅ Good Patterns:
```json
{
  "scripts": {
    "build": "anchor build",
    "build:verify": "bun run build:full && bun run verify:build",
    "build:full": "bun run build:safe && bun run build:idl",
    "pretest": "bun run build:verify"
  }
}
```

#### ❌ Dangerous Patterns to Avoid:
```json
{
  "scripts": {
    "build": "anchor build || echo 'continuing anyway'",
    "build": "anchor build 2>/dev/null",
    "build": "anchor build || true"
  }
}
```

### 5. **Debugging Build Issues**

#### IDL Generation Failures:
1. Check `programs/*/src/lib.rs` for syntax errors
2. Ensure all structs have proper `#[derive]` attributes
3. Verify instruction parameters are properly typed
4. Check for circular dependencies in type definitions

#### SDK Build Failures:
1. Ensure IDL was generated successfully
2. Check `sdk/src/pod_com.ts` exports match IDL
3. Verify TypeScript types are properly generated
4. Check import paths in SDK files

#### CLI Build Failures:
1. Ensure SDK builds successfully first
2. Check CLI dependencies on SDK types
3. Verify import statements use correct paths

### 6. **Verification Checklist**

Before deploying or releasing:

- [ ] `anchor build` completes without errors
- [ ] IDL files are generated in `target/idl/`
- [ ] TypeScript types are generated in `target/types/`
- [ ] SDK builds successfully with `bun run build`
- [ ] CLI builds successfully with `bun run build`
- [ ] No error suppression patterns in scripts
- [ ] Verification script passes: `bun run verify:build`

### 7. **Emergency Debugging**

If builds are failing:

```bash
# 1. Complete clean rebuild
anchor clean
rm -rf target/ node_modules/ sdk/dist/ cli/dist/
bun install

# 2. Step-by-step build
anchor build --no-idl  # Build program only
anchor idl build       # Generate IDL
bun run verify:build   # Check everything

# 3. Check specific components
cd sdk && bun run build
cd ../cli && bun run build
```

### 8. **CI/CD Configuration**

For automated builds, use:

```yaml
# GitHub Actions example
- name: Build with verification
  run: |
    bun install
    bun run build:verify
    
# Never use error suppression in CI
# This will hide critical issues:
# run: bun run build || echo "Build failed but continuing"  # ❌ DON'T
```

## 🎯 Key Takeaways

1. **Error suppression masks critical issues**
2. **IDL generation is not optional**
3. **Always use verification scripts**
4. **Bun provides better error reporting than npm**
5. **Build failures should stop the process, not hide**

Following these guidelines ensures reliable, consistent builds and prevents deployment of broken code. 