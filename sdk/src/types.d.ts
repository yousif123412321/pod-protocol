import { PublicKey } from "@solana/web3.js";
/**
 * PoD Protocol Program ID on Solana Devnet
 */
export declare const PROGRAM_ID: PublicKey;
/**
 * Message types supported by PoD Protocol
 */
export declare enum MessageType {
    Text = "text",
    Data = "data",
    Command = "command",
    Response = "response",
    Custom = "custom"
}
/**
 * Message status in the delivery lifecycle
 */
export declare enum MessageStatus {
    Pending = "pending",
    Delivered = "delivered",
    Read = "read",
    Failed = "failed"
}
/**
 * Channel visibility options
 */
export declare enum ChannelVisibility {
    Public = "public",
    Private = "private"
}
/**
 * Agent account data structure
 */
export interface AgentAccount {
    /** Agent's wallet public key */
    pubkey: PublicKey;
    /** Bitmask representing agent capabilities */
    capabilities: number;
    /** URI to agent metadata (IPFS, Arweave, etc.) */
    metadataUri: string;
    /** Agent reputation score */
    reputation: number;
    /** Last update timestamp */
    lastUpdated: number;
    /** PDA bump seed */
    bump: number;
}
/**
 * Message account data structure
 */
export interface MessageAccount {
    /** Message account public key */
    pubkey: PublicKey;
    /** Sender's public key */
    sender: PublicKey;
    /** Recipient's public key */
    recipient: PublicKey;
    /** SHA-256 hash of message payload */
    payloadHash: Uint8Array;
    /** Original message payload (for display) */
    payload: string;
    /** Type of message */
    messageType: MessageType;
    /** Creation timestamp */
    timestamp: number;
    /** Creation timestamp (alias for compatibility) */
    createdAt: number;
    /** Expiration timestamp */
    expiresAt: number;
    /** Current delivery status */
    status: MessageStatus;
    /** PDA bump seed */
    bump: number;
}
/**
 * Channel account data structure
 */
export interface ChannelAccount {
    /** Channel account public key */
    pubkey: PublicKey;
    /** Channel creator's public key */
    creator: PublicKey;
    /** Channel name */
    name: string;
    /** Channel description */
    description: string;
    /** Channel visibility setting */
    visibility: ChannelVisibility;
    /** Maximum number of participants allowed */
    maxParticipants: number;
    /** Current number of participants */
    participantCount: number;
    /** Current number of participants (alias for compatibility) */
    currentParticipants: number;
    /** Fee per message in lamports */
    feePerMessage: number;
    /** Total escrow balance in lamports */
    escrowBalance: number;
    /** Creation timestamp */
    createdAt: number;
    /** Whether channel is active */
    isActive: boolean;
    /** PDA bump seed */
    bump: number;
}
/**
 * Escrow account data structure
 */
export interface EscrowAccount {
    /** Associated channel public key */
    channel: PublicKey;
    /** Depositor's public key */
    depositor: PublicKey;
    /** Deposited amount in lamports */
    balance: number;
    /** Deposited amount in lamports (alias for compatibility) */
    amount: number;
    /** Deposit timestamp */
    createdAt: number;
    /** Last updated timestamp */
    lastUpdated: number;
    /** PDA bump seed */
    bump: number;
}
/**
 * Agent capabilities as bitmask values
 */
export declare const AGENT_CAPABILITIES: {
    readonly TRADING: number;
    readonly ANALYSIS: number;
    readonly DATA_PROCESSING: number;
    readonly CONTENT_GENERATION: number;
    readonly CUSTOM_1: number;
    readonly CUSTOM_2: number;
    readonly CUSTOM_3: number;
    readonly CUSTOM_4: number;
};
/**
 * Error types returned by PoD Protocol program
 */
export declare enum PodComError {
    InvalidMetadataUriLength = 6000,
    Unauthorized = 6001,
    MessageExpired = 6002,
    InvalidMessageStatusTransition = 6003
}
/**
 * Configuration for PoD Protocol SDK
 */
export interface PodComConfig {
    /** Solana cluster endpoint */
    endpoint?: string;
    /** Program ID (defaults to devnet) */
    programId?: PublicKey;
    /** Default commitment level */
    commitment?: "processed" | "confirmed" | "finalized";
}
/**
 * Options for creating a new agent
 */
export interface CreateAgentOptions {
    /** Agent capabilities bitmask */
    capabilities: number;
    /** Metadata URI */
    metadataUri: string;
}
/**
 * Options for updating an agent
 */
export interface UpdateAgentOptions {
    /** New capabilities (optional) */
    capabilities?: number;
    /** New metadata URI (optional) */
    metadataUri?: string;
}
/**
 * Options for sending a message
 */
export interface SendMessageOptions {
    /** Recipient's public key */
    recipient: PublicKey;
    /** Message payload (will be hashed) */
    payload: string | Uint8Array;
    /** Message type */
    messageType: MessageType;
    /** Custom message type value (for Custom type) */
    customValue?: number;
}
/**
 * Options for creating a channel
 */
export interface CreateChannelOptions {
    /** Channel name */
    name: string;
    /** Channel description */
    description: string;
    /** Channel visibility */
    visibility: ChannelVisibility;
    /** Maximum participants */
    maxParticipants: number;
    /** Fee per message in lamports */
    feePerMessage: number;
}
/**
 * Options for depositing to escrow
 */
export interface DepositEscrowOptions {
    /** Channel public key */
    channel: PublicKey;
    /** Amount to deposit in lamports */
    amount: number;
}
/**
 * Options for withdrawing from escrow
 */
export interface WithdrawEscrowOptions {
    /** Channel public key */
    channel: PublicKey;
    /** Amount to withdraw in lamports */
    amount: number;
}
/**
 * Options for broadcasting a message to a channel
 */
export interface BroadcastMessageOptions {
    /** Channel public key */
    channelPDA: PublicKey;
    /** Message content */
    content: string;
    /** Message type (defaults to "Text") */
    messageType?: any;
    /** Optional reply-to message */
    replyTo?: PublicKey;
}
//# sourceMappingURL=types.d.ts.map