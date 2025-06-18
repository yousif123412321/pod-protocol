import {
  Connection,
  PublicKey,
  Signer,
  Commitment,
} from "@solana/web3.js";
import anchor, { Program, AnchorProvider } from "@coral-xyz/anchor";
import {
  PROGRAM_ID,
  PodComConfig,
  AgentAccount,
  MessageAccount,
  ChannelAccount,
  EscrowAccount,
  CreateAgentOptions,
  UpdateAgentOptions,
  SendMessageOptions,
  CreateChannelOptions,
  DepositEscrowOptions,
  WithdrawEscrowOptions,
  BroadcastMessageOptions,
  MessageStatus,
  ChannelVisibility,
} from "./types";
import { PodCom, IDL } from "./pod_com";
import type { IdlAccounts } from "@coral-xyz/anchor";

// Import services
import { BaseService, BaseServiceConfig } from "./services/base";
import { AgentService } from "./services/agent";
import { MessageService } from "./services/message";

/**
 * Channel-related operations service (placeholder for future implementation)
 */
class ChannelService extends BaseService {
  async createChannel(_wallet: Signer, _options: CreateChannelOptions): Promise<string> {
    throw new Error("Channel service not yet implemented");
  }

  async getChannel(_channelPDA: PublicKey): Promise<ChannelAccount | null> {
    throw new Error("Channel service not yet implemented");
  }

  async getAllChannels(
    _limit: number = 50,
    _visibilityFilter?: ChannelVisibility
  ): Promise<ChannelAccount[]> {
    throw new Error("Channel service not yet implemented");
  }

  async getChannelsByCreator(
    _creator: PublicKey,
    _limit: number = 50
  ): Promise<ChannelAccount[]> {
    throw new Error("Channel service not yet implemented");
  }

  async joinChannel(_wallet: Signer, _channelPDA: PublicKey): Promise<string> {
    throw new Error("Channel service not yet implemented");
  }

  async leaveChannel(_wallet: Signer, _channelPDA: PublicKey): Promise<string> {
    throw new Error("Channel service not yet implemented");
  }

  async broadcastMessage(_wallet: Signer, _options: BroadcastMessageOptions): Promise<string> {
    throw new Error("Channel service not yet implemented");
  }

  async inviteToChannel(
    _wallet: Signer,
    _channelPDA: PublicKey,
    _invitee: PublicKey
  ): Promise<string> {
    throw new Error("Channel service not yet implemented");
  }

  async getChannelParticipants(
    _channelPDA: PublicKey,
    _limit: number = 50
  ): Promise<Array<IdlAccounts<PodCom>>> {
    throw new Error("Channel service not yet implemented");
  }

  async getChannelMessages(
    _channelPDA: PublicKey,
    _limit: number = 50
  ): Promise<Array<IdlAccounts<PodCom>>> {
    throw new Error("Channel service not yet implemented");
  }
}

/**
 * Escrow-related operations service (placeholder for future implementation)
 */
class EscrowService extends BaseService {
  async depositEscrow(_wallet: Signer, _options: DepositEscrowOptions): Promise<string> {
    throw new Error("Escrow service not yet implemented");
  }

  async withdrawEscrow(_wallet: Signer, _options: WithdrawEscrowOptions): Promise<string> {
    throw new Error("Escrow service not yet implemented");
  }

  async getEscrow(
    _channel: PublicKey,
    _depositor: PublicKey
  ): Promise<EscrowAccount | null> {
    throw new Error("Escrow service not yet implemented");
  }

  async getEscrowsByDepositor(
    _depositor: PublicKey,
    _limit: number = 50
  ): Promise<EscrowAccount[]> {
    throw new Error("Escrow service not yet implemented");
  }
}

/**
 * Main PoD Protocol SDK client for interacting with the protocol
 * Refactored to use service-based architecture for better maintainability
 */
export class PodComClient {
  private connection: Connection;
  private programId: PublicKey;
  private commitment: Commitment;
  private program?: Program<PodCom>;

  // Service instances - public for direct access to specific functionality
  public agents: AgentService;
  public messages: MessageService;
  public channels: ChannelService;
  public escrow: EscrowService;

