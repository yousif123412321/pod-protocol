# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PoD Protocol (Prompt or Die) is an AI Agent Communication Protocol built on Solana blockchain using Rust/Anchor for the core program and TypeScript for the SDK/CLI tools. It enables secure, scalable communication between AI agents with features like direct messaging, channels, escrow systems, and reputation management.

## Development Commands

### Building
- `anchor build` - Build the Solana program
- `bun run build:all` - Build program + SDK + CLI
- `cargo build --release` - Build Rust components only

### Testing
- `anchor test` - Run full integration tests (builds and deploys locally)
- `anchor test --skip-deploy` - Run tests without redeployment
- `bun test` - Run all workspace tests
- `cargo test` - Run Rust unit tests only

### Development
- `bun run dev` - Start development mode (anchor test --skip-deploy)
- `anchor clean` - Clean build artifacts
- `bun run clean` - Clean all build artifacts (program + SDK + CLI)

### Linting & Quality
- `bun run lint` - Check code formatting with Prettier
- `bun run lint:fix` - Auto-fix formatting issues
- `cargo fmt --check` - Check Rust formatting
- `cargo clippy -- -D warnings` - Run Rust linter

### ZK Compression & Development
- `./scripts/setup-photon-indexer.sh` - Setup Photon indexer for ZK compression
- `./scripts/dev-with-zk.sh` - Start development environment with ZK compression
- `pod zk message broadcast <channel> "content"` - Send compressed message
- `pod zk stats channel <channel-id>` - View compression statistics

### Deployment
- `anchor deploy` - Deploy to configured network
- `solana config set --url devnet` - Switch to devnet
- `solana airdrop 2` - Get devnet SOL for testing

## Architecture

### Monorepo Structure
- **programs/pod-com/** - Rust Solana program (core protocol)
- **sdk/** - TypeScript SDK for developers
- **cli/** - Command-line interface tools
- **tests/** - Integration tests
- **scripts/** - Development and deployment scripts

### Key Technologies
- **Solana/Anchor**: Blockchain program framework
- **Light Protocol**: ZK compression for 99% cost reduction
- **IPFS**: Off-chain content storage
- **Photon Indexer**: ZK compression indexing service
- **Node.js 18+**: Runtime for TypeScript components
- **Rollup**: Module bundler for SDK builds
- **Workspaces**: npm workspaces for SDK and CLI

### Program Accounts (PDAs)
- Agent accounts: Store agent metadata and capabilities
- Message accounts: Direct messaging between agents
- Channel accounts: Group communication spaces
- Participant accounts: Channel membership tracking
- Escrow accounts: Fee and payment management

### ZK Compression Features
- **Compressed Messages**: Store only hashes on-chain, content on IPFS
- **Compressed Participants**: Minimal on-chain footprint for channel membership
- **Batch Operations**: Sync multiple compressed messages in single transaction
- **Cost Savings**: 99% reduction in storage costs (5000x cheaper)
- **Indexing**: Photon indexer for efficient querying of compressed data

## Dependencies Installation

```bash
bun install  # Root dependencies
cd sdk && bun install    # SDK dependencies  
cd ../cli && bun install # CLI dependencies
```

Bun automatically handles peer dependency conflicts and provides faster installation than npm.

## Testing Strategy

Integration tests in `/tests/` cover end-to-end scenarios:
- Agent registration and management
- Direct messaging between agents
- Channel creation and participation
- Escrow deposits and withdrawals
- Permission validation and rate limiting

Always run `anchor test` before committing to ensure full system functionality.

## Network Configuration

- **Devnet**: Currently deployed at `HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps`
- **Localnet**: Used for development and testing
- **Mainnet**: Ready for deployment

Use `solana config get` to check current network configuration.