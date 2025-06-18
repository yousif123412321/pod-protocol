import { Connection, PublicKey, Signer, Commitment } from "@solana/web3.js";
import { PodComConfig, AgentAccount, MessageAccount, ChannelAccount, EscrowAccount, CreateAgentOptions, UpdateAgentOptions, SendMessageOptions, CreateChannelOptions, DepositEscrowOptions, WithdrawEscrowOptions, BroadcastMessageOptions, MessageStatus, ChannelVisibility } from "./types";
import { BaseService } from "./services/base";
import { AgentService } from "./services/agent";
import { MessageService } from "./services/message";
/**
 * Channel-related operations service (placeholder for future implementation)
 */
declare class ChannelService extends BaseService {
    createChannel(wallet: Signer, options: CreateChannelOptions): Promise<string>;
    getChannel(channelPDA: PublicKey): Promise<ChannelAccount | null>;
    getAllChannels(limit?: number, visibilityFilter?: ChannelVisibility): Promise<ChannelAccount[]>;
    getChannelsByCreator(creator: PublicKey, limit?: number): Promise<ChannelAccount[]>;
    joinChannel(wallet: Signer, channelPDA: PublicKey): Promise<string>;
    leaveChannel(wallet: Signer, channelPDA: PublicKey): Promise<string>;
    broadcastMessage(wallet: Signer, options: BroadcastMessageOptions): Promise<string>;
    inviteToChannel(wallet: Signer, channelPDA: PublicKey, invitee: PublicKey): Promise<string>;
    getChannelParticipants(channelPDA: PublicKey, limit?: number): Promise<Array<any>>;
    getChannelMessages(channelPDA: PublicKey, limit?: number): Promise<Array<any>>;
}
/**
 * Escrow-related operations service (placeholder for future implementation)
 */
declare class EscrowService extends BaseService {
    depositEscrow(wallet: Signer, options: DepositEscrowOptions): Promise<string>;
    withdrawEscrow(wallet: Signer, options: WithdrawEscrowOptions): Promise<string>;
    getEscrow(channel: PublicKey, depositor: PublicKey): Promise<EscrowAccount | null>;
    getEscrowsByDepositor(depositor: PublicKey, limit?: number): Promise<EscrowAccount[]>;
}
/**
 * Main PoD Protocol SDK client for interacting with the protocol
 * Refactored to use service-based architecture for better maintainability
 */
export declare class PodComClient {
    private connection;
    private programId;
    private commitment;
    private program?;
    agents: AgentService;
    messages: MessageService;
    channels: ChannelService;
    escrow: EscrowService;
    constructor(config?: PodComConfig);
    /**
     * Initialize the Anchor program with a wallet (call this first)
     */
    initialize(wallet?: any): Promise<void>;
    /**
     * @deprecated Use client.agents.registerAgent() instead
     */
    registerAgent(wallet: Signer, options: CreateAgentOptions): Promise<string>;
    /**
     * @deprecated Use client.agents.updateAgent() instead
     */
    updateAgent(wallet: Signer, options: UpdateAgentOptions): Promise<string>;
    /**
     * @deprecated Use client.agents.getAgent() instead
     */
    getAgent(walletPublicKey: PublicKey): Promise<AgentAccount | null>;
    /**
     * @deprecated Use client.agents.getAllAgents() instead
     */
    getAllAgents(limit?: number): Promise<AgentAccount[]>;
    /**
     * @deprecated Use client.messages.sendMessage() instead
     */
    sendMessage(wallet: Signer, options: SendMessageOptions): Promise<string>;
    /**
     * @deprecated Use client.messages.updateMessageStatus() instead
     */
    updateMessageStatus(wallet: Signer, messagePDA: PublicKey, newStatus: MessageStatus): Promise<string>;
    /**
     * @deprecated Use client.messages.getMessage() instead
     */
    getMessage(messagePDA: PublicKey): Promise<MessageAccount | null>;
    /**
     * @deprecated Use client.messages.getAgentMessages() instead
     */
    getAgentMessages(agentPublicKey: PublicKey, limit?: number, statusFilter?: MessageStatus): Promise<MessageAccount[]>;
    /**
     * @deprecated Use client.channels.createChannel() instead
     */
    createChannel(wallet: Signer, options: CreateChannelOptions): Promise<string>;
    /**
     * @deprecated Use client.channels.getChannel() instead
     */
    getChannel(channelPDA: PublicKey): Promise<ChannelAccount | null>;
    /**
     * @deprecated Use client.channels.getAllChannels() instead
     */
    getAllChannels(limit?: number, visibilityFilter?: ChannelVisibility): Promise<ChannelAccount[]>;
    /**
     * @deprecated Use client.channels.getChannelsByCreator() instead
     */
    getChannelsByCreator(creator: PublicKey, limit?: number): Promise<ChannelAccount[]>;
    /**
     * @deprecated Use client.channels.joinChannel() instead
     */
    joinChannel(wallet: Signer, channelPDA: PublicKey): Promise<string>;
    /**
     * @deprecated Use client.channels.leaveChannel() instead
     */
    leaveChannel(wallet: Signer, channelPDA: PublicKey): Promise<string>;
    /**
     * @deprecated Use client.channels.broadcastMessage() instead
     */
    broadcastMessage(wallet: Signer, channelPDA: PublicKey, content: string, messageType?: any, replyTo?: PublicKey): Promise<string>;
    /**
     * @deprecated Use client.channels.inviteToChannel() instead
     */
    inviteToChannel(wallet: Signer, channelPDA: PublicKey, invitee: PublicKey): Promise<string>;
    /**
     * @deprecated Use client.channels.getChannelParticipants() instead
     */
    getChannelParticipants(channelPDA: PublicKey, limit?: number): Promise<Array<any>>;
    /**
     * @deprecated Use client.channels.getChannelMessages() instead
     */
    getChannelMessages(channelPDA: PublicKey, limit?: number): Promise<Array<any>>;
    /**
     * @deprecated Use client.escrow.depositEscrow() instead
     */
    depositEscrow(wallet: Signer, options: DepositEscrowOptions): Promise<string>;
    /**
     * @deprecated Use client.escrow.withdrawEscrow() instead
     */
    withdrawEscrow(wallet: Signer, options: WithdrawEscrowOptions): Promise<string>;
    /**
     * @deprecated Use client.escrow.getEscrow() instead
     */
    getEscrow(channel: PublicKey, depositor: PublicKey): Promise<EscrowAccount | null>;
    /**
     * @deprecated Use client.escrow.getEscrowsByDepositor() instead
     */
    getEscrowsByDepositor(depositor: PublicKey, limit?: number): Promise<EscrowAccount[]>;
    /**
     * Get the connection instance
     */
    getConnection(): Connection;
    /**
     * Get the program ID
     */
    getProgramId(): PublicKey;
    /**
     * Get the commitment level
     */
    getCommitment(): Commitment;
    /**
     * Check if the client is initialized
     */
    isInitialized(): boolean;
}
export {};
//# sourceMappingURL=client.d.ts.map