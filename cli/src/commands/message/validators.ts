import { PublicKey } from "@solana/web3.js";
import { MessageStatus } from "@pod-protocol/sdk";
import {
  validatePublicKey,
  validateMessage,
  validateEnum,
  validatePositiveInteger,
} from "../../utils/validation.js";

export class MessageValidators {
  static validateRecipient(recipient: string): PublicKey {
    return validatePublicKey(recipient, "recipient");
  }

  static validateMessageId(messageId: string): PublicKey {
    return validatePublicKey(messageId, "message ID");
  }

  static validateAgentAddress(address: string): PublicKey {
    return validatePublicKey(address, "agent address");
  }

  static validateMessageContent(payload: string): string {
    return validateMessage(payload);
  }

  static validateMessageStatus(status: string): MessageStatus {
    const validStatuses = ["pending", "delivered", "read", "failed"] as const;
    return validateEnum(status, validStatuses, "status") as MessageStatus;
  }

  static validateLimit(limit: string): number {
    return validatePositiveInteger(limit, "limit");
  }

  static validateCustomValue(customValue: string): number {
    const value = parseInt(customValue, 10);
    if (isNaN(value) || value < 0) {
      throw new Error("Invalid custom value: must be a non-negative number");
    }
    return value;
  }

  static validateRecipientInteractive(input: string): boolean | string {
    try {
      new PublicKey(input);
      return true;
    } catch {
      return "Please enter a valid Solana public key";
    }
  }
}
