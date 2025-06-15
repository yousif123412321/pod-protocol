# POD-COM Solana Anchor Dependency Migration Guide

This document outlines the migration process from older Solana/Anchor versions to the latest compatible versions, including the transition to Agave CLI.

## Overview

This migration involved:
1. Updating Rust and Cargo toolchains
2. Migrating from Solana CLI to Agave CLI
3. Updating Anchor to version 0.31.1
4. Resolving dependency conflicts, particularly with `getrandom` and `rand` crates
5. Configuring the build environment for Solana/Agave compatibility

## Prerequisites

- Rust (nightly toolchain)
- Agave CLI (replacing Solana CLI)
- Anchor 0.31.1 (via AVM)
- Node.js 18+
- Bun (or Yarn as fallback)

## Migration Steps

### 1. Environment Setup

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install nightly toolchain
rustup toolchain install nightly
rustup default nightly

# Install Agave CLI (replacing Solana CLI)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor via AVM
cargo install --git https://github.com/coral-xyz/anchor avm --force --locked
avm install 0.31.1
avm use 0.31.1

# Install Bun
curl -fsSL https://bun.sh/install | bash
```

### 2. Project Configuration Updates

#### Cargo.toml

Key changes made:
- Updated `anchor-lang` to version 0.31.1
- Removed direct and transitive dependencies on `getrandom` and `rand`
- Fixed feature flags and dependency specifications
- Added proper dev-dependencies

Example configuration:
```toml
[package]
name = "pod-com"
version = "0.1.0"
description = "POD-COM: AI Agent Communication Protocol"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "pod_com"

[features]
default = []
cpi = ["no-entrypoint"]
no-entrypoint = []
no-idl = []
idl-build = ["anchor-lang/idl-build"]

[dependencies]
anchor-lang = { version = "=0.31.1", default-features = false, features = ["init-if-needed"] }

[dev-dependencies]
anchor-lang = { version = "=0.31.1", features = ["derive"] }
```

#### Anchor.toml

Updated to use Yarn (as Anchor CLI doesn't fully support Bun yet):

```toml
[features]
seeds = false
skip-lint = false

[programs.devnet]
pod_com = "HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps"

[registry]
url = "https://anchor.projectserum.com"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "bun test"
```

### 3. Build Configuration

#### .cargo/config.toml

```toml
[build]
target = "aarch64-apple-darwin"  # Adjust for your architecture

[target.'cfg(target_arch = "wasm32")']
rustflags = [
    "-C", "link-arg=--import-memory",
    "-C", "link-arg=--export-table",
]

[target.'cfg(not(target_arch = "wasm32"))']
rustflags = [
    "-C", "link-arg=-z",
    "-C", "link-arg=notext",
    "-C", "link-arg=--no-rosegment",
]
```

## Common Issues and Solutions

### 1. getrandom/rand Crate Errors

**Issue**: Build fails with errors about `getrandom` or `rand` crates not supporting the `wasm32-wasi` target.

**Solution**:
1. Remove any direct or indirect dependencies on `getrandom` and `rand`
2. Avoid using crates that depend on these for randomness
3. Use Solana's `solana_program::hash` or other deterministic alternatives

### 2. Build Failures with `-Znext-lockfile-bump`

**Issue**: Build fails with `-Znext-lockfile-bump` flag not recognized.

**Solution**:
1. Remove `-Znext-lockfile-bump` from `.cargo/config.toml`
2. Clean build artifacts: `cargo clean`
3. Rebuild the project

### 3. Insufficient Devnet SOL

**Issue**: Deployment fails with insufficient SOL in devnet account.

**Solution**:
```bash
solana airdrop 2
```

## Testing and Validation

1. Build the project:
   ```bash
   anchor build
   ```

2. Run tests:
   ```bash
   anchor test
   ```

3. Deploy to devnet:
   ```bash
   anchor deploy
   ```

## Best Practices

1. **Dependency Management**
   - Pin all dependency versions
   - Regularly update dependencies to their latest compatible versions
   - Audit dependencies for security vulnerabilities

2. **Build Process**
   - Use the nightly Rust toolchain for Solana/Agave development
   - Keep build configurations in version control
   - Document any required environment variables

3. **Testing**
   - Write comprehensive unit and integration tests
   - Test against both local and devnet environments
   - Include edge cases and error conditions

## Rollback Plan

If issues arise after migration:

1. Revert to the previous working commit:
   ```bash
   git checkout <previous-commit-hash>
   ```

2. Clean and rebuild:
   ```bash
   cargo clean
   cargo build
   ```

3. Verify functionality:
   ```bash
   anchor test
   ```

## Conclusion

This migration updates the POD-COM project to use the latest versions of Solana/Agave and Anchor, resolving dependency conflicts and ensuring compatibility with modern tooling. The project is now ready for further development with improved stability and maintainability.
