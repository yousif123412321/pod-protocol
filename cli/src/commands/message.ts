import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { table } from "table";
import { PublicKey } from "@solana/web3.js";
import { PodComClient, MessageType, MessageStatus } from "@pod-protocol/sdk";
import { createClient, getWallet } from "../utils/client";
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
  validateMessage,
  validateEnum,
  validatePositiveInteger,
  ValidationError,
} from "../utils/validation";

export class MessageCommands {
  register(program: Command) {
    const message = program
      .command("message")
      .description("Manage messages between AI agents");

    this.registerSend(message);
    this.registerInfo(message);
    this.registerStatus(message);
    this.registerList(message);
  }

  private registerSend(message: Command) {
    message
      .command("send")
      .description("Send a message to another agent")
      .option("-r, --recipient <address>", "Recipient agent address")
      .option("-p, --payload <text>", "Message payload/content")
      .option(
        "-t, --type <type>",
        "Message type (text, data, command, response, custom)",
        "text"
      )
      .option(
        "-c, --custom-value <number>",
        "Custom value for custom message types"
      )
      .option("-i, --interactive", "Interactive message creation")
      .action(
        createCommandHandler(
          "send message",
          async (client, wallet, globalOpts, options) => {
            await this.handleSend(client, wallet, globalOpts, options);
          }
        )
      );
  }

  private async handleSend(
    client: PodComClient,
    wallet: any,
    globalOpts: any,
    options: any
  ) {
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
      throw new ValidationError("Recipient and payload are required");
    }

    const recipientKey = validatePublicKey(recipient, "recipient");
    const validatedPayload = validateMessage(payload);

    const spinner = createSpinner("Sending message...");

    if (
      handleDryRun(globalOpts, spinner, "Message send", {
        Recipient: recipientKey.toBase58(),
        Type: messageType,
        Content:
          validatedPayload.slice(0, 100) +
          (validatedPayload.length > 100 ? "..." : ""),
        "Custom Value": customValue > 0 ? customValue : "N/A",
      })
    ) {
      return;
    }

    const signature = await client.sendMessage(wallet, {
      recipient: recipientKey,
      payload: validatedPayload,
      messageType,
      customValue,
    });

    showSuccess(spinner, "Message sent successfully!", {
      Transaction: signature,
      Recipient: recipientKey.toBase58(),
      Type: messageType,
    });
  }

  private registerInfo(message: Command) {
    message
      .command("info <messageId>")
      .description("Show message information")
      .action((messageId, cmd) => this.handleInfo(messageId, cmd));
  }

  private async handleInfo(messageId: string, cmd: Command) {
    const globalOpts = cmd.optsWithGlobals();

    try {
      const messageKey = validatePublicKey(messageId, "message ID");
      const spinner = createSpinner("Fetching message information...");

      const client = await createClient(globalOpts.network);

      const messageData = await client.getMessage(messageKey);

      if (!messageData) {
        spinner.fail("Message not found");
        return;
      }

      spinner.succeed("Message information retrieved");

      const data = [
        ["Message ID", formatValue(messageData.pubkey.toBase58(), "address")],
        ["Sender", formatValue(messageData.sender.toBase58(), "address")],
        ["Recipient", formatValue(messageData.recipient.toBase58(), "address")],
        ["Type", formatValue(messageData.messageType, "text")],
        ["Status", formatValue(messageData.status, "text")],
        [
          "Payload",
          formatValue(
            messageData.payload.slice(0, 100) +
              (messageData.payload.length > 100 ? "..." : ""),
            "text"
          ),
        ],
        [
          "Timestamp",
          formatValue(
            new Date(messageData.timestamp * 1000).toLocaleString(),
            "text"
          ),
        ],
        [
          "Expires At",
          formatValue(
            messageData.expiresAt
              ? new Date(messageData.expiresAt * 1000).toLocaleString()
              : "Never",
            "text"
          ),
        ],
      ];

      console.log("\n" + table(data, getTableConfig("Message Information")));
    } catch (error: any) {
      console.error(chalk.red("Failed to fetch message info:"), error.message);
      process.exit(1);
    }
  }

  private registerStatus(message: Command) {
    message
      .command("status")
      .description("Update message status")
      .option("-m, --message <messageId>", "Message ID")
      .option(
        "-s, --status <status>",
        "New status (pending, delivered, read, failed)"
      )
      .action((options, cmd) => this.handleStatus(options, cmd));
  }

  private async handleStatus(options: any, cmd: Command) {
    const globalOpts = cmd.optsWithGlobals();

    try {
      if (!options.message || !options.status) {
        throw new ValidationError("Message ID and status are required");
      }

      const messageKey = validatePublicKey(options.message, "message ID");
      const validStatuses = ["pending", "delivered", "read", "failed"] as const;
      const validatedStatus = validateEnum(
        options.status,
        validStatuses,
        "status"
      );

      const spinner = createSpinner("Updating message status...");

      const client = await createClient(globalOpts.network);
      const wallet = getWallet(globalOpts.keypair);

      if (
        handleDryRun(globalOpts, spinner, "Message status update", {
          Message: options.message,
          "New Status": validatedStatus,
        })
      ) {
        return;
      }

      const signature = await client.updateMessageStatus(
        wallet,
        messageKey,
        validatedStatus as MessageStatus
      );

      showSuccess(spinner, "Message status updated successfully!", {
        Transaction: signature,
        Message: options.message,
        "New Status": validatedStatus,
      });
    } catch (error: any) {
      console.error(
        chalk.red("Failed to update message status:"),
        error.message
      );
      process.exit(1);
    }
  }

  private registerList(message: Command) {
    message
      .command("list")
      .description("List messages for an agent")
      .option(
        "-a, --agent [address]",
        "Agent address (defaults to current wallet)"
      )
      .option(
        "-l, --limit <number>",
        "Maximum number of messages to show",
        "10"
      )
      .option(
        "-f, --filter <status>",
        "Filter by status (pending, delivered, read, failed)"
      )
      .action((options, cmd) => this.handleList(options, cmd));
  }

  private async handleList(options: any, cmd: Command) {
    const globalOpts = cmd.optsWithGlobals();

    try {
      const limit = validatePositiveInteger(options.limit, "limit");
      const spinner = createSpinner("Fetching messages...");

      const client = await createClient(globalOpts.network);

      let agentAddress;
      if (options.agent) {
        agentAddress = validatePublicKey(options.agent, "agent address");
      } else {
        const wallet = getWallet(globalOpts.keypair);
        agentAddress = wallet.publicKey;
      }

      const messages = await client.getAgentMessages(
        agentAddress,
        limit,
        options.filter as MessageStatus
      );

      if (messages.length === 0) {
        spinner.succeed("No messages found");
        return;
      }

      spinner.succeed(`Found ${messages.length} messages`);

      const data = messages.map((msg: any) => [
        formatValue(msg.pubkey.toBase58().slice(0, 8) + "...", "address"),
        formatValue(msg.sender.toBase58().slice(0, 8) + "...", "address"),
        formatValue(msg.recipient.toBase58().slice(0, 8) + "...", "address"),
        formatValue(msg.messageType, "text"),
        formatValue(msg.status, "text"),
        formatValue(
          new Date(msg.timestamp * 1000).toLocaleDateString(),
          "text"
        ),
      ]);

      console.log(
        "\n" +
          table(
            [["ID", "Sender", "Recipient", "Type", "Status", "Date"], ...data],
            getTableConfig("Messages")
          )
      );
    } catch (error: any) {
      console.error(chalk.red("Failed to list messages:"), error.message);
      process.exit(1);
    }
  }
}
