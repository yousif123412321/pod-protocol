#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { AgentCommands } from "./commands/agent";
import { MessageCommands } from "./commands/message";
import { ChannelCommands } from "./commands/channel";
import { EscrowCommands } from "./commands/escrow";
import { ConfigCommands } from "./commands/config";

const program = new Command();

console.log(chalk.blue.bold(`
┌─────────────────────────────────────────┐
│        POD-COM CLI v1.0.0               │
│   AI Agent Communication Protocol      │
│        on Solana Blockchain            │
└─────────────────────────────────────────┘
`));

program
  .name("pod")
  .description("CLI for POD-COM AI Agent Communication Protocol")
  .version("1.0.0");

// Global options
program
  .option("-n, --network <network>", "Solana network (devnet, testnet, mainnet)", "devnet")
  .option("-k, --keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
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
    console.log(chalk.cyan("Program ID:"), "HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps");
    console.log(chalk.cyan("Status:"), chalk.green("OPERATIONAL"));
    console.log(chalk.cyan("Version:"), "1.0.0");
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