import { PublicKey } from "@solana/web3.js";
import { MessageType } from "./types";
export { MessageType } from "./types";
/**
 * Calculate PDA for an agent account
 */
export declare function findAgentPDA(wallet: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Calculate PDA for a message account
 */
export declare function findMessagePDA(senderAgent: PublicKey, recipient: PublicKey, payloadHash: Uint8Array, messageType: MessageType | any, programId?: PublicKey): [PublicKey, number];
/**
 * Calculate PDA for a channel account
 */
export declare function findChannelPDA(creator: PublicKey, name: string, programId?: PublicKey): [PublicKey, number];
/**
 * Calculate PDA for an escrow account
 */
export declare function findEscrowPDA(channel: PublicKey, depositor: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Convert MessageType enum to numeric ID
 */
export declare function getMessageTypeId(messageType: MessageType, customValue?: number): number;
/**
 * Convert numeric ID back to MessageType
 */
export declare function getMessageTypeFromId(id: number): {
    type: MessageType;
    customValue?: number;
};
/**
 * Convert MessageType enum to program format (object with empty record)
 */
export declare function convertMessageTypeToProgram(messageType: MessageType, customValue?: number): any;
/**
 * Convert program format back to MessageType enum
 */
export declare function convertMessageTypeFromProgram(programType: any): {
    type: MessageType;
    customValue?: number;
};
/**
 * Handle legacy object-based message type format for backward compatibility
 */
export declare function getMessageTypeIdFromObject(msg: any): number;
/**
 * Create a SHA-256 hash of message payload
 */
export declare function hashPayload(payload: string | Uint8Array): Promise<Uint8Array>;
/**
 * Check if agent has specific capability
 */
export declare function hasCapability(capabilities: number, capability: number): boolean;
/**
 * Add capability to existing capabilities
 */
export declare function addCapability(capabilities: number, capability: number): number;
/**
 * Remove capability from existing capabilities
 */
export declare function removeCapability(capabilities: number, capability: number): number;
/**
 * Get human-readable capability names from bitmask
 */
export declare function getCapabilityNames(capabilities: number): string[];
/**
 * Format lamports to SOL with specified decimal places
 */
export declare function lamportsToSol(lamports: number, decimals?: number): number;
/**
 * Convert SOL to lamports
 */
export declare function solToLamports(sol: number): number;
/**
 * Validate Solana public key format
 */
export declare function isValidPublicKey(address: string): boolean;
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
/**
 * Convert BN timestamp to number with fallback options
 * Handles common timestamp conversion patterns used across services
 */
export declare function convertTimestamp(primaryField?: any, fallbackField?: any, defaultValue?: number): number;
/**
 * Get timestamp from account with common field name patterns
 * Handles timestamp/createdAt field variations
 */
export declare function getAccountTimestamp(account: any): number;
/**
 * Get creation timestamp from account with common field name patterns
 * Handles createdAt/timestamp field variations (reverse order for createdAt)
 */
export declare function getAccountCreatedAt(account: any): number;
/**
 * Get last updated timestamp from account with common field name patterns
 * Handles lastUpdated/updatedAt field variations
 */
export declare function getAccountLastUpdated(account: any): number;
//# sourceMappingURL=utils.d.ts.map