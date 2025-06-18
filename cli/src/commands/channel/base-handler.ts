import chalk from "chalk";
import { PublicKey } from "@solana/web3.js";
import { Ora } from "ora";
import { handleDryRun, createSpinner, showSuccess, handleCommandError } from "../../utils/shared.js";
import { CommandContext } from "./types.js";

export abstract class BaseChannelHandler {
  protected context: CommandContext;

  constructor(context: CommandContext) {
    this.context = context;
  }

  protected createPublicKey(id: string): PublicKey {
    try {
      return new PublicKey(id);
    } catch (error) {
      throw new Error(`Invalid public key: ${id}`);
    }
  }

  protected async executeWithSpinner<T>(
    message: string,
    operation: () => Promise<T>,
    dryRunData?: Record<string, string>
  ): Promise<T | void> {
    const spinner = createSpinner(message);

    if (this.context.globalOpts.dryRun && dryRunData) {
      if (handleDryRun(this.context.globalOpts, spinner, message, dryRunData)) {
        return;
      }
    }

    try {
      const result = await operation();
      return result;
    } catch (error: any) {
      spinner.fail(`Failed: ${error.message}`);
      throw error;
    }
  }

  protected handleError(operation: string, error: any): never {
    console.error(chalk.red(`Failed to ${operation}:`), error.message);
    process.exit(1);
    throw new Error(); // This line will never be reached but satisfies TypeScript
  }

  protected showSuccessWithTransaction(
    spinner: any,
    message: string,
    signature: string,
    additionalData?: Record<string, string>
  ): void {
    showSuccess(spinner, message, {
      Transaction: signature,
      ...additionalData,
    });
  }
}
