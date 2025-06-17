import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { table } from "table";
import { PublicKey } from "@solana/web3.js";
import { PodComClient, ChannelVisibility } from "@pod-protocol/sdk";
import {
  createCommandHandler,
  handleDryRun,
  createSpinner,
  showSuccess,
  getTableConfig,
  formatValue,
  GlobalOptions,
} from "../utils/shared";
import {
  validatePublicKey,
  validateChannelName,
  validatePositiveInteger,
  validateEnum,
  validateMessage,
  ValidationError,
} from "../utils/validation";

export class ChannelCommands {
  register(program: Command) {
    const channel = program
      .command("channel")
      .description("Manage communication channels");

    this.setupCreateCommand(channel);
    this.setupInfoCommand(channel);
    this.setupListCommand(channel);
    this.setupJoinCommand(channel);
    this.setupLeaveCommand(channel);
    this.setupBroadcastCommand(channel);
    this.setupInviteCommand(channel);
    this.setupParticipantsCommand(channel);
    this.setupMessagesCommand(channel);
  }

  private setupCreateCommand(channel: Command) {
    channel
      .command("create")
      .description("Create a new communication channel")
      .option("-n, --name <n>", "Channel name")
      .option("-d, --description <description>", "Channel description")
      .option(
        "-v, --visibility <visibility>",
        "Channel visibility (public, private)",
        "public"
      )
      .option("-m, --max-participants <number>", "Maximum participants", "100")
      .option("-f, --fee <lamports>", "Fee per message in lamports", "1000")
      .option("-i, --interactive", "Interactive channel creation")
      .action(
        createCommandHandler(
          "create channel",
          async (client, wallet, globalOpts, options) => {
            await this.handleCreate(client, wallet, globalOpts, options);
          }
        )
      );
  }

  private setupInfoCommand(channel: Command) {
    channel
      .command("info <channelId>")
      .description("Show channel information")
      .action(
        createCommandHandler(
          "fetch channel info",
          async (client, wallet, globalOpts, channelId) => {
            await this.handleInfo(client, channelId);
          }
        )
      );
  }

  private setupListCommand(channel: Command) {
    channel
      .command("list")
      .description("List available channels")
      .option(
        "-l, --limit <number>",
        "Maximum number of channels to show",
        "10"
      )
      .option(
        "-v, --visibility <visibility>",
        "Filter by visibility (public, private)"
      )
      .option("-o, --owner", "Show only channels owned by current wallet")
      .action(
        createCommandHandler(
          "list channels",
          async (client, wallet, globalOpts, options) => {
            await this.handleList(client, wallet, options);
          }
        )
      );
  }

  private setupJoinCommand(channel: Command) {
    channel
      .command("join <channelId>")
      .description("Join a communication channel")
      .action(
        createCommandHandler(
          "join channel",
          async (client, wallet, globalOpts, channelId) => {
            await this.handleJoin(client, wallet, globalOpts, channelId);
          }
        )
      );
  }

  private setupLeaveCommand(channel: Command) {
    channel
      .command("leave <channelId>")
      .description("Leave a communication channel")
      .action(
        createCommandHandler(
          "leave channel",
          async (client, wallet, globalOpts, channelId) => {
            await this.handleLeave(client, wallet, globalOpts, channelId);
          }
        )
      );
  }

  private setupBroadcastCommand(channel: Command) {
    channel
      .command("broadcast <channelId> <message>")
      .description("Broadcast a message to a channel")
      .option(
        "-t, --type <type>",
        "Message type (text, data, command, response)",
        "text"
      )
      .option("-r, --reply-to <messageId>", "Reply to message ID")
      .action(
        createCommandHandler(
          "broadcast message",
          async (client, wallet, globalOpts, channelId, message, options) => {
            await this.handleBroadcast(
              client,
              wallet,
              globalOpts,
              channelId,
              message,
              options
            );
          }
        )
      );
  }

  private setupInviteCommand(channel: Command) {
    channel
      .command("invite <channelId> <invitee>")
      .description("Invite a user to a private channel")
      .action(
        createCommandHandler(
          "send invitation",
          async (client, wallet, globalOpts, channelId, invitee) => {
            await this.handleInvite(
              client,
              wallet,
              globalOpts,
              channelId,
              invitee
            );
          }
        )
      );
  }

