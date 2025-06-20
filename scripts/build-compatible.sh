#!/bin/bash

# GLIBC Compatible Build Script
set -e

echo "🔧 Building with GLIBC 2.31 compatible toolchain..."

# Source Rust environment
source ~/.cargo/env

# Check if tools are available
if ! command -v anchor &> /dev/null; then
    echo "⚠️  Anchor CLI not found, using cargo build-sbf directly"
    
    # Build using cargo directly (fallback)
    echo "🔨 Building Solana program with cargo..."
    cd programs/pod-com
    
    # Install SBF toolchain if needed
    if ! rustup target list --installed | grep -q "sbf"; then
        echo "📦 Installing SBF toolchain..."
        cargo install --git https://github.com/anza-xyz/agave.git --tag v1.18.26 cargo-build-sbf || true
    fi
    
    # Try cargo build-sbf, fallback to regular cargo
    if command -v cargo-build-sbf &> /dev/null; then
        cargo build-sbf
    else
        echo "⚠️  Using regular cargo build (development only)"
        cargo build
    fi
    
    cd ../..
else
    echo "✅ Using Anchor CLI for build"
    anchor build
fi

# Build SDK
echo "🔨 Building SDK..."
cd sdk
bun install
bun run build
cd ..

# Build CLI
echo "🔨 Building CLI..."
cd cli
bun install
bun run build
cd ..

echo "✅ Build complete!"
