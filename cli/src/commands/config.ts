import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { table } from "table";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";
import { Keypair } from "@solana/web3.js";
import qrcode from "qrcode-terminal";
import { loadConfig as loadSharedConfig } from "../utils/config.js";

interface CliConfig {
  network: string;
  keypairPath: string;
  programId?: string;
  customEndpoint?: string;
}

export class ConfigCommands {
  private getConfigPath(): string {
    return join(homedir(), ".config", "pod-com", "config.json");
  }

  private loadConfig(): CliConfig {
    return loadSharedConfig();
  }

  private saveConfig(config: CliConfig): void {
    const configPath = this.getConfigPath();
    const configDir = dirname(configPath);

    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  register(program: Command) {
    const config = program
      .command("config")
      .description("Manage CLI configuration");

    // Show current config
    config
      .command("show")
      .description("Show current configuration")
      .action(async () => {
        try {
          const currentConfig = this.loadConfig();

          const data = [
            ["Network", currentConfig.network],
            ["Keypair Path", currentConfig.keypairPath],
            ["Program ID", currentConfig.programId || "Default"],
            ["Custom Endpoint", currentConfig.customEndpoint || "None"],
          ];

          // Check if keypair exists and show public key
          if (existsSync(currentConfig.keypairPath)) {
            try {
              const keypairData = JSON.parse(
                readFileSync(currentConfig.keypairPath, "utf8")
              );
              const keypair = Keypair.fromSecretKey(
                new Uint8Array(keypairData)
              );
              data.push(["Public Key", keypair.publicKey.toBase58()]);
            } catch {
              data.push(["Public Key", chalk.red("Invalid keypair file")]);
            }
          } else {
            data.push(["Public Key", chalk.red("Keypair file not found")]);
          }

          console.log(
            "\n" +
              table(data, {
                header: {
                  alignment: "center",
                  content: chalk.blue.bold("POD-COM CLI Configuration"),
                },
              })
          );
        } catch (error: any) {
          console.error(chalk.red("Failed to show config:"), error.message);
          process.exit(1);
        }
      });

    // Set network
    config
      .command("set-network <network>")
      .description("Set the Solana network")
      .action(async (network) => {
        try {
          const validNetworks = ["devnet", "testnet", "mainnet"];
          if (!validNetworks.includes(network)) {
            console.error(
              chalk.red("Error: Invalid network. Must be one of:"),
              validNetworks.join(", ")
            );
            process.exit(1);
          }

          const currentConfig = this.loadConfig();
          currentConfig.network = network;
          this.saveConfig(currentConfig);

          console.log(
            chalk.green("✅ Network updated to:"),
            chalk.cyan(network)
          );
        } catch (error: any) {
          console.error(chalk.red("Failed to set network:"), error.message);
          process.exit(1);
        }
      });

    // Set keypair path
    config
      .command("set-keypair <path>")
      .description("Set the keypair file path")
      .action(async (path) => {
        try {
          // Expand ~ to home directory
          const expandedPath = path.startsWith("~")
            ? join(homedir(), path.slice(1))
            : path;

          if (!existsSync(expandedPath)) {
            console.error(
              chalk.red("Error: Keypair file does not exist:"),
              expandedPath
            );
            process.exit(1);
          }

          // Validate keypair file
          try {
            const keypairData = JSON.parse(readFileSync(expandedPath, "utf8"));
            const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

            const currentConfig = this.loadConfig();
            currentConfig.keypairPath = expandedPath;
            this.saveConfig(currentConfig);

            console.log(
              chalk.green("✅ Keypair path updated to:"),
              chalk.cyan(expandedPath)
            );
            console.log(
              chalk.cyan("Public key:"),
              keypair.publicKey.toBase58()
            );
          } catch {
            console.error(chalk.red("Error: Invalid keypair file format"));
            process.exit(1);
          }
        } catch (error: any) {
          console.error(chalk.red("Failed to set keypair:"), error.message);
          process.exit(1);
        }
      });

    // Generate new keypair
    config
      .command("generate-keypair")
      .description("Generate a new keypair")
      .option("-o, --output <path>", "Output file path")
      .option("-f, --force", "Overwrite existing file")
      .action(async (options) => {
        try {
          let outputPath = options.output;

          if (!outputPath) {
            const answers = await inquirer.prompt([
              {
                type: "input",
                name: "outputPath",
                message: "Output file path:",
                default: join(homedir(), ".config", "solana", "id.json"),
              },
            ]);
            outputPath = answers.outputPath;
          }

          // Expand ~ to home directory
          const expandedPath = outputPath.startsWith("~")
            ? join(homedir(), outputPath.slice(1))
            : outputPath;

          if (existsSync(expandedPath) && !options.force) {
            const answers = await inquirer.prompt([
              {
                type: "confirm",
                name: "overwrite",
                message: "File already exists. Overwrite?",
                default: false,
              },
            ]);

            if (!answers.overwrite) {
              console.log(chalk.yellow("Operation cancelled"));
              return;
            }
          }

          const spinner = ora("Generating keypair...").start();

          // Generate new keypair
          const keypair = Keypair.generate();

          // Ensure directory exists
          const outputDir = dirname(expandedPath);
          if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
          }

          // Save keypair
          writeFileSync(
            expandedPath,
            JSON.stringify(Array.from(keypair.secretKey))
          );

          spinner.succeed("Keypair generated successfully!");

          console.log(chalk.cyan("File:"), expandedPath);
          console.log(chalk.cyan("Public Key:"), keypair.publicKey.toBase58());

          // Show QR code for easy mobile access
          console.log(chalk.blue("\nPublic Key QR Code:"));
          qrcode.generate(keypair.publicKey.toBase58(), { small: true });

          // Update config to use new keypair
          const currentConfig = this.loadConfig();
          currentConfig.keypairPath = expandedPath;
          this.saveConfig(currentConfig);

          console.log(
            chalk.green("\n✅ Configuration updated to use new keypair")
          );
        } catch (error: any) {
          console.error(
            chalk.red("Failed to generate keypair:"),
            error.message
          );
          process.exit(1);
        }
      });

    // Airdrop command
    config
      .command("airdrop")
      .description("Request devnet SOL airdrop for development")
      .option("-a, --amount <sol>", "Amount of SOL to request (default: 2)", "2")
      .action(async (options) => {
        try {
          const currentConfig = this.loadConfig();
          
          if (currentConfig.network !== "devnet") {
            console.error(chalk.red("Error: Airdrop is only available on devnet"));
            console.log(chalk.yellow("Tip: Switch to devnet with 'pod config set-network devnet'"));
            return;
          }

          if (!existsSync(currentConfig.keypairPath)) {
            console.error(chalk.red("Error: Keypair file not found:"), currentConfig.keypairPath);
            console.log(chalk.yellow("Tip: Generate a new keypair with 'pod config generate-keypair'"));
            return;
          }

          const amount = parseFloat(options.amount);
          if (amount <= 0 || amount > 5) {
            console.error(chalk.red("Error: Amount must be between 0.1 and 5 SOL"));
            return;
          }

          // Load keypair to get public key
          const keypairData = JSON.parse(readFileSync(currentConfig.keypairPath, "utf8"));
          const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
          const publicKey = keypair.publicKey.toBase58();

          console.log(chalk.blue("Requesting airdrop..."));
          console.log(chalk.cyan("Wallet:"), publicKey);
          console.log(chalk.cyan("Amount:"), `${amount} SOL`);
          console.log(chalk.cyan("Network:"), "devnet");

          const spinner = ora("Requesting airdrop...").start();

          try {
            // Try multiple airdrop sources
            const endpoints = [
              "https://api.devnet.solana.com",
              "https://devnet.solana.com",
              "https://rpc.solana.com"
            ];

            let success = false;
            let signature = "";

            for (const endpoint of endpoints) {
              try {
                const response = await fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "requestAirdrop",
                    params: [publicKey, amount * 1000000000] // Convert SOL to lamports
                  })
                });

                const data = await response.json();
                
                if (data.result) {
                  signature = data.result;
                  success = true;
                  break;
                } else if (data.error) {
                  if (data.error.code === 429) {
                    continue; // Try next endpoint
                  }
                  throw new Error(data.error.message);
                }
              } catch {
                continue; // Try next endpoint
              }
            }

            if (success) {
              spinner.succeed("Airdrop successful!");
              console.log(chalk.green("Transaction signature:"), signature);
              console.log(chalk.cyan("Tip: It may take 15-30 seconds for the balance to appear"));
            } else {
              spinner.fail("All airdrop sources are rate-limited");
              console.log(chalk.yellow("\nAlternative options:"));
              console.log(chalk.cyan("1. Visit:"), "https://faucet.solana.com/");
              console.log(chalk.cyan("2. Use QuickNode faucet:"), "https://faucet.quicknode.com/solana/devnet");
              console.log(chalk.cyan("3. Try again in a few hours"));
              console.log(chalk.cyan("Your wallet address:"), publicKey);
            }

          } catch (error: any) {
            spinner.fail("Airdrop failed");
            console.error(chalk.red("Error:"), error.message);
            console.log(chalk.yellow("\nAlternative: Visit https://faucet.solana.com/"));
            console.log(chalk.cyan("Your wallet address:"), publicKey);
          }

        } catch (error: any) {
          console.error(chalk.red("Failed to request airdrop:"), error.message);
          process.exit(1);
        }
      });

    // Set custom RPC endpoint
    config
      .command("set-endpoint <url>")
      .description("Set custom RPC endpoint")
      .action(async (url) => {
        try {
          // Basic URL validation
          try {
            new URL(url);
          } catch {
            console.error(chalk.red("Error: Invalid URL format"));
            process.exit(1);
          }

          const currentConfig = this.loadConfig();
          currentConfig.customEndpoint = url;
          this.saveConfig(currentConfig);

          console.log(
            chalk.green("✅ Custom endpoint set to:"),
            chalk.cyan(url)
          );
        } catch (error: any) {
          console.error(chalk.red("Failed to set endpoint:"), error.message);
          process.exit(1);
        }
      });

    // Clear custom endpoint
    config
      .command("clear-endpoint")
      .description("Clear custom RPC endpoint (use default)")
      .action(async () => {
        try {
          const currentConfig = this.loadConfig();
          delete currentConfig.customEndpoint;
          this.saveConfig(currentConfig);

          console.log(chalk.green("✅ Custom endpoint cleared, using default"));
        } catch (error: any) {
          console.error(chalk.red("Failed to clear endpoint:"), error.message);
          process.exit(1);
        }
      });

    // Reset config to defaults
    config
      .command("reset")
      .description("Reset configuration to defaults")
      .option("-f, --force", "Skip confirmation")
      .action(async (options) => {
        try {
          if (!options.force) {
            const answers = await inquirer.prompt([
              {
                type: "confirm",
                name: "reset",
                message:
                  "Are you sure you want to reset configuration to defaults?",
                default: false,
              },
            ]);

            if (!answers.reset) {
              console.log(chalk.yellow("Operation cancelled"));
              return;
            }
          }

          const defaultConfig: CliConfig = {
            network: "devnet",
            keypairPath: join(homedir(), ".config", "solana", "id.json"),
          };

          this.saveConfig(defaultConfig);
          console.log(chalk.green("✅ Configuration reset to defaults"));
        } catch (error: any) {
          console.error(chalk.red("Failed to reset config:"), error.message);
          process.exit(1);
        }
      });

    // Interactive setup
    config
      .command("setup")
      .description("Interactive configuration setup")
      .action(async () => {
        try {
          const currentConfig = this.loadConfig();

          console.log(chalk.blue.bold("\n🚀 POD-COM CLI Setup"));
          console.log("Let's configure your POD-COM CLI environment.\n");

          const answers = await inquirer.prompt([
            {
              type: "list",
              name: "network",
              message: "Select Solana network:",
              choices: [
                { name: "Devnet (for development/testing)", value: "devnet" },
                { name: "Testnet (for staging)", value: "testnet" },
                { name: "Mainnet (for production)", value: "mainnet" },
              ],
              default: currentConfig.network,
            },
            {
              type: "confirm",
              name: "generateKeypair",
              message: "Generate a new keypair?",
              default: !existsSync(currentConfig.keypairPath),
            },
            {
              type: "input",
              name: "keypairPath",
              message: "Keypair file path:",
              default: currentConfig.keypairPath,
              when: (answers) => !answers.generateKeypair,
            },
            {
              type: "confirm",
              name: "customEndpoint",
              message: "Use custom RPC endpoint?",
              default: !!currentConfig.customEndpoint,
            },
            {
              type: "input",
              name: "endpointUrl",
              message: "RPC endpoint URL:",
              default: currentConfig.customEndpoint,
              when: (answers) => answers.customEndpoint,
            },
          ]);

          const spinner = ora("Setting up configuration...").start();

          const newConfig: CliConfig = {
            network: answers.network,
            keypairPath: currentConfig.keypairPath,
          };

          if (answers.generateKeypair) {
            // Generate new keypair
            const keypair = Keypair.generate();
            const keypairPath = join(
              homedir(),
              ".config",
              "pod-com",
              "keypair.json"
            );

            const keypairDir = dirname(keypairPath);
            if (!existsSync(keypairDir)) {
              mkdirSync(keypairDir, { recursive: true });
            }

            writeFileSync(
              keypairPath,
              JSON.stringify(Array.from(keypair.secretKey))
            );
            newConfig.keypairPath = keypairPath;

            spinner.text = "Generated new keypair...";
          } else {
            newConfig.keypairPath = answers.keypairPath;
          }

          if (answers.customEndpoint) {
            newConfig.customEndpoint = answers.endpointUrl;
          }

          this.saveConfig(newConfig);

          spinner.succeed("Setup completed successfully!");

          console.log(chalk.green("\n✅ POD-COM CLI is now configured!"));
          console.log(chalk.cyan("Network:"), newConfig.network);
          console.log(chalk.cyan("Keypair:"), newConfig.keypairPath);

          if (newConfig.customEndpoint) {
            console.log(chalk.cyan("Endpoint:"), newConfig.customEndpoint);
          }

          if (answers.generateKeypair) {
            const keypairData = JSON.parse(
              readFileSync(newConfig.keypairPath, "utf8")
            );
            const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
            console.log(
              chalk.cyan("Public Key:"),
              keypair.publicKey.toBase58()
            );
          }

          console.log(chalk.blue("\nNext steps:"));
          console.log("• Run 'pod status' to check your connection");
          console.log("• Run 'pod agent register' to register as an AI agent");
          console.log("• Run 'pod --help' to see all available commands");
        } catch (error: any) {
          console.error(chalk.red("Setup failed:"), error.message);
          process.exit(1);
        }
      });
  }
}