  private setupParticipantsCommand(channel: Command) {
    channel
      .command("participants <channelId>")
      .description("Show channel participants")
      .option(
        "-l, --limit <number>",
        "Maximum number of participants to show",
        "20"
      )
      .action(
        createCommandHandler(
          "fetch participants",
          async (client, wallet, globalOpts, channelId, options) => {
            await this.handleParticipants(client, channelId, options);
          }
        )
      );
  }

  private setupMessagesCommand(channel: Command) {
    channel
      .command("messages <channelId>")
      .description("Show channel messages")
      .option(
        "-l, --limit <number>",
        "Maximum number of messages to show",
        "20"
      )
      .action(
        createCommandHandler(
          "fetch messages",
          async (client, wallet, globalOpts, channelId, options) => {
            await this.handleMessages(client, channelId, options);
          }
        )
      );
  }

  private async handleCreate(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    options: any
  ) {
    try {
      const channelData = await this.prepareChannelData(options);
      const spinner = createSpinner("Creating channel...");

      if (
        handleDryRun(globalOpts, spinner, "Channel creation", {
          Name: channelData.name,
          Description: channelData.description,
          Visibility: channelData.visibility,
          "Max Participants": channelData.maxParticipants.toString(),
          "Fee per Message": `${channelData.feePerMessage} lamports`,
        })
      ) {
        return;
      }

      const signature = await client.createChannel(wallet, channelData);

      showSuccess(spinner, "Channel created successfully!", {
        Transaction: signature,
        Name: channelData.name,
        Description: channelData.description,
        Visibility: channelData.visibility,
      });
    } catch (error: any) {
      console.error(chalk.red("Failed to create channel:"), error.message);
      process.exit(1);
    }
  }

  private async prepareChannelData(options: any) {
    let name = options.name || "";
    let description = options.description || "";
    let visibility = options.visibility || "public";
    let maxParticipants = parseInt(options.maxParticipants, 10) || 100;
    let feePerMessage = parseInt(options.fee, 10) || 1000;

    if (options.interactive) {
      const answers = await this.promptForChannelData();
      name = answers.name;
      description = answers.description;
      visibility = answers.visibility;
      maxParticipants = answers.maxParticipants;
      feePerMessage = answers.feePerMessage;
    }

    this.validateChannelData({
      name,
      description,
      visibility,
      maxParticipants,
      feePerMessage,
    });

    return {
      name,
      description,
      visibility: visibility as ChannelVisibility,
      maxParticipants,
      feePerMessage,
    };
  }

