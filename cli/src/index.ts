#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { AgentCommands } from "./commands/agent.js";
import { MessageCommands } from "./commands/message.js";
import { ChannelCommands } from "./commands/channel.js";
import { EscrowCommands } from "./commands/escrow.js";
import { ConfigCommands } from "./commands/config.js";

// Get current version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf8"));
const CLI_VERSION = packageJson.version;

const program = new Command();

console.log(
  chalk.blue.bold(`
┌─────────────────────────────────────────┐
│        PoD Protocol CLI v${CLI_VERSION.padEnd(10)}          │
│      PoD Protocol (Prompt or Die)      │
│        on Solana Blockchain            │
└─────────────────────────────────────────┘
`)
);

program
  .name("pod")
  .description("CLI for PoD Protocol (Prompt or Die) AI Agent Communication Protocol")
  .version(CLI_VERSION);

// Global options
program
  .option(
    "-n, --network <network>",
    "Solana network (devnet, testnet, mainnet)",
    "devnet"
  )
  .option(
    "-k, --keypair <path>",
    "Path to keypair file",
    "~/.config/solana/id.json"
  )
  .option("-v, --verbose", "Verbose output")
  .option("--dry-run", "Show what would be executed without actually doing it");

// Initialize command modules
const agentCommands = new AgentCommands();
const messageCommands = new MessageCommands();
const channelCommands = new ChannelCommands();
const escrowCommands = new EscrowCommands();
const configCommands = new ConfigCommands();

// Register command groups
agentCommands.register(program);
messageCommands.register(program);
channelCommands.register(program);
escrowCommands.register(program);
configCommands.register(program);

// Status command
program
  .command("status")
  .description("Show POD-COM protocol status")
  .action(async (options) => {
    console.log(chalk.green("✅ POD-COM Protocol Status"));
    console.log(chalk.cyan("Network:"), options.network);
    console.log(
      chalk.cyan("Program ID:"),
      "HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps"
    );
    console.log(chalk.cyan("Status:"), chalk.green("OPERATIONAL"));
    console.log(chalk.cyan("Version:"), CLI_VERSION);
  });

// Update command
program
  .command("update")
  .description("Update POD-COM CLI to the latest version")
  .option("-f, --force", "Force update even if already on latest version")
  .action(async (options) => {
    const { execSync } = await import("child_process");
    const ora = (await import("ora")).default;
    
    console.log(chalk.blue("🔍 Checking for updates..."));
    
    try {
      // Check current version
      const currentVersion = CLI_VERSION;
      
      // Check latest version from npm
      const spinner = ora("Fetching latest version...").start();
      
      let latestVersion;
      try {
        const output = execSync("npm view @pod-protocol/cli version", { 
          encoding: "utf8", 
          stdio: "pipe" 
        });
        latestVersion = output.trim();
      } catch {
        spinner.fail("Failed to fetch latest version");
        console.error(chalk.red("Error:"), "Could not check for updates");
        return;
      }
      
      spinner.succeed(`Current: ${currentVersion}, Latest: ${latestVersion}`);
      
      if (currentVersion === latestVersion && !options.force) {
        console.log(chalk.green("✅ You're already on the latest version!"));
        return;
      }
      
      if (options.force || currentVersion !== latestVersion) {
        console.log(chalk.blue("📦 Updating CLI..."));
        
        const updateSpinner = ora("Installing update...").start();
        
        try {
          // Update the CLI
          execSync("npm install -g @pod-protocol/cli@latest", { 
            stdio: "pipe" 
          });
          
          updateSpinner.succeed("Update completed!");
          console.log(chalk.green("✅ Successfully updated to version"), latestVersion);
          console.log(chalk.cyan("Tip: Run 'pod --version' to verify the update"));
          
        } catch {
          updateSpinner.fail("Update failed");
          console.error(chalk.red("Error:"), "Failed to update CLI");
          console.log(chalk.yellow("Try running: npm install -g @pod-protocol/cli@latest"));
        }
      }
      
    } catch (error: any) {
      console.error(chalk.red("Update failed:"), error.message);
      console.log(chalk.yellow("Manual update: npm install -g @pod-protocol/cli@latest"));
    }
  });

// Help command customization
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + " " + cmd.usage(),
});

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (err: any) {
  if (err.code === "commander.help") {
    process.exit(0);
  }
  if (err.code === "commander.version") {
    process.exit(0);
  }
  console.error(chalk.red("Error:"), err.message);
  process.exit(1);
}

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
