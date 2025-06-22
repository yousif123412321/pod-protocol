# Scripts Directory

This directory contains utility scripts for building, testing, and deploying the PoD Protocol.

## Build Scripts

### `build.js`
Main build script for the entire project including Rust programs, TypeScript SDK, and CLI.

### `build-compatible.sh`
Builds the project with compatibility settings for different environments.

### `verify-build.js`
Verifies that all build artifacts are correctly generated and functional.

## Development Scripts

### `dev-with-zk.sh`
Starts the development environment with ZK compression enabled using Light Protocol.

### `setup-photon-indexer.sh`
Sets up the Photon indexer for querying compressed data.

### `setup-package-managers.js`
Configures and installs dependencies across all workspace packages.

## Deployment Scripts

### `deploy-docs.sh`
Deploys documentation to GitHub Pages.

### `deploy-frontend.sh`
Deploys the frontend application to production.

## Testing & Validation Scripts

### `production-test.js`
Comprehensive production readiness testing for SDK and CLI packages.

### `validate-workflows.js`
Validates GitHub Actions workflow configurations.

## Utility Scripts

### `fix-types.js`
Fixes TypeScript type instantiation issues in service files.

### `make-executable.sh`
Makes scripts executable with proper permissions.

## Usage

Most scripts can be run directly:

```bash
# Build the entire project
node scripts/build.js

# Start development with ZK compression
./scripts/dev-with-zk.sh

# Run production tests
node scripts/production-test.js

# Deploy documentation
./scripts/deploy-docs.sh
```

## Dependencies

- **Node.js/Bun**: Required for JavaScript/TypeScript scripts
- **Bash**: Required for shell scripts
- **Anchor CLI**: Required for Solana program operations
- **Solana CLI**: Required for blockchain interactions

## Environment Variables

Some scripts may require environment variables to be set. Check individual script files for specific requirements.