  private async promptForChannelData() {
    return await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Channel name:",
        validate: (input: string) => input.length > 0 ? true : "Channel name is required",
      },
      {
        type: "input",
        name: "description",
        message: "Channel description:",
        default: "",
      },
      {
        type: "list",
        name: "visibility",
        message: "Channel visibility:",
        choices: [
          { name: "Public", value: "public" },
          { name: "Private", value: "private" },
        ],
        default: "public",
      },
      {
        type: "number",
        name: "maxParticipants",
        message: "Maximum participants:",
        default: 100,
        validate: (input: number) => input > 0 ? true : "Must be greater than 0",
      },
      {
        type: "number",
        name: "feePerMessage",
        message: "Fee per message (lamports):",
        default: 1000,
        validate: (input: number) => input >= 0 ? true : "Must be 0 or greater",
      },
    ]);
  }

  private validateChannelData(data: {
    name: string;
    description: string;
    visibility: string;
    maxParticipants: number;
    feePerMessage: number;
  }) {
    validateChannelName(data.name);
    validateEnum(data.visibility, ["public", "private"], "visibility");
    validatePositiveInteger(data.maxParticipants);
    validatePositiveInteger(data.feePerMessage);
  }

  private async handleInfo(client: PodComClient, channelId: string) {
    try {
      const spinner = createSpinner("Fetching channel information...");
      const channelPubkey = new PublicKey(channelId);
      const channelData = await client.getChannel(channelPubkey);

      if (!channelData) {
        spinner.fail("Channel not found");
        return;
      }

      spinner.succeed("Channel information retrieved");
      this.displayChannelInfo(channelData);
    } catch (error: any) {
      console.error(chalk.red("Failed to fetch channel info:"), error.message);
      process.exit(1);
    }
  }

  private displayChannelInfo(channelData: any) {
    const data = [
      ["Public Key", channelData.pubkey.toBase58()],
      ["Name", channelData.name],
      ["Description", channelData.description],
      ["Visibility", channelData.visibility],
      ["Creator", channelData.creator.toBase58()],
      ["Participants", `${channelData.currentParticipants}/${channelData.maxParticipants}`],
      ["Fee per Message", `${channelData.feePerMessage} lamports`],
      ["Escrow Balance", `${channelData.escrowBalance} lamports`],
      ["Created At", new Date(channelData.createdAt * 1000).toLocaleString()],
      ["Active", channelData.isActive ? "Yes" : "No"],
    ];

    console.log(
      "\n" +
        table(data, {
          header: {
            alignment: "center",
            content: chalk.blue.bold("Channel Information"),
          },
        })
    );
  }

  private async handleList(client: PodComClient, wallet: any, options: any) {
    try {
      const spinner = createSpinner("Fetching channels...");
      const limit = parseInt(options.limit, 10) || 10;
      
      let channels;
      if (options.owner) {
        channels = await client.getChannelsByCreator(wallet.publicKey, limit);
      } else {
        const visibilityFilter = options.visibility
          ? (options.visibility as ChannelVisibility)
          : undefined;
        channels = await client.getAllChannels(limit, visibilityFilter);
      }

      if (channels.length === 0) {
        spinner.succeed("No channels found");
        return;
      }

      spinner.succeed(`Found ${channels.length} channels`);
      this.displayChannelsList(channels);
    } catch (error: any) {
      console.error(chalk.red("Failed to list channels:"), error.message);
      process.exit(1);
    }
  }

  private displayChannelsList(channels: any[]) {
    const data = channels.map((channel) => [
      channel.pubkey.toBase58().slice(0, 8) + "...",
      channel.name,
      channel.visibility,
      `${channel.currentParticipants}/${channel.maxParticipants}`,
      `${channel.feePerMessage}`,
      channel.isActive ? "Yes" : "No",
    ]);

    console.log(
      "\n" +
        table(
          [
            ["Address", "Name", "Visibility", "Participants", "Fee", "Active"],
            ...data,
          ],
          {
            header: {
              alignment: "center",
              content: chalk.blue.bold("Available Channels"),
            },
          }
        )
    );
  }

  private async handleJoin(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    channelId: string
  ) {
    try {
      const spinner = createSpinner("Joining channel...");
      const channelPubkey = new PublicKey(channelId);

      if (globalOpts.dryRun) {
        spinner.succeed("Dry run: Join channel prepared");
        console.log(chalk.cyan("Channel:"), channelId);
        return;
      }

      const signature = await client.joinChannel(wallet, channelPubkey);

      spinner.succeed("Successfully joined channel!");
      console.log(chalk.green("Transaction:"), signature);
    } catch (error: any) {
      console.error(chalk.red("Failed to join channel:"), error.message);
      process.exit(1);
    }
  }

  private async handleLeave(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    channelId: string
  ) {
    try {
      const spinner = createSpinner("Leaving channel...");
      const channelPubkey = new PublicKey(channelId);

      if (globalOpts.dryRun) {
        spinner.succeed("Dry run: Leave channel prepared");
        console.log(chalk.cyan("Channel:"), channelId);
        return;
      }

      const signature = await client.leaveChannel(wallet, channelPubkey);

      spinner.succeed("Successfully left channel!");
      console.log(chalk.green("Transaction:"), signature);
    } catch (error: any) {
      console.error(chalk.red("Failed to leave channel:"), error.message);
      process.exit(1);
    }
  }

  private async handleBroadcast(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    channelId: string,
    message: string,
    options: any
  ) {
    try {
      validateMessage(message);
      const spinner = createSpinner("Broadcasting message...");
      const channelPubkey = new PublicKey(channelId);
      const messageType = this.parseMessageType(options.type);
      const replyTo = options.replyTo ? new PublicKey(options.replyTo) : undefined;

      if (globalOpts.dryRun) {
        spinner.succeed("Dry run: Broadcast message prepared");
        console.log(chalk.cyan("Channel:"), channelId);
        console.log(chalk.cyan("Message:"), message);
        console.log(chalk.cyan("Type:"), messageType);
        if (replyTo) {
          console.log(chalk.cyan("Reply to:"), replyTo.toBase58());
        }
        return;
      }

      const signature = await client.broadcastMessage(
        wallet,
        channelPubkey,
        message,
        messageType,
        replyTo
      );

      spinner.succeed("Message broadcast successfully!");
      console.log(chalk.green("Transaction:"), signature);
    } catch (error: any) {
      console.error(chalk.red("Failed to broadcast message:"), error.message);
      process.exit(1);
    }
  }

  private parseMessageType(type: string) {
    const typeMap: { [key: string]: any } = {
      text: "Text",
      data: "Data", 
      command: "Command",
      response: "Response",
    };
    return typeMap[type.toLowerCase()] || "Text";
  }

  private async handleInvite(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    channelId: string,
    invitee: string
  ) {
    try {
      validatePublicKey(invitee);
      const spinner = createSpinner("Sending invitation...");
      const channelPubkey = new PublicKey(channelId);
      const inviteePubkey = new PublicKey(invitee);

      if (globalOpts.dryRun) {
        spinner.succeed("Dry run: Invitation prepared");
        console.log(chalk.cyan("Channel:"), channelId);
        console.log(chalk.cyan("Invitee:"), invitee);
        return;
      }

      const signature = await client.inviteToChannel(
        wallet,
        channelPubkey,
        inviteePubkey
      );

      spinner.succeed("Invitation sent successfully!");
      console.log(chalk.green("Transaction:"), signature);
    } catch (error: any) {
      console.error(chalk.red("Failed to send invitation:"), error.message);
      process.exit(1);
    }
  }

  private async handleParticipants(
    client: PodComClient,
    channelId: string,
    options: any
  ) {
    try {
      const spinner = createSpinner("Fetching participants...");
      const channelPubkey = new PublicKey(channelId);
      const limit = parseInt(options.limit, 10) || 20;

      const participants = await client.getChannelParticipants(
        channelPubkey,
        limit
      );

      if (participants.length === 0) {
        spinner.succeed("No participants found");
        return;
      }

      spinner.succeed(`Found ${participants.length} participants`);
      this.displayParticipantsList(participants);
    } catch (error: any) {
      console.error(chalk.red("Failed to fetch participants:"), error.message);
      process.exit(1);
    }
  }

  private displayParticipantsList(participants: any[]) {
    const data = participants.map((participant) => [
      participant.participant.toBase58().slice(0, 8) + "...",
      new Date(participant.joinedAt * 1000).toLocaleDateString(),
      participant.messagesSent.toString(),
      participant.isActive ? "Yes" : "No",
    ]);

    console.log(
      "\n" +
        table(
          [
            ["Participant", "Joined", "Messages", "Active"],
            ...data,
          ],
          {
            header: {
              alignment: "center",
              content: chalk.blue.bold("Channel Participants"),
            },
          }
        )
    );
  }

  private async handleMessages(
    client: PodComClient,
    channelId: string,
    options: any
  ) {
    try {
      const spinner = createSpinner("Fetching messages...");
      const channelPubkey = new PublicKey(channelId);
      const limit = parseInt(options.limit, 10) || 20;

      const messages = await client.getChannelMessages(channelPubkey, limit);

      if (messages.length === 0) {
        spinner.succeed("No messages found");
        return;
      }

      spinner.succeed(`Found ${messages.length} messages`);
      this.displayMessagesList(messages);
    } catch (error: any) {
      console.error(chalk.red("Failed to fetch messages:"), error.message);
      process.exit(1);
    }
  }

  private displayMessagesList(messages: any[]) {
    const data = messages.map((message) => [
      message.sender.toBase58().slice(0, 8) + "...",
      message.content.length > 50
        ? message.content.substring(0, 47) + "..."
        : message.content,
      message.messageType,
      new Date(message.createdAt * 1000).toLocaleString(),
    ]);

    console.log(
      "\n" +
        table(
          [
            ["Sender", "Content", "Type", "Created"],
            ...data,
          ],
          {
            header: {
              alignment: "center",
              content: chalk.blue.bold("Channel Messages"),
            },
          }
        )
    );
  }
}
