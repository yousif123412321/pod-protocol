import { PublicKey } from "@solana/web3.js";
import { AGENT_CAPABILITIES, getCapabilityNames } from "@pod-protocol/sdk";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import {
  createSpinner,
  handleDryRun,
  showSuccess,
} from "../../utils/shared.js";
import { getWallet } from "../../utils/client.js";
import { AgentDisplayer } from "./displayer.js";
import { AgentValidators } from "./validators.js";
import {
  CommandContext,
  AgentRegisterOptions,
  AgentUpdateOptions,
  AgentListOptions,
} from "./types.js";

export class AgentHandlers {
  private readonly context: CommandContext;
  private readonly displayer: AgentDisplayer;

  constructor(context: CommandContext) {
    this.context = context;
    this.displayer = new AgentDisplayer();
  }

  public async handleRegister(options: AgentRegisterOptions): Promise<void> {
    const { capabilities, metadataUri } =
      await this.prepareRegistrationData(options);
    const spinner = createSpinner("Registering agent...");

    if (
      handleDryRun(this.context.globalOpts, spinner, "Agent registration", {
        Capabilities: getCapabilityNames(capabilities).join(", "),
        "Metadata URI": metadataUri,
      })
    ) {
      return;
    }

    const signature = await this.context.client.agents.registerAgent(
      this.context.wallet,
      {
        capabilities,
        metadataUri,
      },
    );

    showSuccess(spinner, "Agent registered successfully!", {
      Transaction: signature,
      Capabilities: getCapabilityNames(capabilities).join(", "),
      "Metadata URI": metadataUri,
    });
  }

  public async handleInfo(address?: string): Promise<void> {
    const walletAddress = this.resolveWalletAddress(address);
    AgentValidators.validateAgentAddress(walletAddress.toBase58());
    const spinner = ora("Fetching agent information...").start();

    const agentData = await this.context.client.agents.getAgent(walletAddress);
    if (!agentData) {
      spinner.fail("Agent not found");
      return;
    }

    spinner.succeed("Agent information retrieved");
    this.displayer.displayAgentInfo(agentData);
  }

  public async handleUpdate(options: AgentUpdateOptions): Promise<void> {
    const spinner = ora("Updating agent...").start();
    const updateOptions = this.prepareUpdateOptions(options);

    if (Object.keys(updateOptions).length === 0) {
      spinner.fail("No updates specified");
      return;
    }

    if (this.context.globalOpts.dryRun) {
      spinner.succeed("Dry run: Agent update prepared");
      console.log(
        chalk.cyan("Updates:"),
        JSON.stringify(updateOptions, null, 2),
      );
      return;
    }

    const signature = await this.context.client.agents.updateAgent(
      this.context.wallet,
      updateOptions,
    );

    spinner.succeed("Agent updated successfully!");
    console.log(chalk.green("Transaction:"), signature);
  }

  public async handleList(options: AgentListOptions): Promise<void> {
    const limit = options.limit
      ? AgentValidators.validateLimit(options.limit)
      : 10;
    const spinner = ora("Fetching agents...").start();

    const agents = await this.context.client.agents.getAllAgents(limit);

    if (agents.length === 0) {
      spinner.succeed("No agents found");
      return;
    }

    spinner.succeed(`Found ${agents.length} agents`);
    this.displayer.displayAgentsList(agents);
  }

  private async prepareRegistrationData(options: AgentRegisterOptions) {
    let capabilities = options.capabilities
      ? parseInt(options.capabilities, 10)
      : 0;
    let metadataUri = options.metadata || "";

    if (options.interactive) {
      const answers = await this.promptForRegistrationData();
      capabilities = answers.capabilities.reduce(
        (acc: number, cap: number) => acc | cap,
        0,
      );
      metadataUri = answers.metadataUri;
    }

    if (!metadataUri) {
      metadataUri = `https://pod-com.org/agents/${Date.now()}`;
    }

    if (metadataUri) {
      AgentValidators.validateMetadataUri(metadataUri);
    }

    return { capabilities, metadataUri };
  }

  private async promptForRegistrationData() {
    return await inquirer.prompt([
      {
        type: "checkbox",
        name: "capabilities",
        message: "Select agent capabilities:",
        choices: [
          { name: "Trading", value: AGENT_CAPABILITIES.TRADING },
          { name: "Analysis", value: AGENT_CAPABILITIES.ANALYSIS },
          {
            name: "Data Processing",
            value: AGENT_CAPABILITIES.DATA_PROCESSING,
          },
          {
            name: "Content Generation",
            value: AGENT_CAPABILITIES.CONTENT_GENERATION,
          },
        ],
      },
      {
        type: "input",
        name: "metadataUri",
        message: "Metadata URI (optional):",
        default: "",
      },
    ]);
  }

  private resolveWalletAddress(address: string | undefined): PublicKey {
    if (address) {
      return new PublicKey(address);
    } else {
      const wallet = getWallet(this.context.globalOpts.keypair);
      return wallet.publicKey;
    }
  }

  private prepareUpdateOptions(options: AgentUpdateOptions) {
    const updateOptions: any = {};

    if (options.capabilities) {
      updateOptions.capabilities = AgentValidators.validateCapabilities(
        options.capabilities,
      );
    }

    if (options.metadata) {
      AgentValidators.validateMetadataUri(options.metadata);
      updateOptions.metadataUri = options.metadata;
    }

    return updateOptions;
  }
}
