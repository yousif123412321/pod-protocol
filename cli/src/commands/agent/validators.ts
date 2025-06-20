import { PublicKey } from "@solana/web3.js";

export class AgentValidators {
  static validateAgentAddress = (address: string): void => {
    try {
      new PublicKey(address);
    } catch {
      throw new Error(`Invalid agent address: ${address}`);
    }
  };

  static validateCapabilities = (capabilities: string): number => {
    const numCaps = parseInt(capabilities, 10);
    if (isNaN(numCaps) || numCaps < 0 || numCaps > 255) {
      throw new Error(
        "Invalid capabilities: must be a number between 0 and 255",
      );
    }
    return numCaps;
  };

  static validateMetadataUri = (uri: string): void => {
    if (uri && !AgentValidators.isValidUri(uri)) {
      throw new Error(`Invalid metadata URI: ${uri}`);
    }
  };

  static validateLimit = (limit: string): number => {
    const numLimit = parseInt(limit, 10);
    if (isNaN(numLimit) || numLimit <= 0) {
      throw new Error("Invalid limit: must be a positive number");
    }
    return numLimit;
  };

  static isValidUri = (uri: string): boolean => {
    try {
      new URL(uri);
      return true;
    } catch {
      return false;
    }
  };
}
