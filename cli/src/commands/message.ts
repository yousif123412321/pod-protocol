import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { table } from "table";
import { PublicKey } from "@solana/web3.js";
import {
  PodComClient,
  MessageType,
  MessageStatus,
  getMessageTypeId,
} from "@pod-com/sdk";
import { createClient, getWallet } from "../utils/client";

export class MessageCommands {
  register(program: Command) {
    const message = program
      .command("message")
      .description("Manage messages between AI agents");

    // Send message
    message
      .command("send")
      .description("Send a message to another agent")
      .option("-r, --recipient <address>", "Recipient agent address")
      .option("-p, --payload <text>", "Message payload/content")
      .option(
        "-t, --type <type>",
        "Message type (text, data, command, response, custom)",
        "text",
      )
      .option(
        "-c, --custom-value <number>",
        "Custom value for custom message types",
      )
      .option("-i, --interactive", "Interactive message creation")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          let recipient = options.recipient;
          let payload = options.payload;
          let messageType = options.type as MessageType;
          let customValue = options.customValue
            ? parseInt(options.customValue, 10)
            : 0;

          if (options.interactive) {
            const answers = await inquirer.prompt([
              {
                type: "input",
                name: "recipient",
                message: "Recipient agent address:",
                validate: (input) => {
                  try {
                    new PublicKey(input);
                    return true;
                  } catch {
                    return "Please enter a valid Solana public key";
                  }
                },
              },
              {
                type: "list",
                name: "messageType",
                message: "Message type:",
                choices: [
                  {
                    name: "Text - Plain text message",
                    value: MessageType.Text,
                  },
                  {
                    name: "Data - Structured data transfer",
                    value: MessageType.Data,
                  },
                  {
                    name: "Command - Command/instruction",
                    value: MessageType.Command,
                  },
                  {
                    name: "Response - Response to command",
                    value: MessageType.Response,
                  },
                  {
                    name: "Custom - Custom message type",
                    value: MessageType.Custom,
                  },
                ],
              },
              {
                type: "editor",
                name: "payload",
                message: "Message content:",
                default: "",
              },
              {
                type: "number",
                name: "customValue",
                message: "Custom value (for custom message types):",
                default: 0,
                when: (answers) => answers.messageType === MessageType.Custom,
              },
            ]);

            recipient = answers.recipient;
            payload = answers.payload;
            messageType = answers.messageType;
            customValue = answers.customValue || 0;
          }

          if (!recipient || !payload) {
            console.error(
              chalk.red("Error: Recipient and payload are required"),
            );
            process.exit(1);
          }

          const spinner = ora("Sending message...").start();

          const client = await createClient(globalOpts.network);
          const wallet = getWallet(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Message prepared");
            console.log(chalk.cyan("Recipient:"), recipient);
            console.log(chalk.cyan("Type:"), messageType);
            console.log(
              chalk.cyan("Payload:"),
              payload.slice(0, 100) + (payload.length > 100 ? "..." : ""),
            );
            return;
          }

          const signature = await client.sendMessage(wallet, {
            recipient: new PublicKey(recipient),
            payload,
            messageType,
            customValue,
          });

          spinner.succeed("Message sent successfully!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Recipient:"), recipient);
          console.log(chalk.cyan("Type:"), messageType);
        } catch (error: any) {
          console.error(chalk.red("Failed to send message:"), error.message);
          process.exit(1);
        }
      });

    // Show message info
    message
      .command("info <messageId>")
      .description("Show message information")
      .action(async (messageId, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Fetching message information...").start();

          const client = await createClient(globalOpts.network);

          const messageData = await client.getMessage(new PublicKey(messageId));

          if (!messageData) {
            spinner.fail("Message not found");
            return;
          }

          spinner.succeed("Message information retrieved");

          const data = [
            ["Message ID", messageData.pubkey.toBase58()],
            ["Sender", messageData.sender.toBase58()],
            ["Recipient", messageData.recipient.toBase58()],
            ["Type", messageData.messageType],
            ["Status", messageData.status],
            [
              "Payload",
              messageData.payload.slice(0, 100) +
                (messageData.payload.length > 100 ? "..." : ""),
            ],
            [
              "Timestamp",
              new Date(messageData.timestamp * 1000).toLocaleString(),
            ],
            [
              "Expires At",
              messageData.expiresAt
                ? new Date(messageData.expiresAt * 1000).toLocaleString()
                : "Never",
            ],
          ];

          console.log(
            "\n" +
              table(data, {
                header: {
                  alignment: "center",
                  content: chalk.blue.bold("Message Information"),
                },
              }),
          );
        } catch (error: any) {
          console.error(
            chalk.red("Failed to fetch message info:"),
            error.message,
          );
          process.exit(1);
        }
      });

    // Update message status
    message
      .command("status")
      .description("Update message status")
      .option("-m, --message <messageId>", "Message ID")
      .option(
        "-s, --status <status>",
        "New status (pending, delivered, read, failed)",
      )
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          if (!options.message || !options.status) {
            console.error(
              chalk.red("Error: Message ID and status are required"),
            );
            console.log(
              chalk.yellow(
                "Usage: pod message status -m <messageId> -s <status>",
              ),
            );
            return;
          }

          const validStatuses = ["pending", "delivered", "read", "failed"];
          if (!validStatuses.includes(options.status)) {
            console.error(
              chalk.red("Error: Invalid status. Must be one of:"),
              validStatuses.join(", "),
            );
            return;
          }

          const spinner = ora("Updating message status...").start();

          const client = await createClient(globalOpts.network);
          const wallet = getWallet(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Message status update prepared");
            console.log(chalk.cyan("Message:"), options.message);
            console.log(chalk.cyan("New Status:"), options.status);
            return;
          }

          const signature = await client.updateMessageStatus(
            wallet,
            new PublicKey(options.message),
            options.status as MessageStatus,
          );

          spinner.succeed("Message status updated successfully!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Message:"), options.message);
          console.log(chalk.cyan("New Status:"), options.status);
        } catch (error: any) {
          console.error(
            chalk.red("Failed to update message status:"),
            error.message,
          );
          process.exit(1);
        }
      });

    // List messages
    message
      .command("list")
      .description("List messages for an agent")
      .option(
        "-a, --agent [address]",
        "Agent address (defaults to current wallet)",
      )
      .option(
        "-l, --limit <number>",
        "Maximum number of messages to show",
        "10",
      )
      .option(
        "-f, --filter <status>",
        "Filter by status (pending, delivered, read, failed)",
      )
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();

        try {
          const spinner = ora("Fetching messages...").start();

          const client = await createClient(globalOpts.network);

          let agentAddress;
          if (options.agent) {
            agentAddress = new PublicKey(options.agent);
          } else {
            const wallet = getWallet(globalOpts.keypair);
            agentAddress = wallet.publicKey;
          }

          const messages = await client.getAgentMessages(
            agentAddress,
            parseInt(options.limit, 10),
            options.filter as MessageStatus,
          );

          if (messages.length === 0) {
            spinner.succeed("No messages found");
            return;
          }

          spinner.succeed(`Found ${messages.length} messages`);

          const data = messages.map((msg: any) => [
            msg.pubkey.toBase58().slice(0, 8) + "...",
            msg.sender.toBase58().slice(0, 8) + "...",
            msg.recipient.toBase58().slice(0, 8) + "...",
            msg.messageType,
            msg.status,
            new Date(msg.timestamp * 1000).toLocaleDateString(),
          ]);

          console.log(
            "\n" +
              table(
                [
                  ["ID", "Sender", "Recipient", "Type", "Status", "Date"],
                  ...data,
                ],
                {
                  header: {
                    alignment: "center",
                    content: chalk.blue.bold("Messages"),
                  },
                },
              ),
          );
        } catch (error: any) {
          console.error(chalk.red("Failed to list messages:"), error.message);
          process.exit(1);
        }
      });
  }
}
