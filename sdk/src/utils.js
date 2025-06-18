import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, MessageType, AGENT_CAPABILITIES } from "./types";
// Re-export types for convenience
export { MessageType } from "./types";
/**
 * Calculate PDA for an agent account
 */
export function findAgentPDA(wallet, programId = PROGRAM_ID) {
    return PublicKey.findProgramAddressSync([Buffer.from("agent"), wallet.toBuffer()], programId);
}
/**
 * Calculate PDA for a message account
 */
export function findMessagePDA(senderAgent, recipient, payloadHash, messageType, programId = PROGRAM_ID) {
    let messageTypeId;
    // Handle both enum and object formats
    if (typeof messageType === "string") {
        messageTypeId = getMessageTypeId(messageType);
    }
    else {
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
    return PublicKey.findProgramAddressSync([
        Buffer.from("message"),
        senderAgent.toBuffer(),
        recipient.toBuffer(),
        Buffer.from(payloadHash),
        Buffer.from([messageTypeId]),
    ], programId);
}
/**
 * Calculate PDA for a channel account
 */
export function findChannelPDA(creator, name, programId = PROGRAM_ID) {
    return PublicKey.findProgramAddressSync([Buffer.from("channel"), creator.toBuffer(), Buffer.from(name)], programId);
}
/**
 * Calculate PDA for an escrow account
 */
export function findEscrowPDA(channel, depositor, programId = PROGRAM_ID) {
    return PublicKey.findProgramAddressSync([Buffer.from("escrow"), channel.toBuffer(), depositor.toBuffer()], programId);
}
/**
 * Convert MessageType enum to numeric ID
 */
export function getMessageTypeId(messageType, customValue) {
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
export function getMessageTypeFromId(id) {
    if (id === 0)
        return { type: MessageType.Text };
    if (id === 1)
        return { type: MessageType.Data };
    if (id === 2)
        return { type: MessageType.Command };
    if (id === 3)
        return { type: MessageType.Response };
    if (id >= 4)
        return { type: MessageType.Custom, customValue: id - 4 };
    throw new Error(`Unknown message type ID: ${id}`);
}
/**
 * Convert MessageType enum to program format (object with empty record)
 */
export function convertMessageTypeToProgram(messageType, customValue) {
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
export function convertMessageTypeFromProgram(programType) {
    if (programType.text !== undefined)
        return { type: MessageType.Text };
    if (programType.data !== undefined)
        return { type: MessageType.Data };
    if (programType.command !== undefined)
        return { type: MessageType.Command };
    if (programType.response !== undefined)
        return { type: MessageType.Response };
    if (programType.custom !== undefined)
        return { type: MessageType.Custom, customValue: programType.custom };
    return { type: MessageType.Text };
}
/**
 * Handle legacy object-based message type format for backward compatibility
 */
export function getMessageTypeIdFromObject(msg) {
    if (msg.text !== undefined)
        return 0;
    if (msg.data !== undefined)
        return 1;
    if (msg.command !== undefined)
        return 2;
    if (msg.response !== undefined)
        return 3;
    if (typeof msg.custom === "number")
        return 4 + msg.custom;
    return 0;
}
/**
 * Create a SHA-256 hash of message payload
 */
export async function hashPayload(payload) {
    const data = typeof payload === "string" ? new TextEncoder().encode(payload) : payload;
    const hash = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(hash);
}
/**
 * Check if agent has specific capability
 */
export function hasCapability(capabilities, capability) {
    return (capabilities & capability) !== 0;
}
/**
 * Add capability to existing capabilities
 */
export function addCapability(capabilities, capability) {
    return capabilities | capability;
}
/**
 * Remove capability from existing capabilities
 */
export function removeCapability(capabilities, capability) {
    return capabilities & ~capability;
}
/**
 * Get human-readable capability names from bitmask
 */
export function getCapabilityNames(capabilities) {
    const names = [];
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
export function lamportsToSol(lamports, decimals = 9) {
    return lamports / Math.pow(10, decimals);
}
/**
 * Convert SOL to lamports
 */
export function solToLamports(sol) {
    return Math.round(sol * 1e9);
}
/**
 * Validate Solana public key format
 */
export function isValidPublicKey(address) {
    try {
        new PublicKey(address);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry function with exponential backoff
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i === maxRetries) {
                throw lastError;
            }
            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
    throw lastError;
}
/**
 * Convert BN timestamp to number with fallback options
 * Handles common timestamp conversion patterns used across services
 */
export function convertTimestamp(primaryField, fallbackField, defaultValue = Date.now()) {
    return primaryField?.toNumber() || fallbackField?.toNumber() || defaultValue;
}
/**
 * Get timestamp from account with common field name patterns
 * Handles timestamp/createdAt field variations
 */
export function getAccountTimestamp(account) {
    return convertTimestamp(account.timestamp, account.createdAt);
}
/**
 * Get creation timestamp from account with common field name patterns
 * Handles createdAt/timestamp field variations (reverse order for createdAt)
 */
export function getAccountCreatedAt(account) {
    return convertTimestamp(account.createdAt, account.timestamp);
}
/**
 * Get last updated timestamp from account with common field name patterns
 * Handles lastUpdated/updatedAt field variations
 */
export function getAccountLastUpdated(account) {
    return convertTimestamp(account.lastUpdated, account.updatedAt);
}
