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

    // Create channel
    channel
      .command("create")
      .description("Create a new communication channel")
      .option("-n, --name <name>", "Channel name")
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

    // Show channel info
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

    // List channels
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

    // Join channel
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

    // Leave channel
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

    // Broadcast message to channel
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

    // Invite user to channel
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

    // Show channel participants
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

    // Show channel messages
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
    let name = options.name;
    let description = options.description;
    let visibility = options.visibility as ChannelVisibility;
    let maxParticipants = parseInt(options.maxParticipants, 10);
    let feePerMessage = parseInt(options.fee, 10);

    if (options.interactive) {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Channel name:",
          validate: (input: string) =>
            input.length > 0 ? true : "Channel name is required",
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
            {
              name: "Public - Anyone can join",
              value: ChannelVisibility.Public,
            },
            {
              name: "Private - Invitation only",
              value: ChannelVisibility.Private,
            },
          ],
        },
        {
          type: "number",
          name: "maxParticipants",
          message: "Maximum participants:",
          default: 100,
          validate: (input: number) =>
            input > 0 ? true : "Must be greater than 0",
        },
        {
          type: "number",
          name: "feePerMessage",
          message: "Fee per message (lamports):",
          default: 1000,
          validate: (input) => (input >= 0 ? true : "Must be 0 or greater"),
        },
      ]);

      name = answers.name;
      description = answers.description;
      visibility = answers.visibility;
      maxParticipants = answers.maxParticipants;
      feePerMessage = answers.feePerMessage;
    }

    if (!name) {
      throw new ValidationError("Channel name is required");
    }

    const validatedName = validateChannelName(name);
    const validatedMaxParticipants = validatePositiveInteger(
      maxParticipants,
      "max participants"
    );
    const validatedFeePerMessage = validatePositiveInteger(
      feePerMessage,
      "fee per message"
    );

    const spinner = createSpinner("Creating channel...");

    if (
      handleDryRun(globalOpts, spinner, "Channel creation", {
        Name: validatedName,
        Description: description || "No description",
        Visibility: visibility,
        "Max Participants": validatedMaxParticipants,
        "Fee per Message": `${validatedFeePerMessage} lamports`,
      })
    ) {
      return;
    }

    const signature = await client.createChannel(wallet, {
      name: validatedName,
      description: description || "",
      visibility,
      maxParticipants: validatedMaxParticipants,
      feePerMessage: validatedFeePerMessage,
    });

    showSuccess(spinner, "Channel created successfully!", {
      Transaction: signature,
      Name: validatedName,
      Visibility: visibility,
    });
  }

  private async handleInfo(client: PodComClient, channelId: string) {
    const channelKey = validatePublicKey(channelId, "channel ID");
    const spinner = createSpinner("Fetching channel information...");

    const channelData = await client.getChannel(channelKey);

    if (!channelData) {
      spinner.fail("Channel not found");
      return;
    }

    spinner.succeed("Channel information retrieved");

    const data = [
      ["Channel ID", formatValue(channelData.pubkey.toBase58(), "address")],
      ["Name", formatValue(channelData.name, "text")],
      [
        "Description",
        formatValue(channelData.description || "No description", "text"),
      ],
      ["Creator", formatValue(channelData.creator.toBase58(), "address")],
      ["Visibility", formatValue(channelData.visibility, "text")],
      [
        "Participants",
        formatValue(
          `${channelData.participantCount}/${channelData.maxParticipants}`,
          "text"
        ),
      ],
      [
        "Fee per Message",
        formatValue(`${channelData.feePerMessage} lamports`, "number"),
      ],
      [
        "Created",
        formatValue(
          new Date(channelData.createdAt * 1000).toLocaleString(),
          "text"
        ),
      ],
      ["Active", formatValue(channelData.isActive, "boolean")],
    ];

    console.log("\n" + table(data, getTableConfig("Channel Information")));
  }

  private async handleList(client: PodComClient, wallet: any, options: any) {
    const limit = validatePositiveInteger(options.limit, "limit");
    const spinner = createSpinner("Fetching channels...");

    let channels;
    if (options.owner) {
      channels = await client.getChannelsByCreator(wallet.publicKey, limit);
    } else {
      channels = await client.getAllChannels(
        limit,
        options.visibility as ChannelVisibility
      );
    }

    if (channels.length === 0) {
      spinner.succeed("No channels found");
      return;
    }

    spinner.succeed(`Found ${channels.length} channels`);

    const data = channels.map((ch: any) => [
      formatValue(ch.pubkey.toBase58().slice(0, 8) + "...", "address"),
      formatValue(
        ch.name.slice(0, 20) + (ch.name.length > 20 ? "..." : ""),
        "text"
      ),
      formatValue(ch.visibility, "text"),
      formatValue(`${ch.participantCount}/${ch.maxParticipants}`, "text"),
      formatValue(`${ch.feePerMessage}`, "number"),
      formatValue(ch.isActive, "boolean"),
      formatValue(new Date(ch.createdAt * 1000).toLocaleDateString(), "text"),
    ]);

    console.log(
      "\n" +
        table(
          [
            [
              "ID",
              "Name",
              "Visibility",
              "Participants",
              "Fee",
              "Active",
              "Created",
            ],
            ...data,
          ],
          getTableConfig("Channels")
        )
    );
  }

  private async handleJoin(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    channelId: string
  ) {
    const channelKey = validatePublicKey(channelId, "channel ID");
    const spinner = createSpinner("Joining channel...");

    if (
      handleDryRun(globalOpts, spinner, "Channel join", {
        Channel: channelId,
      })
    ) {
      return;
    }

    const signature = await client.joinChannel(wallet, channelKey);

    showSuccess(spinner, "Successfully joined channel!", {
      Transaction: signature,
      Channel: channelId,
    });
  }

  private async handleLeave(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    channelId: string
  ) {
    const channelKey = validatePublicKey(channelId, "channel ID");
    const spinner = createSpinner("Leaving channel...");

    if (
      handleDryRun(globalOpts, spinner, "Channel leave", {
        Channel: channelId,
      })
    ) {
      return;
    }

    const signature = await client.leaveChannel(wallet, channelKey);

    showSuccess(spinner, "Successfully left channel!", {
      Transaction: signature,
      Channel: channelId,
    });
  }

  private async handleBroadcast(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    channelId: string,
    message: string,
    options: any
  ) {
    const channelKey = validatePublicKey(channelId, "channel ID");
    const validatedMessage = validateMessage(message);
    const spinner = createSpinner("Broadcasting message...");

    if (
      handleDryRun(globalOpts, spinner, "Message broadcast", {
        Channel: channelId,
        Message:
          validatedMessage.slice(0, 50) +
          (validatedMessage.length > 50 ? "..." : ""),
        Type: options.type,
      })
    ) {
      return;
    }

    const signature = await client.broadcastMessage(
      wallet,
      channelKey,
      validatedMessage,
      options.type as any,
      options.replyTo
        ? validatePublicKey(options.replyTo, "reply-to message ID")
        : undefined
    );

    showSuccess(spinner, "Message broadcast successfully!", {
      Transaction: signature,
      Channel: channelId,
    });
  }

  private async handleInvite(
    client: PodComClient,
    wallet: any,
    globalOpts: GlobalOptions,
    channelId: string,
    invitee: string
  ) {
    const channelKey = validatePublicKey(channelId, "channel ID");
    const inviteeKey = validatePublicKey(invitee, "invitee address");
    const spinner = createSpinner("Sending invitation...");

    if (
      handleDryRun(globalOpts, spinner, "Invitation", {
        Channel: channelId,
        Invitee: invitee,
      })
    ) {
      return;
    }

    const signature = await client.inviteToChannel(
      wallet,
      channelKey,
      inviteeKey
    );

    showSuccess(spinner, "Invitation sent successfully!", {
      Transaction: signature,
      Channel: channelId,
      Invitee: invitee,
    });
  }

  private async handleParticipants(
    client: PodComClient,
    channelId: string,
    options: any
  ) {
    const channelKey = validatePublicKey(channelId, "channel ID");
    const limit = validatePositiveInteger(options.limit, "limit");
    const spinner = createSpinner("Fetching participants...");

    const participants = await client.getChannelParticipants(channelKey, limit);

    if (participants.length === 0) {
      spinner.succeed("No participants found");
      return;
    }

    spinner.succeed(`Found ${participants.length} participants`);

    const data = participants.map((p: any) => [
      formatValue(p.participant.toBase58().slice(0, 8) + "...", "address"),
      formatValue(p.isActive, "boolean"),
      formatValue(p.messagesSent.toString(), "number"),
      formatValue(new Date(p.joinedAt * 1000).toLocaleDateString(), "text"),
    ]);

    console.log(
      "\n" +
        table(
          [["Participant", "Active", "Messages", "Joined"], ...data],
          getTableConfig("Channel Participants")
        )
    );
  }

  private async handleMessages(
    client: PodComClient,
    channelId: string,
    options: any
  ) {
    const channelKey = validatePublicKey(channelId, "channel ID");
    const limit = validatePositiveInteger(options.limit, "limit");
    const spinner = createSpinner("Fetching messages...");

    const messages = await client.getChannelMessages(channelKey, limit);

    if (messages.length === 0) {
      spinner.succeed("No messages found");
      return;
    }

    spinner.succeed(`Found ${messages.length} messages`);

    const data = messages.map((m: any) => [
      formatValue(m.sender.toBase58().slice(0, 8) + "...", "address"),
      formatValue(
        m.content.slice(0, 50) + (m.content.length > 50 ? "..." : ""),
        "text"
      ),
      formatValue(m.messageType, "text"),
      formatValue(new Date(m.createdAt * 1000).toLocaleString(), "text"),
    ]);

    console.log(
      "\n" +
        table(
          [["Sender", "Content", "Type", "Timestamp"], ...data],
          getTableConfig("Channel Messages")
        )
    );
  }
}
