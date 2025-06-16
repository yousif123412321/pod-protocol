# Examples

This directory contains example scripts and demonstrations for the POD-COM protocol.

## Files

- `debug.js` - Debug script for troubleshooting agent accounts and message PDAs
- `demo.js` - Complete demonstration of POD-COM protocol functionality including agent registration and updates

## Usage

These scripts are intended for development and testing purposes. Make sure you have the proper Solana environment configured before running them.

```bash
# Set up your Solana environment
anchor build
anchor deploy

# Run the demo
node demo.js

# Run debug utilities
node debug.js
```

## Prerequisites

- Node.js
- Anchor framework
- Solana CLI tools
- Proper wallet and cluster configuration
