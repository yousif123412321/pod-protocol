import { Connection, } from "@solana/web3.js";
import anchor, { Program } from "@coral-xyz/anchor";
const { AnchorProvider } = anchor;
import { PROGRAM_ID, } from "./types";
import { IDL } from "./pod_com";
// Import services
import { BaseService } from "./services/base";
import { AgentService } from "./services/agent";
import { MessageService } from "./services/message";
/**
 * Channel-related operations service (placeholder for future implementation)
 */
class ChannelService extends BaseService {
    async createChannel(wallet, options) {
        throw new Error("Channel service not yet implemented");
    }
    async getChannel(channelPDA) {
        throw new Error("Channel service not yet implemented");
    }
    async getAllChannels(limit = 50, visibilityFilter) {
        throw new Error("Channel service not yet implemented");
    }
    async getChannelsByCreator(creator, limit = 50) {
        throw new Error("Channel service not yet implemented");
    }
    async joinChannel(wallet, channelPDA) {
        throw new Error("Channel service not yet implemented");
    }
    async leaveChannel(wallet, channelPDA) {
        throw new Error("Channel service not yet implemented");
    }
    async broadcastMessage(wallet, options) {
        throw new Error("Channel service not yet implemented");
    }
    async inviteToChannel(wallet, channelPDA, invitee) {
        throw new Error("Channel service not yet implemented");
    }
    async getChannelParticipants(channelPDA, limit = 50) {
        throw new Error("Channel service not yet implemented");
    }
    async getChannelMessages(channelPDA, limit = 50) {
        throw new Error("Channel service not yet implemented");
    }
}
/**
 * Escrow-related operations service (placeholder for future implementation)
 */
class EscrowService extends BaseService {
    async depositEscrow(wallet, options) {
        throw new Error("Escrow service not yet implemented");
    }
    async withdrawEscrow(wallet, options) {
        throw new Error("Escrow service not yet implemented");
    }
    async getEscrow(channel, depositor) {
        throw new Error("Escrow service not yet implemented");
    }
    async getEscrowsByDepositor(depositor, limit = 50) {
        throw new Error("Escrow service not yet implemented");
    }
}
/**
 * Main PoD Protocol SDK client for interacting with the protocol
 * Refactored to use service-based architecture for better maintainability
 */