  constructor(config: PodComConfig = {}) {
    this.connection = new Connection(
      config.endpoint ?? "https://api.devnet.solana.com",
      config.commitment ?? "confirmed"
    );
    this.programId = config.programId ?? PROGRAM_ID;
    this.commitment = config.commitment ?? "confirmed";

    // Initialize services
    const serviceConfig: BaseServiceConfig = {
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
  async initialize(wallet?: anchor.Wallet): Promise<void> {
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
        
        this.program = new Program(IDL, provider) as Program<PodCom>;
        
        // Validate program was created successfully
        if (!this.program) {
          throw new Error("Failed to create Anchor program instance");
        }
        
        // Set program for all services
        this.agents.setProgram(this.program);
        this.messages.setProgram(this.program);
        this.channels.setProgram(this.program);
        this.escrow.setProgram(this.program);
      } else {
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
      
    } catch (error: Error) {
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
  async registerAgent(wallet: Signer, options: CreateAgentOptions): Promise<string> {
    return this.agents.registerAgent(wallet, options);
  }

  /**
   * @deprecated Use client.agents.updateAgent() instead
   */
  async updateAgent(wallet: Signer, options: UpdateAgentOptions): Promise<string> {
    return this.agents.updateAgent(wallet, options);
  }

  /**
   * @deprecated Use client.agents.getAgent() instead
   */
  async getAgent(walletPublicKey: PublicKey): Promise<AgentAccount | null> {
    return this.agents.getAgent(walletPublicKey);
  }

  /**
   * @deprecated Use client.agents.getAllAgents() instead
   */
  async getAllAgents(limit: number = 100): Promise<AgentAccount[]> {
    return this.agents.getAllAgents(limit);
  }

  /**
   * @deprecated Use client.messages.sendMessage() instead
   */
<<<<<<< HEAD
  async sendMessage(
    wallet: Signer,
    options: SendMessageOptions
  ): Promise<string> {
    const [senderAgentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    // Hash the payload
    const payloadHash = await hashPayload(options.payload);

    const messageTypeObj = this.convertMessageType(
      options.messageType,
      options.customValue
    );

    const [messagePDA] = findMessagePDA(
      senderAgentPDA,
      options.recipient,
      payloadHash,
      messageTypeObj,
      this.programId
    );

    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .sendMessage(
          options.recipient,
          Array.from(payloadHash),
          messageTypeObj
        )
        .accounts({
          messageAccount: messagePDA,
          senderAgent: senderAgentPDA,
          signer: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
=======
  async sendMessage(wallet: Signer, options: SendMessageOptions): Promise<string> {
    return this.messages.sendMessage(wallet, options);
>>>>>>> df85d1e44491e4c3e436028282199d5d8626be9c
  }

  /**
   * @deprecated Use client.messages.updateMessageStatus() instead
   */
  async updateMessageStatus(
    wallet: Signer,
    messagePDA: PublicKey,
    newStatus: MessageStatus
  ): Promise<string> {
    return this.messages.updateMessageStatus(wallet, messagePDA, newStatus);
  }

  /**
   * @deprecated Use client.messages.getMessage() instead
   */
  async getMessage(messagePDA: PublicKey): Promise<MessageAccount | null> {
    return this.messages.getMessage(messagePDA);
  }

  /**
   * @deprecated Use client.messages.getAgentMessages() instead
   */
  async getAgentMessages(
    agentPublicKey: PublicKey,
    limit: number = 50,
    statusFilter?: MessageStatus
  ): Promise<MessageAccount[]> {
    return this.messages.getAgentMessages(agentPublicKey, limit, statusFilter);
  }

  /**
   * @deprecated Use client.channels.createChannel() instead
   */
  async createChannel(wallet: Signer, options: CreateChannelOptions): Promise<string> {
    return this.channels.createChannel(wallet, options);
  }

  /**
   * @deprecated Use client.channels.getChannel() instead
   */
  async getChannel(channelPDA: PublicKey): Promise<ChannelAccount | null> {
    return this.channels.getChannel(channelPDA);
  }

  /**
   * @deprecated Use client.channels.getAllChannels() instead
   */
  async getAllChannels(
    limit: number = 50,
    visibilityFilter?: ChannelVisibility
  ): Promise<ChannelAccount[]> {
    return this.channels.getAllChannels(limit, visibilityFilter);
  }

  /**
   * @deprecated Use client.channels.getChannelsByCreator() instead
   */
  async getChannelsByCreator(
    creator: PublicKey,
    limit: number = 50
  ): Promise<ChannelAccount[]> {
    return this.channels.getChannelsByCreator(creator, limit);
  }

  /**
   * @deprecated Use client.channels.joinChannel() instead
   */
  async joinChannel(wallet: Signer, channelPDA: PublicKey): Promise<string> {
<<<<<<< HEAD
    // Derive agent PDA
    const [agentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    // Derive participant PDA
    const [participantPDA] = this.findParticipantPDA(
      channelPDA,
      wallet.publicKey
    );

    // Check if channel requires invitation (for private channels)
    const [invitationPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("invitation"),
        channelPDA.toBuffer(),
        wallet.publicKey.toBuffer(),
      ],
      this.programId
    );

    // Check if invitation exists
    let invitationAccount: any = null;
    try {
      invitationAccount = await this.getAccount("channelInvitation").fetch(
        invitationPDA
      );
    } catch (error) {
      // Invitation doesn't exist, which is fine for public channels
    }

    const methods = this.getProgramMethods();
    const tx = await methods
      .joinChannel()
      .accounts({
        channelAccount: channelPDA,
        participantAccount: participantPDA,
        agentAccount: agentPDA,
        invitationAccount: invitationAccount ? invitationPDA : null,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    return tx;
=======
    return this.channels.joinChannel(wallet, channelPDA);
>>>>>>> df85d1e44491e4c3e436028282199d5d8626be9c
  }

  /**
   * @deprecated Use client.channels.leaveChannel() instead
   */
  async leaveChannel(wallet: Signer, channelPDA: PublicKey): Promise<string> {
<<<<<<< HEAD
    // Derive agent PDA
    const [agentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    // Derive participant PDA
    const [participantPDA] = this.findParticipantPDA(
      channelPDA,
      wallet.publicKey
    );

    const methods = this.getProgramMethods();
    const tx = await methods
      .leaveChannel()
      .accounts({
        channelAccount: channelPDA,
        participantAccount: participantPDA,
        agentAccount: agentPDA,
        user: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();

    return tx;
=======
    return this.channels.leaveChannel(wallet, channelPDA);
>>>>>>> df85d1e44491e4c3e436028282199d5d8626be9c
  }

  /**
   * @deprecated Use client.channels.broadcastMessage() instead
   */
  async broadcastMessage(
    wallet: Signer,
    channelPDA: PublicKey,
    content: string,
    messageType: string = "Text",
    replyTo?: PublicKey
  ): Promise<string> {
<<<<<<< HEAD
    const program = this.ensureInitialized();

    // Generate unique nonce for message
    const nonce = Date.now();

    // Derive agent PDA
    const [agentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    // Derive participant PDA
    const [participantPDA] = this.findParticipantPDA(
      channelPDA,
      wallet.publicKey
    );

    // Derive message PDA
    const nonceBuffer = Buffer.alloc(8);
    nonceBuffer.writeBigUInt64LE(BigInt(nonce), 0);

    const [messagePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("channel_message"),
        channelPDA.toBuffer(),
        wallet.publicKey.toBuffer(),
        nonceBuffer,
      ],
      this.programId
    );

    const methods = this.getProgramMethods();
    const tx = await methods
      .broadcastMessage(
        content,
        this.convertMessageType(messageType),
        replyTo || null,
        new anchor.BN(nonce)
      )
      .accounts({
        channelAccount: channelPDA,
        participantAccount: participantPDA,
        agentAccount: agentPDA,
        messageAccount: messagePDA,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    return tx;
=======
    return this.channels.broadcastMessage(wallet, {
      channelPDA,
      content,
      messageType,
      replyTo
    });
>>>>>>> df85d1e44491e4c3e436028282199d5d8626be9c
  }

  /**
   * @deprecated Use client.channels.inviteToChannel() instead
   */
  async inviteToChannel(
    wallet: Signer,
    channelPDA: PublicKey,
    invitee: PublicKey
  ): Promise<string> {
<<<<<<< HEAD
    // Derive agent PDA
    const [agentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    // Derive participant PDA (for inviter)
    const [participantPDA] = this.findParticipantPDA(
      channelPDA,
      wallet.publicKey
    );

    // Derive invitation PDA
    const [invitationPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("invitation"), channelPDA.toBuffer(), invitee.toBuffer()],
      this.programId
    );

    const methods = this.getProgramMethods();
    const tx = await methods
      .inviteToChannel(invitee)
      .accounts({
        channelAccount: channelPDA,
        participantAccount: participantPDA,
        agentAccount: agentPDA,
        invitationAccount: invitationPDA,
        inviter: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    return tx;
=======
    return this.channels.inviteToChannel(wallet, channelPDA, invitee);
>>>>>>> df85d1e44491e4c3e436028282199d5d8626be9c
  }

  /**
   * @deprecated Use client.channels.getChannelParticipants() instead
   */
  async getChannelParticipants(
    channelPDA: PublicKey,
    limit: number = 50
  ): Promise<Array<IdlAccounts<PodCom>>> {
    return this.channels.getChannelParticipants(channelPDA, limit);
  }

  /**
   * @deprecated Use client.channels.getChannelMessages() instead
   */
  async getChannelMessages(
    channelPDA: PublicKey,
    limit: number = 50
  ): Promise<Array<IdlAccounts<PodCom>>> {
    return this.channels.getChannelMessages(channelPDA, limit);
  }

  /**
   * @deprecated Use client.escrow.depositEscrow() instead
   */
  async depositEscrow(wallet: Signer, options: DepositEscrowOptions): Promise<string> {
    return this.escrow.depositEscrow(wallet, options);
  }

  /**
   * @deprecated Use client.escrow.withdrawEscrow() instead
   */
  async withdrawEscrow(wallet: Signer, options: WithdrawEscrowOptions): Promise<string> {
    return this.escrow.withdrawEscrow(wallet, options);
  }

  /**
   * @deprecated Use client.escrow.getEscrow() instead
   */
  async getEscrow(
    channel: PublicKey,
    depositor: PublicKey
  ): Promise<EscrowAccount | null> {
    return this.escrow.getEscrow(channel, depositor);
  }

  /**
   * @deprecated Use client.escrow.getEscrowsByDepositor() instead
   */
  async getEscrowsByDepositor(
    depositor: PublicKey,
    limit: number = 50
  ): Promise<EscrowAccount[]> {
    return this.escrow.getEscrowsByDepositor(depositor, limit);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get the connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get the program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Get the commitment level
   */
  getCommitment(): Commitment {
    return this.commitment;
  }

  /**
   * Check if the client is initialized
   */
  isInitialized(): boolean {
    // For wallet-based initialization, check if program is set
    if (this.program) {
      return true;
    }
    
    // For read-only initialization, check if services have IDL set
    return this.agents.hasIDL() && this.messages.hasIDL() && this.channels.hasIDL() && this.escrow.hasIDL();
  }
<<<<<<< HEAD

  // ============================================================================
  // Helper Methods for Type Conversion
  // ============================================================================

  private convertMessageType(
    messageType: MessageType,
    customValue?: number
  ): any {
    return convertMessageTypeToProgram(messageType, customValue);
  }

  private convertMessageTypeFromProgram(programType: any): MessageType {
    return convertMessageTypeFromProgram(programType).type;
  }

  private convertMessageStatus(status: MessageStatus): any {
    switch (status) {
      case MessageStatus.Pending:
        return { pending: {} };
      case MessageStatus.Delivered:
        return { delivered: {} };
      case MessageStatus.Read:
        return { read: {} };
      case MessageStatus.Failed:
        return { failed: {} };
      default:
        return { pending: {} };
    }
  }

  private convertMessageStatusFromProgram(programStatus: any): MessageStatus {
    if (programStatus.pending !== undefined) return MessageStatus.Pending;
    if (programStatus.delivered !== undefined) return MessageStatus.Delivered;
    if (programStatus.read !== undefined) return MessageStatus.Read;
    if (programStatus.failed !== undefined) return MessageStatus.Failed;
    return MessageStatus.Pending;
  }

  private convertChannelVisibility(visibility: ChannelVisibility): any {
    switch (visibility) {
      case ChannelVisibility.Public:
        return { public: {} };
      case ChannelVisibility.Private:
        return { private: {} };
      default:
        return { public: {} };
    }
  }

  private convertChannelVisibilityFromProgram(
    programVisibility: any
  ): ChannelVisibility {
    if (programVisibility.public !== undefined) return ChannelVisibility.Public;
    if (programVisibility.private !== undefined)
      return ChannelVisibility.Private;
    return ChannelVisibility.Public;
  }

  // ============================================================================
  // Helper Methods for Account Conversion
  // ============================================================================

  private convertChannelAccountFromProgram(
    account: any,
    publicKey: PublicKey
  ): ChannelAccount {
    return {
      pubkey: publicKey,
      creator: account.creator,
      name: account.name,
      description: account.description,
      visibility: this.convertChannelVisibilityFromProgram(account.visibility),
      maxParticipants: account.maxParticipants,
      participantCount: account.currentParticipants,
      currentParticipants: account.currentParticipants,
      feePerMessage: account.feePerMessage.toNumber(),
      escrowBalance: account.escrowBalance.toNumber(),
      createdAt: account.createdAt.toNumber(),
      isActive: true,
      bump: account.bump,
    };
  }

  private convertMessageAccountFromProgram(
    account: any,
    publicKey: PublicKey
  ): MessageAccount {
    return {
      pubkey: publicKey,
      sender: account.sender,
      recipient: account.recipient,
      payloadHash: new Uint8Array(account.payloadHash),
      payload: "",
      messageType: this.convertMessageTypeFromProgram(account.messageType),
      timestamp: account.createdAt.toNumber(),
      createdAt: account.createdAt.toNumber(),
      expiresAt: account.expiresAt.toNumber(),
      status: this.convertMessageStatusFromProgram(account.status),
      bump: account.bump,
    };
  }

  private findParticipantPDA(
    channelPDA: PublicKey,
    userPublicKey: PublicKey
  ): [PublicKey, number] {
    // Use agent PDA instead of user wallet for participant PDA
    const [agentPDA] = findAgentPDA(userPublicKey, this.programId);
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("participant"),
        channelPDA.toBuffer(),
        agentPDA.toBuffer(),
      ],
      this.programId
    );
  }
}
=======
} 
>>>>>>> df85d1e44491e4c3e436028282199d5d8626be9c
