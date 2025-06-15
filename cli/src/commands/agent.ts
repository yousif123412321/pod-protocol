import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { table } from "table";
import { PublicKey } from "@solana/web3.js";
import { PodComClient, AGENT_CAPABILITIES, getCapabilityNames } from "@pod-com/sdk";
import { loadKeypair, getNetworkEndpoint } from "../utils/config";

export class AgentCommands {
  register(program: Command) {
    const agent = program
      .command("agent")
      .description("Manage AI agents on POD-COM");

    // Register agent
    agent
      .command("register")
      .description("Register a new AI agent")
      .option("-c, --capabilities <value>", "Agent capabilities as number")
      .option("-m, --metadata <uri>", "Metadata URI")
      .option("-i, --interactive", "Interactive registration")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();
        
        try {
          let capabilities = options.capabilities ? parseInt(options.capabilities) : 0;
          let metadataUri = options.metadata || "";

          if (options.interactive) {
            const answers = await inquirer.prompt([
              {
                type: "checkbox",
                name: "capabilities",
                message: "Select agent capabilities:",
                choices: [
                  { name: "Trading", value: AGENT_CAPABILITIES.TRADING },
                  { name: "Analysis", value: AGENT_CAPABILITIES.ANALYSIS },
                  { name: "Data Processing", value: AGENT_CAPABILITIES.DATA_PROCESSING },
                  { name: "Content Generation", value: AGENT_CAPABILITIES.CONTENT_GENERATION },
                ]
              },
              {
                type: "input",
                name: "metadataUri",
                message: "Metadata URI (optional):",
                default: ""
              }
            ]);

            capabilities = answers.capabilities.reduce((acc: number, cap: number) => acc | cap, 0);
            metadataUri = answers.metadataUri;
          }

          if (!metadataUri) {
            metadataUri = `https://pod-com.org/agents/${Date.now()}`;
          }

          const spinner = ora("Registering agent...").start();

          const client = new PodComClient({
            endpoint: getNetworkEndpoint(globalOpts.network),
            commitment: "confirmed"
          });

          await client.initialize();
          const wallet = loadKeypair(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Agent registration prepared");
            console.log(chalk.cyan("Capabilities:"), getCapabilityNames(capabilities).join(", "));
            console.log(chalk.cyan("Metadata URI:"), metadataUri);
            return;
          }

          const signature = await client.registerAgent(wallet, {
            capabilities,
            metadataUri
          });

          spinner.succeed("Agent registered successfully!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Capabilities:"), getCapabilityNames(capabilities).join(", "));
          console.log(chalk.cyan("Metadata URI:"), metadataUri);

        } catch (error: any) {
          console.error(chalk.red("Failed to register agent:"), error.message);
          process.exit(1);
        }
      });

    // Show agent info
    agent
      .command("info [address]")
      .description("Show agent information")
      .action(async (address, cmd) => {
        const globalOpts = cmd.optsWithGlobals();
        
        try {
          const spinner = ora("Fetching agent information...").start();

          const client = new PodComClient({
            endpoint: getNetworkEndpoint(globalOpts.network),
            commitment: "confirmed"
          });

          await client.initialize();
          
          let walletAddress;
          if (address) {
            walletAddress = new PublicKey(address);
          } else {
            const wallet = loadKeypair(globalOpts.keypair);
            walletAddress = wallet.publicKey;
          }

          const agentData = await client.getAgent(walletAddress);

          if (!agentData) {
            spinner.fail("Agent not found");
            return;
          }

          spinner.succeed("Agent information retrieved");

          const data = [
            ["Public Key", agentData.pubkey.toBase58()],
            ["Capabilities", getCapabilityNames(agentData.capabilities).join(", ")],
            ["Reputation", agentData.reputation.toString()],
            ["Metadata URI", agentData.metadataUri],
            ["Last Updated", new Date(agentData.lastUpdated * 1000).toLocaleString()]
          ];

          console.log("\n" + table(data, {
            header: {
              alignment: "center",
              content: chalk.blue.bold("Agent Information")
            }
          }));

        } catch (error: any) {
          console.error(chalk.red("Failed to fetch agent info:"), error.message);
          process.exit(1);
        }
      });

    // Update agent
    agent
      .command("update")
      .description("Update agent information")
      .option("-c, --capabilities <value>", "New capabilities")
      .option("-m, --metadata <uri>", "New metadata URI")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();
        
        try {
          const spinner = ora("Updating agent...").start();

          const client = new PodComClient({
            endpoint: getNetworkEndpoint(globalOpts.network),
            commitment: "confirmed"
          });

          await client.initialize();
          const wallet = loadKeypair(globalOpts.keypair);

          const updateOptions: any = {};
          if (options.capabilities) {
            updateOptions.capabilities = parseInt(options.capabilities);
          }
          if (options.metadata) {
            updateOptions.metadataUri = options.metadata;
          }

          if (Object.keys(updateOptions).length === 0) {
            spinner.fail("No updates specified");
            return;
          }

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Agent update prepared");
            console.log(chalk.cyan("Updates:"), JSON.stringify(updateOptions, null, 2));
            return;
          }

          const signature = await client.updateAgent(wallet, updateOptions);

          spinner.succeed("Agent updated successfully!");
          console.log(chalk.green("Transaction:"), signature);

        } catch (error: any) {
          console.error(chalk.red("Failed to update agent:"), error.message);
          process.exit(1);
        }
      });

    // List all agents
    agent
      .command("list")
      .description("List all registered agents")
      .option("-l, --limit <number>", "Maximum number of agents to show", "10")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();
        
        try {
          const spinner = ora("Fetching agents...").start();

          const client = new PodComClient({
            endpoint: getNetworkEndpoint(globalOpts.network),
            commitment: "confirmed"
          });

          await client.initialize();
          
          const agents = await client.getAllAgents(parseInt(options.limit));

          if (agents.length === 0) {
            spinner.succeed("No agents found");
            return;
          }

          spinner.succeed(`Found ${agents.length} agents`);

          const data = agents.map((agent: any) => [
            agent.pubkey.toBase58().slice(0, 8) + "...",
            getCapabilityNames(agent.capabilities).join(", "),
            agent.reputation.toString(),
            new Date(agent.lastUpdated * 1000).toLocaleDateString()
          ]);

          console.log("\n" + table([
            ["Address", "Capabilities", "Reputation", "Last Updated"],
            ...data
          ], {
            header: {
              alignment: "center",
              content: chalk.blue.bold("Registered Agents")
            }
          }));

        } catch (error: any) {
          console.error(chalk.red("Failed to list agents:"), error.message);
          process.exit(1);
        }
      });
  }
}