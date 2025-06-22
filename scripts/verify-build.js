#!/usr/bin/env node

/**
 * Build verification script for PoD Protocol
 * Verifies that the Solana program builds correctly and required files exist
 */

import { existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

console.log("🔍 Verifying PoD Protocol build...");

// Check if Rust program builds
try {
  console.log("📦 Building Solana program...");
  execSync("cargo build", {
    cwd: join(projectRoot, "programs", "pod-com"),
    stdio: "inherit",
  });
  console.log("✅ Solana program builds successfully");
} catch (error) {
  console.error("❌ Solana program build failed:", error.message);
  process.exit(1);
}

// Check required directories exist
const requiredDirs = ["programs/pod-com/src", "sdk/src", "cli/src", "target"];

for (const dir of requiredDirs) {
  const fullPath = join(projectRoot, dir);
  if (!existsSync(fullPath)) {
    console.error(`❌ Required directory missing: ${dir}`);
    process.exit(1);
  }
}

// Check required files exist
const requiredFiles = [
  "programs/pod-com/src/lib.rs",
  "programs/pod-com/Cargo.toml",
  "sdk/package.json",
  "cli/package.json",
  "Anchor.toml",
  "Cargo.toml",
];

for (const file of requiredFiles) {
  const fullPath = join(projectRoot, file);
  if (!existsSync(fullPath)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}

console.log("✅ Build verification completed successfully");
console.log("🎉 All required components are present and building correctly");
