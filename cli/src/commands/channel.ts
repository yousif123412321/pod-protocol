import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { table } from "table";
import { PublicKey } from "@solana/web3.js";
import { PodComClient, ChannelVisibility } from "@pod-com/sdk";
import { createClient, getWallet } from "../utils/client";

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
        "public",
      )
      .option("-m, --max-participants <number>", "Maximum participants", "100")
      .option("-f, --fee <lamports>", "Fee per message in lamports", "1000")
      .option("-i, --interactive", "Interactive channel creation")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
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
                validate: (input) =>
                  input >= 0 ? true : "Must be 0 or greater",
              },
            ]);

            name = answers.name;
            description = answers.description;
            visibility = answers.visibility;
            maxParticipants = answers.maxParticipants;
            feePerMessage = answers.feePerMessage;
          }

          if (!name) {
            console.error(chalk.red("Error: Channel name is required"));
            process.exit(1);
          }

          const spinner = ora("Creating channel...").start();

          const client = await createClient(globalOpts.network);
          const wallet = getWallet(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Channel creation prepared");
            console.log(chalk.cyan("Name:"), name);
            console.log(chalk.cyan("Description:"), description);
            console.log(chalk.cyan("Visibility:"), visibility);
            console.log(chalk.cyan("Max Participants:"), maxParticipants);
            console.log(
              chalk.cyan("Fee per Message:"),
              feePerMessage,
              "lamports",
            );
            return;
          }

          const signature = await client.createChannel(wallet, {
            name,
            description: description || "",
            visibility,
            maxParticipants,
            feePerMessage,
          });

          spinner.succeed("Channel created successfully!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Name:"), name);
          console.log(chalk.cyan("Visibility:"), visibility);
        } catch (error: any) {
          console.error(chalk.red("Failed to create channel:"), error.message);
          process.exit(1);
        }
      });

    // Show channel info
    channel
      .command("info <channelId>")
      .description("Show channel information")
      .action(async (channelId, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Fetching channel information...").start();

          const client = await createClient(globalOpts.network);

          const channelData = await client.getChannel(new PublicKey(channelId));

          if (!channelData) {
            spinner.fail("Channel not found");
            return;
          }

          spinner.succeed("Channel information retrieved");

          const data = [
            ["Channel ID", channelData.pubkey.toBase58()],
            ["Name", channelData.name],
            ["Description", channelData.description || "No description"],
            ["Creator", channelData.creator.toBase58()],
            ["Visibility", channelData.visibility],
            [
              "Participants",
              `${channelData.participantCount}/${channelData.maxParticipants}`,
            ],
            ["Fee per Message", `${channelData.feePerMessage} lamports`],
            [
              "Created",
              new Date(channelData.createdAt * 1000).toLocaleString(),
            ],
            ["Active", channelData.isActive ? "Yes" : "No"],
          ];

          console.log(
            "\n" +
              table(data, {
                header: {
                  alignment: "center",
                  content: chalk.blue.bold("Channel Information"),
                },
              }),
          );
        } catch (error: any) {
          console.error(
            chalk.red("Failed to fetch channel info:"),
            error.message,
          );
          process.exit(1);
        }
      });

    // List channels
    channel
      .command("list")
      .description("List available channels")
      .option(
        "-l, --limit <number>",
        "Maximum number of channels to show",
        "10",
      )
      .option(
        "-v, --visibility <visibility>",
        "Filter by visibility (public, private)",
      )
      .option("-o, --owner", "Show only channels owned by current wallet")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Fetching channels...").start();

          const client = await createClient(globalOpts.network);

          let channels;
          if (options.owner) {
            const wallet = getWallet(globalOpts.keypair);
            channels = await client.getChannelsByCreator(
              wallet.publicKey,
              parseInt(options.limit, 10),
            );
          } else {
            channels = await client.getAllChannels(
              parseInt(options.limit, 10),
              options.visibility as ChannelVisibility,
            );
          }

          if (channels.length === 0) {
            spinner.succeed("No channels found");
            return;
          }

          spinner.succeed(`Found ${channels.length} channels`);

          const data = channels.map((ch: any) => [
            ch.pubkey.toBase58().slice(0, 8) + "...",
            ch.name.slice(0, 20) + (ch.name.length > 20 ? "..." : ""),
            ch.visibility,
            `${ch.participantCount}/${ch.maxParticipants}`,
            `${ch.feePerMessage}`,
            ch.isActive ? "✅" : "❌",
            new Date(ch.createdAt * 1000).toLocaleDateString(),
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
                {
                  header: {
                    alignment: "center",
                    content: chalk.blue.bold("Channels"),
                  },
                },
              ),
          );
        } catch (error: any) {
          console.error(chalk.red("Failed to list channels:"), error.message);
          process.exit(1);
        }
      });

    // Join channel
    channel
      .command("join <channelId>")
      .description("Join a communication channel")
      .action(async (channelId, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Joining channel...").start();

          const client = await createClient(globalOpts.network);
          const wallet = getWallet(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Channel join prepared");
            console.log(chalk.cyan("Channel:"), channelId);
            return;
          }

          const signature = await client.joinChannel(
            wallet,
            new PublicKey(channelId),
          );

          spinner.succeed("Successfully joined channel!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Channel:"), channelId);
        } catch (error: any) {
          console.error(chalk.red("Failed to join channel:"), error.message);
          process.exit(1);
        }
      });

    // Leave channel
    channel
      .command("leave <channelId>")
      .description("Leave a communication channel")
      .action(async (channelId, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Leaving channel...").start();

          const client = await createClient(globalOpts.network);
          const wallet = getWallet(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Channel leave prepared");
            console.log(chalk.cyan("Channel:"), channelId);
            return;
          }

          const signature = await client.leaveChannel(
            wallet,
            new PublicKey(channelId),
          );

          spinner.succeed("Successfully left channel!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Channel:"), channelId);
        } catch (error: any) {
          console.error(chalk.red("Failed to leave channel:"), error.message);
          process.exit(1);
        }
      });

    // Broadcast message to channel
    channel
      .command("broadcast <channelId> <message>")
      .description("Broadcast a message to a channel")
      .option(
        "-t, --type <type>",
        "Message type (text, data, command, response)",
        "text",
      )
      .option("-r, --reply-to <messageId>", "Reply to message ID")
      .action(async (channelId, message, options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Broadcasting message...").start();

          const client = await createClient(globalOpts.network);
          const wallet = getWallet(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Message broadcast prepared");
            console.log(chalk.cyan("Channel:"), channelId);
            console.log(chalk.cyan("Message:"), message);
            console.log(chalk.cyan("Type:"), options.type);
            return;
          }

          const signature = await client.broadcastMessage(
            wallet,
            new PublicKey(channelId),
            message,
            options.type as any,
            options.replyTo ? new PublicKey(options.replyTo) : undefined,
          );

          spinner.succeed("Message broadcast successfully!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Channel:"), channelId);
        } catch (error: any) {
          console.error(
            chalk.red("Failed to broadcast message:"),
            error.message,
          );
          process.exit(1);
        }
      });

    // Invite user to channel
    channel
      .command("invite <channelId> <invitee>")
      .description("Invite a user to a private channel")
      .action(async (channelId, invitee, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Sending invitation...").start();

          const client = await createClient(globalOpts.network);
          const wallet = getWallet(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Invitation prepared");
            console.log(chalk.cyan("Channel:"), channelId);
            console.log(chalk.cyan("Invitee:"), invitee);
            return;
          }

          const signature = await client.inviteToChannel(
            wallet,
            new PublicKey(channelId),
            new PublicKey(invitee),
          );

          spinner.succeed("Invitation sent successfully!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Channel:"), channelId);
          console.log(chalk.cyan("Invitee:"), invitee);
        } catch (error: any) {
          console.error(chalk.red("Failed to send invitation:"), error.message);
          process.exit(1);
        }
      });

    // Show channel participants
    channel
      .command("participants <channelId>")
      .description("Show channel participants")
      .option(
        "-l, --limit <number>",
        "Maximum number of participants to show",
        "20",
      )
      .action(async (channelId, options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Fetching participants...").start();

          const client = await createClient(globalOpts.network);

          const participants = await client.getChannelParticipants(
            new PublicKey(channelId),
            parseInt(options.limit, 10),
          );

          if (participants.length === 0) {
            spinner.succeed("No participants found");
            return;
          }

          spinner.succeed(`Found ${participants.length} participants`);

          const data = participants.map((p: any) => [
            p.participant.toBase58().slice(0, 8) + "...",
            p.isActive ? "✅" : "❌",
            p.messagesSent.toString(),
            new Date(p.joinedAt * 1000).toLocaleDateString(),
          ]);

          console.log(
            "\n" +
              table(
                [["Participant", "Active", "Messages", "Joined"], ...data],
                {
                  header: {
                    alignment: "center",
                    content: chalk.blue.bold("Channel Participants"),
                  },
                },
              ),
          );
        } catch (error: any) {
          console.error(
            chalk.red("Failed to fetch participants:"),
            error.message,
          );
          process.exit(1);
        }
      });

    // Show channel messages
    channel
      .command("messages <channelId>")
      .description("Show channel messages")
      .option(
        "-l, --limit <number>",
        "Maximum number of messages to show",
        "20",
      )
      .action(async (channelId, options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Fetching messages...").start();

          const client = await createClient(globalOpts.network);

          const messages = await client.getChannelMessages(
            new PublicKey(channelId),
            parseInt(options.limit, 10),
          );

          if (messages.length === 0) {
            spinner.succeed("No messages found");
            return;
          }

          spinner.succeed(`Found ${messages.length} messages`);

          const data = messages.map((m: any) => [
            m.sender.toBase58().slice(0, 8) + "...",
            m.content.slice(0, 50) + (m.content.length > 50 ? "..." : ""),
            m.messageType,
            new Date(m.createdAt * 1000).toLocaleString(),
          ]);

          console.log(
            "\n" +
              table([["Sender", "Content", "Type", "Timestamp"], ...data], {
                header: {
                  alignment: "center",
                  content: chalk.blue.bold("Channel Messages"),
                },
              }),
          );
        } catch (error: any) {
          console.error(chalk.red("Failed to fetch messages:"), error.message);
          process.exit(1);
        }
      });
  }
}