export class PodComClient {
    constructor(config = {}) {
        this.connection = new Connection(config.endpoint ?? "https://api.devnet.solana.com", config.commitment ?? "confirmed");
        this.programId = config.programId ?? PROGRAM_ID;
        this.commitment = config.commitment ?? "confirmed";
        // Initialize services
        const serviceConfig = {
            connection: this.connection,
            programId: this.programId,
            commitment: this.commitment
        };
        this.agents = new AgentService(serviceConfig);
        this.messages = new MessageService(serviceConfig);
        this.channels = new ChannelService(serviceConfig);
        this.escrow = new EscrowService(serviceConfig);
    }
    /**
     * Initialize the Anchor program with a wallet (call this first)
     */
    async initialize(wallet) {
        try {
            if (wallet) {
                // If a wallet is provided, create the program with it
                const provider = new AnchorProvider(this.connection, wallet, {
                    commitment: this.commitment,
                    skipPreflight: true,
                });
                // Validate IDL before creating program
                if (!IDL) {
                    throw new Error("IDL not found. Ensure the program IDL is properly generated and imported.");
                }
                this.program = new Program(IDL, provider);
                // Validate program was created successfully
                if (!this.program) {
                    throw new Error("Failed to create Anchor program instance");
                }
                // Set program for all services
                this.agents.setProgram(this.program);
                this.messages.setProgram(this.program);
                this.channels.setProgram(this.program);
                this.escrow.setProgram(this.program);
            }
            else {
                // No wallet provided - validate IDL before setting on services
                if (!IDL) {
                    throw new Error("IDL not found. Ensure the program IDL is properly generated and imported.");
                }
                // Set IDL for all services
                this.agents.setIDL(IDL);
                this.messages.setIDL(IDL);
                this.channels.setIDL(IDL);
                this.escrow.setIDL(IDL);
            }
            // Validate initialization was successful
            if (!this.isInitialized()) {
                throw new Error("Client initialization failed - services not properly configured");
            }
        }
        catch (error) {
            throw new Error(`Client initialization failed: ${error.message}`);
        }
    }
    // ============================================================================
    // Legacy API Methods (for backward compatibility)
    // Delegate to appropriate services
    // ============================================================================
    /**
     * @deprecated Use client.agents.registerAgent() instead
     */
    async registerAgent(wallet, options) {
        return this.agents.registerAgent(wallet, options);
    }
    /**
     * @deprecated Use client.agents.updateAgent() instead
     */
    async updateAgent(wallet, options) {
        return this.agents.updateAgent(wallet, options);
    }
    /**
     * @deprecated Use client.agents.getAgent() instead
     */
    async getAgent(walletPublicKey) {
        return this.agents.getAgent(walletPublicKey);
    }
    /**
     * @deprecated Use client.agents.getAllAgents() instead
     */
    async getAllAgents(limit = 100) {
        return this.agents.getAllAgents(limit);
    }
    /**
     * @deprecated Use client.messages.sendMessage() instead
     */
    async sendMessage(wallet, options) {
        return this.messages.sendMessage(wallet, options);
    }
    /**
     * @deprecated Use client.messages.updateMessageStatus() instead
     */
    async updateMessageStatus(wallet, messagePDA, newStatus) {
        return this.messages.updateMessageStatus(wallet, messagePDA, newStatus);
    }
    /**
     * @deprecated Use client.messages.getMessage() instead
     */
    async getMessage(messagePDA) {
        return this.messages.getMessage(messagePDA);
    }
    /**
     * @deprecated Use client.messages.getAgentMessages() instead
     */
    async getAgentMessages(agentPublicKey, limit = 50, statusFilter) {
        return this.messages.getAgentMessages(agentPublicKey, limit, statusFilter);
    }
    /**
     * @deprecated Use client.channels.createChannel() instead
     */
    async createChannel(wallet, options) {
        return this.channels.createChannel(wallet, options);
    }
    /**
     * @deprecated Use client.channels.getChannel() instead
     */
    async getChannel(channelPDA) {
        return this.channels.getChannel(channelPDA);
    }
    /**
     * @deprecated Use client.channels.getAllChannels() instead
     */
    async getAllChannels(limit = 50, visibilityFilter) {
        return this.channels.getAllChannels(limit, visibilityFilter);
    }
    /**
     * @deprecated Use client.channels.getChannelsByCreator() instead
     */
    async getChannelsByCreator(creator, limit = 50) {
        return this.channels.getChannelsByCreator(creator, limit);
    }
    /**
     * @deprecated Use client.channels.joinChannel() instead
     */
    async joinChannel(wallet, channelPDA) {
        return this.channels.joinChannel(wallet, channelPDA);
    }
    /**
     * @deprecated Use client.channels.leaveChannel() instead
     */
    async leaveChannel(wallet, channelPDA) {
        return this.channels.leaveChannel(wallet, channelPDA);
    }
    /**
     * @deprecated Use client.channels.broadcastMessage() instead
     */
    async broadcastMessage(wallet, channelPDA, content, messageType = "Text", replyTo) {
        return this.channels.broadcastMessage(wallet, {
            channelPDA,
            content,
            messageType,
            replyTo
        });
    }
    /**
     * @deprecated Use client.channels.inviteToChannel() instead
     */
    async inviteToChannel(wallet, channelPDA, invitee) {
        return this.channels.inviteToChannel(wallet, channelPDA, invitee);
    }
    /**
     * @deprecated Use client.channels.getChannelParticipants() instead
     */
    async getChannelParticipants(channelPDA, limit = 50) {
        return this.channels.getChannelParticipants(channelPDA, limit);
    }
    /**
     * @deprecated Use client.channels.getChannelMessages() instead
     */
    async getChannelMessages(channelPDA, limit = 50) {
        return this.channels.getChannelMessages(channelPDA, limit);
    }
    /**
     * @deprecated Use client.escrow.depositEscrow() instead
     */
    async depositEscrow(wallet, options) {
        return this.escrow.depositEscrow(wallet, options);
    }
    /**
     * @deprecated Use client.escrow.withdrawEscrow() instead
     */
    async withdrawEscrow(wallet, options) {
        return this.escrow.withdrawEscrow(wallet, options);
    }
    /**
     * @deprecated Use client.escrow.getEscrow() instead
     */
    async getEscrow(channel, depositor) {
        return this.escrow.getEscrow(channel, depositor);
    }
    /**
     * @deprecated Use client.escrow.getEscrowsByDepositor() instead
     */
    async getEscrowsByDepositor(depositor, limit = 50) {
        return this.escrow.getEscrowsByDepositor(depositor, limit);
    }
    // ============================================================================
    // Utility Methods
    // ============================================================================
    /**
     * Get the connection instance
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get the program ID
     */
    getProgramId() {
        return this.programId;
    }
    /**
     * Get the commitment level
     */
    getCommitment() {
        return this.commitment;
    }
    /**
     * Check if the client is initialized
     */
    isInitialized() {
        // For wallet-based initialization, check if program is set
        if (this.program) {
            return true;
        }
        // For read-only initialization, check if services have IDL set
        return this.agents.hasIDL() && this.messages.hasIDL() && this.channels.hasIDL() && this.escrow.hasIDL();
    }
}
