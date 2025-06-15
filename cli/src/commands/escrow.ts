import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { table } from "table";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PodComClient, lamportsToSol, solToLamports } from "@pod-com/sdk";
import { loadKeypair, getNetworkEndpoint } from "../utils/config";

export class EscrowCommands {
  register(program: Command) {
    const escrow = program
      .command("escrow")
      .description("Manage escrow accounts for channel fees");

    // Deposit to escrow
    escrow
      .command("deposit")
      .description("Deposit SOL to channel escrow for fees")
      .option("-c, --channel <channelId>", "Channel ID")
      .option("-a, --amount <sol>", "Amount in SOL to deposit")
      .option("-l, --lamports <lamports>", "Amount in lamports to deposit")
      .option("-i, --interactive", "Interactive deposit")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();
        
        try {
          let channelId = options.channel;
          let amount: number = 0;

          if (options.interactive) {
            const answers = await inquirer.prompt([
              {
                type: "input",
                name: "channelId",
                message: "Channel ID:",
                validate: (input: string) => {
                  try {
                    new PublicKey(input);
                    return true;
                  } catch {
                    return "Please enter a valid channel ID";
                  }
                }
              },
              {
                type: "list",
                name: "unit",
                message: "Amount unit:",
                choices: [
                  { name: "SOL", value: "sol" },
                  { name: "Lamports", value: "lamports" }
                ]
              },
              {
                type: "number",
                name: "amount",
                message: (answers) => `Amount in ${answers.unit.toUpperCase()}:`,
                validate: (input: number) => input > 0 ? true : "Amount must be greater than 0"
              }
            ]);

            channelId = answers.channelId;
            amount = answers.unit === "sol" ? solToLamports(answers.amount) : answers.amount;
          } else {
            if (!channelId) {
              console.error(chalk.red("Error: Channel ID is required"));
              process.exit(1);
            }

            if (options.amount && options.lamports) {
              console.error(chalk.red("Error: Specify either --amount (SOL) or --lamports, not both"));
              process.exit(1);
            }

            if (options.amount) {
              amount = solToLamports(parseFloat(options.amount));
            } else if (options.lamports) {
              amount = parseInt(options.lamports);
            } else {
              console.error(chalk.red("Error: Amount is required (use --amount for SOL or --lamports)"));
              process.exit(1);
            }
          }

          const spinner = ora("Depositing to escrow...").start();

          const client = new PodComClient({
            endpoint: getNetworkEndpoint(globalOpts.network),
            commitment: "confirmed"
          });

          await client.initialize();
          const wallet = loadKeypair(globalOpts.keypair);

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Escrow deposit prepared");
            console.log(chalk.cyan("Channel:"), channelId);
            console.log(chalk.cyan("Amount:"), `${lamportsToSol(amount)} SOL (${amount} lamports)`);
            return;
          }

          const signature = await client.depositEscrow(wallet, {
            channel: new PublicKey(channelId),
            amount
          });

          spinner.succeed("Escrow deposit successful!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Channel:"), channelId);
          console.log(chalk.cyan("Deposited:"), `${lamportsToSol(amount)} SOL`);

        } catch (error: any) {
          console.error(chalk.red("Failed to deposit to escrow:"), error.message);
          process.exit(1);
        }
      });

    // Withdraw from escrow
    escrow
      .command("withdraw")
      .description("Withdraw SOL from channel escrow")
      .option("-c, --channel <channelId>", "Channel ID")
      .option("-a, --amount <sol>", "Amount in SOL to withdraw")
      .option("-l, --lamports <lamports>", "Amount in lamports to withdraw")
      .option("--all", "Withdraw all available funds")
      .option("-i, --interactive", "Interactive withdrawal")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();
        
        try {
          let channelId = options.channel;
          let amount: number = 0;
          let withdrawAll = options.all;

          if (options.interactive) {
            const answers = await inquirer.prompt([
              {
                type: "input",
                name: "channelId",
                message: "Channel ID:",
                validate: (input: string) => {
                  try {
                    new PublicKey(input);
                    return true;
                  } catch {
                    return "Please enter a valid channel ID";
                  }
                }
              },
              {
                type: "confirm",
                name: "withdrawAll",
                message: "Withdraw all available funds?",
                default: false
              },
              {
                type: "list",
                name: "unit",
                message: "Amount unit:",
                choices: [
                  { name: "SOL", value: "sol" },
                  { name: "Lamports", value: "lamports" }
                ],
                when: (answers) => !answers.withdrawAll
              },
              {
                type: "number",
                name: "amount",
                message: (answers) => `Amount in ${answers.unit?.toUpperCase()}:`,
                validate: (input: number) => input > 0 ? true : "Amount must be greater than 0",
                when: (answers) => !answers.withdrawAll
              }
            ]);

            channelId = answers.channelId;
            withdrawAll = answers.withdrawAll;
            amount = answers.withdrawAll ? 0 : 
              (answers.unit === "sol" ? solToLamports(answers.amount) : answers.amount);
          } else {
            if (!channelId) {
              console.error(chalk.red("Error: Channel ID is required"));
              process.exit(1);
            }

            if (!withdrawAll) {
              if (options.amount && options.lamports) {
                console.error(chalk.red("Error: Specify either --amount (SOL) or --lamports, not both"));
                process.exit(1);
              }

              if (options.amount) {
                amount = solToLamports(parseFloat(options.amount));
              } else if (options.lamports) {
                amount = parseInt(options.lamports);
              } else {
                console.error(chalk.red("Error: Amount is required (use --amount for SOL, --lamports, or --all)"));
                process.exit(1);
              }
            }
          }

          const spinner = ora("Withdrawing from escrow...").start();

          const client = new PodComClient({
            endpoint: getNetworkEndpoint(globalOpts.network),
            commitment: "confirmed"
          });

          await client.initialize();
          const wallet = loadKeypair(globalOpts.keypair);

          // If withdrawing all, get current balance first
          if (withdrawAll) {
            const escrowData = await client.getEscrow(
              new PublicKey(channelId),
              wallet.publicKey
            );
            if (!escrowData) {
              spinner.fail("No escrow account found for this channel");
              return;
            }
            amount = escrowData.balance;
          }

          if (globalOpts.dryRun) {
            spinner.succeed("Dry run: Escrow withdrawal prepared");
            console.log(chalk.cyan("Channel:"), channelId);
            console.log(chalk.cyan("Amount:"), withdrawAll ? "All funds" : `${lamportsToSol(amount)} SOL (${amount} lamports)`);
            return;
          }

          const signature = await client.withdrawEscrow(wallet, {
            channel: new PublicKey(channelId),
            amount
          });

          spinner.succeed("Escrow withdrawal successful!");
          console.log(chalk.green("Transaction:"), signature);
          console.log(chalk.cyan("Channel:"), channelId);
          console.log(chalk.cyan("Withdrawn:"), `${lamportsToSol(amount)} SOL`);

        } catch (error: any) {
          console.error(chalk.red("Failed to withdraw from escrow:"), error.message);
          process.exit(1);
        }
      });

    // Show escrow balance
    escrow
      .command("balance")
      .description("Show escrow balance for a channel")
      .option("-c, --channel <channelId>", "Channel ID")
      .option("-a, --agent [address]", "Agent address (defaults to current wallet)")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();
        
        try {
          if (!options.channel) {
            console.error(chalk.red("Error: Channel ID is required"));
            process.exit(1);
          }

          const spinner = ora("Fetching escrow balance...").start();

          const client = new PodComClient({
            endpoint: getNetworkEndpoint(globalOpts.network),
            commitment: "confirmed"
          });

          await client.initialize();
          
          let agentAddress;
          if (options.agent) {
            agentAddress = new PublicKey(options.agent);
          } else {
            const wallet = loadKeypair(globalOpts.keypair);
            agentAddress = wallet.publicKey;
          }

          const escrowData = await client.getEscrow(
            new PublicKey(options.channel),
            agentAddress
          );

          if (!escrowData) {
            spinner.succeed("No escrow account found");
            return;
          }

          spinner.succeed("Escrow balance retrieved");

          const data = [
            ["Channel", escrowData.channel.toBase58()],
            ["Depositor", escrowData.depositor.toBase58()],
            ["Balance", `${lamportsToSol(escrowData.balance)} SOL`],
            ["Balance (Lamports)", escrowData.balance.toString()],
            ["Last Updated", new Date(escrowData.lastUpdated * 1000).toLocaleString()]
          ];

          console.log("\n" + table(data, {
            header: {
              alignment: "center",
              content: chalk.blue.bold("Escrow Balance")
            }
          }));

        } catch (error: any) {
          console.error(chalk.red("Failed to fetch escrow balance:"), error.message);
          process.exit(1);
        }
      });

    // List all escrow accounts
    escrow
      .command("list")
      .description("List all escrow accounts for current wallet")
      .option("-l, --limit <number>", "Maximum number of escrows to show", "10")
      .action(async (options, cmd) => {
        const globalOpts = cmd.optsWithGlobals();
        
        try {
          const spinner = ora("Fetching escrow accounts...").start();

          const client = new PodComClient({
            endpoint: getNetworkEndpoint(globalOpts.network),
            commitment: "confirmed"
          });

          await client.initialize();
          const wallet = loadKeypair(globalOpts.keypair);
          
          const escrows = await client.getEscrowsByDepositor(
            wallet.publicKey,
            parseInt(options.limit)
          );

          if (escrows.length === 0) {
            spinner.succeed("No escrow accounts found");
            return;
          }

          spinner.succeed(`Found ${escrows.length} escrow accounts`);

          const data = escrows.map((escrow: any) => [
            escrow.channel.toBase58().slice(0, 8) + "...",
            `${lamportsToSol(escrow.balance)} SOL`,
            escrow.balance.toString(),
            new Date(escrow.lastUpdated * 1000).toLocaleDateString()
          ]);

          console.log("\n" + table([
            ["Channel", "Balance (SOL)", "Balance (Lamports)", "Last Updated"],
            ...data
          ], {
            header: {
              alignment: "center",
              content: chalk.blue.bold("Escrow Accounts")
            }
          }));

        } catch (error: any) {
          console.error(chalk.red("Failed to list escrow accounts:"), error.message);
          process.exit(1);
        }
      });
  }
}