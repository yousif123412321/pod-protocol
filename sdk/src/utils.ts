import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, MessageType, AGENT_CAPABILITIES } from "./types";

// Re-export types for convenience
export { MessageType } from "./types";

/**
 * Calculate PDA for an agent account
 */
export function findAgentPDA(
  wallet: PublicKey,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent"), wallet.toBuffer()],
    programId
  );
}

/**
 * Calculate PDA for a message account
 */
export function findMessagePDA(
  senderAgent: PublicKey,
  recipient: PublicKey,
  payloadHash: Uint8Array,
  messageType: MessageType | any,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  let messageTypeId: number;

  // Handle both enum and object formats
  if (typeof messageType === "string") {
    messageTypeId = getMessageTypeId(messageType as MessageType);
  } else {
    // Handle object format from program
    messageTypeId =
      messageType.text !== undefined
        ? 0
        : messageType.data !== undefined
        ? 1
        : messageType.command !== undefined
        ? 2
        : messageType.response !== undefined
        ? 3
        : typeof messageType.custom === "number"
        ? 4 + messageType.custom
        : 0;
  }

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("message"),
      senderAgent.toBuffer(),
      recipient.toBuffer(),
      Buffer.from(payloadHash),
      Buffer.from([messageTypeId]),
    ],
    programId
  );
}

/**
 * Calculate PDA for a channel account
 */
export function findChannelPDA(
  creator: PublicKey,
  name: string,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("channel"), creator.toBuffer(), Buffer.from(name)],
    programId
  );
}

/**
 * Calculate PDA for an escrow account
 */
export function findEscrowPDA(
  channel: PublicKey,
  depositor: PublicKey,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), channel.toBuffer(), depositor.toBuffer()],
    programId
  );
}

/**
 * Convert MessageType enum to numeric ID
 */
export function getMessageTypeId(
  messageType: MessageType,
  customValue?: number
): number {
  switch (messageType) {
    case MessageType.Text:
      return 0;
    case MessageType.Data:
      return 1;
    case MessageType.Command:
      return 2;
    case MessageType.Response:
      return 3;
    case MessageType.Custom:
      return 4 + (customValue ?? 0);
    default:
      throw new Error(`Unknown message type: ${messageType}`);
  }
}

/**
 * Convert numeric ID back to MessageType
 */
export function getMessageTypeFromId(id: number): {
  type: MessageType;
  customValue?: number;
} {
  if (id === 0) return { type: MessageType.Text };
  if (id === 1) return { type: MessageType.Data };
  if (id === 2) return { type: MessageType.Command };
  if (id === 3) return { type: MessageType.Response };
  if (id >= 4) return { type: MessageType.Custom, customValue: id - 4 };

  throw new Error(`Unknown message type ID: ${id}`);
}

/**
 * Convert MessageType enum to program format (object with empty record)
 */
export function convertMessageTypeToProgram(
  messageType: MessageType,
  customValue?: number
): any {
  switch (messageType) {
    case MessageType.Text:
      return { text: {} };
    case MessageType.Data:
      return { data: {} };
    case MessageType.Command:
      return { command: {} };
    case MessageType.Response:
      return { response: {} };
    case MessageType.Custom:
      return { custom: customValue || 0 };
    default:
      return { text: {} };
  }
}

/**
 * Convert program format back to MessageType enum
 */
export function convertMessageTypeFromProgram(programType: any): {
  type: MessageType;
  customValue?: number;
} {
  if (programType.text !== undefined) return { type: MessageType.Text };
  if (programType.data !== undefined) return { type: MessageType.Data };
  if (programType.command !== undefined) return { type: MessageType.Command };
  if (programType.response !== undefined) return { type: MessageType.Response };
  if (programType.custom !== undefined)
    return { type: MessageType.Custom, customValue: programType.custom };
  return { type: MessageType.Text };
}

/**
 * Handle legacy object-based message type format for backward compatibility
 */
export function getMessageTypeIdFromObject(msg: any): number {
  if (msg.text !== undefined) return 0;
  if (msg.data !== undefined) return 1;
  if (msg.command !== undefined) return 2;
  if (msg.response !== undefined) return 3;
  if (typeof msg.custom === "number") return 4 + msg.custom;
  return 0;
}

/**
 * Create a SHA-256 hash of message payload
 */
export async function hashPayload(
  payload: string | Uint8Array
): Promise<Uint8Array> {
  const data =
    typeof payload === "string" ? new TextEncoder().encode(payload) : payload;
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

/**
 * Check if agent has specific capability
 */
export function hasCapability(
  capabilities: number,
  capability: number
): boolean {
  return (capabilities & capability) !== 0;
}

/**
 * Add capability to existing capabilities
 */
export function addCapability(
  capabilities: number,
  capability: number
): number {
  return capabilities | capability;
}

/**
 * Remove capability from existing capabilities
 */
export function removeCapability(
  capabilities: number,
  capability: number
): number {
  return capabilities & ~capability;
}

/**
 * Get human-readable capability names from bitmask
 */
export function getCapabilityNames(capabilities: number): string[] {
  const names: string[] = [];

  if (hasCapability(capabilities, AGENT_CAPABILITIES.TRADING)) {
    names.push("Trading");
  }
  if (hasCapability(capabilities, AGENT_CAPABILITIES.ANALYSIS)) {
    names.push("Analysis");
  }
  if (hasCapability(capabilities, AGENT_CAPABILITIES.DATA_PROCESSING)) {
    names.push("Data Processing");
  }
  if (hasCapability(capabilities, AGENT_CAPABILITIES.CONTENT_GENERATION)) {
    names.push("Content Generation");
  }
  if (hasCapability(capabilities, AGENT_CAPABILITIES.CUSTOM_1)) {
    names.push("Custom 1");
  }
  if (hasCapability(capabilities, AGENT_CAPABILITIES.CUSTOM_2)) {
    names.push("Custom 2");
  }
  if (hasCapability(capabilities, AGENT_CAPABILITIES.CUSTOM_3)) {
    names.push("Custom 3");
  }
  if (hasCapability(capabilities, AGENT_CAPABILITIES.CUSTOM_4)) {
    names.push("Custom 4");
  }

  return names;
}

/**
 * Format lamports to SOL with specified decimal places
 */
export function lamportsToSol(lamports: number, decimals: number = 9): number {
  return lamports / Math.pow(10, decimals);
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.round(sol * 1e9);
}

/**
 * Validate Solana public key format
 */
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Convert BN timestamp to number with fallback options
 * Handles common timestamp conversion patterns used across services
 */
export function convertTimestamp(
  primaryField?: any,
  fallbackField?: any,
  defaultValue: number = Date.now()
): number {
  return primaryField?.toNumber() || fallbackField?.toNumber() || defaultValue;
}

/**
 * Get timestamp from account with common field name patterns
 * Handles timestamp/createdAt field variations
 */
export function getAccountTimestamp(account: any): number {
  return convertTimestamp(account.timestamp, account.createdAt);
}

/**
 * Get creation timestamp from account with common field name patterns
 * Handles createdAt/timestamp field variations (reverse order for createdAt)
 */
export function getAccountCreatedAt(account: any): number {
  return convertTimestamp(account.createdAt, account.timestamp);
}

/**
 * Get last updated timestamp from account with common field name patterns
 * Handles lastUpdated/updatedAt field variations
 */
export function getAccountLastUpdated(account: any): number {
  return convertTimestamp(account.lastUpdated, account.updatedAt);
}
