import {
  Connection,
  PublicKey,
  Signer,
  Commitment,
  GetProgramAccountsFilter,
  SystemProgram,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN, Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
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
  MessageType,
  MessageStatus,
  ChannelVisibility,
} from "./types";
import {
  findAgentPDA,
  findMessagePDA,
  findChannelPDA,
  findEscrowPDA,
  hashPayload,
  getMessageTypeId,
  convertMessageTypeToProgram,
  convertMessageTypeFromProgram,
  retry,
} from "./utils";
import { PodCom, IDL } from "./pod_com";

// Type definitions for program accounts
type ProgramAccounts = {
  agentAccount: any;
  messageAccount: any;
  channelAccount: any;
  channelParticipant: any;
  channelMessage: any;
  channelInvitation: any;
  escrowAccount: any;
};

/**
 * Main PoD Protocol SDK client for interacting with the protocol
 */
export class PodComClient {
  private connection: Connection;
  private programId: PublicKey;
  private commitment: Commitment;
  private program?: Program<any>;

  constructor(config: PodComConfig = {}) {
    this.connection = new Connection(
      config.endpoint ?? "https://api.devnet.solana.com",
      config.commitment ?? "confirmed"
    );
    this.programId = config.programId ?? PROGRAM_ID;
    this.commitment = config.commitment ?? "confirmed";
  }

  /**
   * Initialize the Anchor program (call this first)
   */
  async initialize(): Promise<void> {
    // Create a dummy wallet for the provider (transactions will use actual signers)
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => {
        throw new Error("Use actual signer");
      },
      signAllTransactions: async () => {
        throw new Error("Use actual signer");
      },
    };

    const provider = new AnchorProvider(this.connection, dummyWallet, {
      commitment: this.commitment,
    });

    this.program = new Program(IDL as any, provider) as Program<any>;
  }

  private ensureInitialized(): Program<any> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }
    return this.program;
  }

  // Helper method to safely access account methods
  private getAccount(accountName: string) {
    const program = this.ensureInitialized();
    return (program.account as any)[accountName];
  }

  // Helper function to safely handle program methods with type assertion
  private getProgramMethods() {
    const program = this.ensureInitialized();
    return program.methods as any;
  }

  // ============================================================================
  // Agent Operations
  // ============================================================================

  /**
   * Register a new agent on the PoD Protocol
   */
  async registerAgent(
    wallet: Signer,
    options: CreateAgentOptions
  ): Promise<string> {
    const [agentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .registerAgent(new BN(options.capabilities), options.metadataUri)
        .accounts({
          agentAccount: agentPDA,
          wallet: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
  }

  /**
   * Update an existing agent
   */
  async updateAgent(
    wallet: Signer,
    options: UpdateAgentOptions
  ): Promise<string> {
    const [agentPDA] = findAgentPDA(wallet.publicKey, this.programId);

    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .updateAgent(
          options.capabilities !== undefined
            ? new BN(options.capabilities)
            : null,
          options.metadataUri !== undefined ? options.metadataUri : null
        )
        .accounts({
          agentAccount: agentPDA,
          wallet: wallet.publicKey,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
  }

  /**
   * Get agent account data
   */
  async getAgent(walletPublicKey: PublicKey): Promise<AgentAccount | null> {
    const [agentPDA] = findAgentPDA(walletPublicKey, this.programId);

    try {
      const account = await this.getAccount("agentAccount").fetch(agentPDA);
      return {
        pubkey: agentPDA,
        capabilities: account.capabilities.toNumber(),
        metadataUri: account.metadataUri,
        reputation: account.reputation?.toNumber() || 0,
        lastUpdated: account.lastUpdated?.toNumber() || account.updatedAt?.toNumber() || Date.now(),
        bump: account.bump,
      };
    } catch (error: any) {
      if (error?.message?.includes("Account does not exist")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all registered agents
   */
  async getAllAgents(limit: number = 100): Promise<AgentAccount[]> {
    try {
      const accounts = await this.getAccount("agentAccount").all();

      return accounts
        .slice(0, limit)
        .map(({ account, publicKey }: { account: any; publicKey: any }) => ({
          pubkey: publicKey,
          capabilities: account.capabilities.toNumber(),
          metadataUri: account.metadataUri,
          reputation: account.reputation?.toNumber() || 0,
          lastUpdated: account.lastUpdated?.toNumber() || account.updatedAt?.toNumber() || Date.now(),
          bump: account.bump,
        }));
    } catch (error) {
      console.warn("Failed to fetch agents:", error);
      return [];
    }
  }

  // ============================================================================
  // Message Operations
  // ============================================================================

  /**
   * Send a message to another agent
   */
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
          options.payload,
          messageTypeObj,
          null // replyTo - not in current SendMessageOptions
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
  }

  /**
   * Update message status
   */
  async updateMessageStatus(
    wallet: Signer,
    messagePDA: PublicKey,
    newStatus: MessageStatus
  ): Promise<string> {
    const statusObj = this.convertMessageStatus(newStatus);

    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .updateMessageStatus(statusObj)
        .accounts({
          messageAccount: messagePDA,
          signer: wallet.publicKey,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
  }

  /**
   * Get message account data
   */
  async getMessage(messagePDA: PublicKey): Promise<MessageAccount | null> {
    try {
      const account = await this.getAccount("messageAccount").fetch(messagePDA);
      return this.convertMessageAccountFromProgram(account, messagePDA);
    } catch (error: any) {
      if (error?.message?.includes("Account does not exist")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get messages for an agent
   */
  async getAgentMessages(
    agentPublicKey: PublicKey,
    limit: number = 50,
    statusFilter?: MessageStatus
  ): Promise<MessageAccount[]> {
    try {
      const filters: GetProgramAccountsFilter[] = [];

      // Add filter for sender or recipient (would need custom implementation)
      // For now, get all messages and filter client-side
      const accounts = await this.getAccount("messageAccount").all();

      let filteredAccounts = accounts.filter(
        ({ account }: { account: any }) =>
          account.sender.equals(agentPublicKey) ||
          account.recipient.equals(agentPublicKey)
      );

      if (statusFilter) {
        const statusObj = this.convertMessageStatus(statusFilter);
        filteredAccounts = filteredAccounts.filter(
          ({ account }: { account: any }) =>
            JSON.stringify(account.status) === JSON.stringify(statusObj)
        );
      }

      return filteredAccounts
        .slice(0, limit)
        .map(({ account, publicKey }: { account: any; publicKey: any }) =>
          this.convertMessageAccountFromProgram(account, publicKey)
        );
    } catch (error) {
      console.warn("Failed to fetch messages:", error);
      return [];
    }
  }

  // ============================================================================
  // Channel Operations
  // ============================================================================

  /**
   * Create a new communication channel
   */
  async createChannel(
    wallet: Signer,
    options: CreateChannelOptions
  ): Promise<string> {
    const [channelPDA] = findChannelPDA(
      wallet.publicKey,
      options.name,
      this.programId
    );

    const visibilityObj = this.convertChannelVisibility(options.visibility);

    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .createChannel(
          options.name,
          options.description,
          visibilityObj,
          options.maxParticipants,
          new BN(options.feePerMessage)
        )
        .accounts({
          channelAccount: channelPDA,
          creator: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
  }

  /**
   * Get channel account data
   */
  async getChannel(channelPDA: PublicKey): Promise<ChannelAccount | null> {
    try {
      const account = await this.getAccount("channelAccount").fetch(channelPDA);
      return this.convertChannelAccountFromProgram(account, channelPDA);
    } catch (error: any) {
      if (error?.message?.includes("Account does not exist")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all channels
   */
  async getAllChannels(
    limit: number = 50,
    visibilityFilter?: ChannelVisibility
  ): Promise<ChannelAccount[]> {
    try {
      const accounts = await this.getAccount("channelAccount").all();

      let filteredAccounts = accounts;
      if (visibilityFilter) {
        const visibilityObj = this.convertChannelVisibility(visibilityFilter);
        filteredAccounts = accounts.filter(
          ({ account }: { account: any }) =>
            JSON.stringify(account.visibility) === JSON.stringify(visibilityObj)
        );
      }

      return filteredAccounts
        .slice(0, limit)
        .map(({ account, publicKey }: { account: any; publicKey: any }) =>
          this.convertChannelAccountFromProgram(account, publicKey)
        );
    } catch (error) {
      console.warn("Failed to fetch channels:", error);
      return [];
    }
  }

  /**
   * Get channels created by a specific user
   */
  async getChannelsByCreator(
    creator: PublicKey,
    limit: number = 50
  ): Promise<ChannelAccount[]> {
    try {
      const accounts = await this.getAccount("channelAccount").all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: creator.toBase58(),
          },
        },
      ]);

      return accounts
        .slice(0, limit)
        .map(({ account, publicKey }: { account: any; publicKey: any }) =>
          this.convertChannelAccountFromProgram(account, publicKey)
        );
    } catch (error) {
      console.warn("Failed to fetch creator channels:", error);
      return [];
    }
  }

  /**
   * Join a channel
   */
  async joinChannel(wallet: Signer, channelPDA: PublicKey): Promise<string> {
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
        invitationAccount: invitationAccount ? invitationPDA : null,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    return tx;
  }

  /**
   * Leave a channel
   */
  async leaveChannel(wallet: Signer, channelPDA: PublicKey): Promise<string> {
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
        user: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();

    return tx;
  }

  /**
   * Broadcast a message to a channel
   */
  async broadcastMessage(
    wallet: Signer,
    channelPDA: PublicKey,
    content: string,
    messageType: MessageType = MessageType.Text,
    replyTo?: PublicKey
  ): Promise<string> {
    const program = this.ensureInitialized();

    // Generate unique nonce for message
    const nonce = Date.now();

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
        messageAccount: messagePDA,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    return tx;
  }

  /**
   * Invite a user to a private channel
   */
  async inviteToChannel(
    wallet: Signer,
    channelPDA: PublicKey,
    invitee: PublicKey
  ): Promise<string> {
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
        invitationAccount: invitationPDA,
        inviter: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    return tx;
  }

  /**
   * Get channel participants
   */
  async getChannelParticipants(
    channelPDA: PublicKey,
    limit: number = 50
  ): Promise<
    Array<{
      pubkey: PublicKey;
      channel: PublicKey;
      participant: PublicKey;
      joinedAt: number;
      isActive: boolean;
      messagesSent: number;
      lastMessageAt: number;
      bump: number;
    }>
  > {
    this.ensureInitialized();

    try {
      const accounts = await this.getAccount("channelParticipant").all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: channelPDA.toBase58(),
          },
        },
      ]);

      return accounts
        .slice(0, limit)
        .map(({ account, publicKey }: { account: any; publicKey: any }) => ({
          pubkey: publicKey,
          channel: account.channel,
          participant: account.participant,
          joinedAt: account.joinedAt.toNumber(),
          isActive: account.isActive,
          messagesSent: account.messagesSent.toNumber(),
          lastMessageAt: account.lastMessageAt.toNumber(),
          bump: account.bump,
        }));
    } catch (error) {
      console.warn("Failed to fetch channel participants:", error);
      return [];
    }
  }

  /**
   * Get channel messages
   */
  async getChannelMessages(
    channelPDA: PublicKey,
    limit: number = 50
  ): Promise<
    Array<{
      pubkey: PublicKey;
      channel: PublicKey;
      sender: PublicKey;
      content: string;
      messageType: MessageType;
      createdAt: number;
      editedAt: number | null;
      replyTo: PublicKey | null;
      bump: number;
    }>
  > {
    this.ensureInitialized();

    try {
      const accounts = await this.getAccount("channelMessage").all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: channelPDA.toBase58(),
          },
        },
      ]);

      return accounts
        .slice(0, limit)
        .map(({ account, publicKey }: { account: any; publicKey: any }) => ({
          pubkey: publicKey,
          channel: account.channel,
          sender: account.sender,
          content: account.content,
          messageType: this.convertMessageTypeFromProgram(account.messageType),
          createdAt: account.createdAt.toNumber(),
          editedAt: account.editedAt ? account.editedAt.toNumber() : null,
          replyTo: account.replyTo || null,
          bump: account.bump,
        }));
    } catch (error) {
      console.warn("Failed to fetch channel messages:", error);
      return [];
    }
  }

  // ============================================================================
  // Escrow Operations
  // ============================================================================

  /**
   * Deposit funds to channel escrow
   */
  async depositEscrow(
    wallet: Signer,
    options: DepositEscrowOptions
  ): Promise<string> {
    const [escrowPDA] = findEscrowPDA(
      options.channel,
      wallet.publicKey,
      this.programId
    );

    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .depositEscrow(new BN(options.amount))
        .accounts({
          escrowAccount: escrowPDA,
          channelAccount: options.channel,
          depositor: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
  }

  /**
   * Withdraw funds from channel escrow
   */
  async withdrawEscrow(
    wallet: Signer,
    options: WithdrawEscrowOptions
  ): Promise<string> {
    const [escrowPDA] = findEscrowPDA(
      options.channel,
      wallet.publicKey,
      this.programId
    );

    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .withdrawEscrow(new BN(options.amount))
        .accounts({
          escrowAccount: escrowPDA,
          channelAccount: options.channel,
          depositor: wallet.publicKey,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
  }

  /**
   * Get escrow account data
   */
  async getEscrow(
    channel: PublicKey,
    depositor: PublicKey
  ): Promise<EscrowAccount | null> {
    this.ensureInitialized();
    const [escrowPDA] = findEscrowPDA(channel, depositor, this.programId);

    try {
      const account = await this.getAccount("escrowAccount").fetch(escrowPDA);
      return {
        channel: account.channel,
        depositor: account.depositor,
        balance: account.amount.toNumber(),
        amount: account.amount.toNumber(),
        createdAt: account.createdAt.toNumber(),
        lastUpdated: account.createdAt.toNumber(), // Use createdAt as lastUpdated for now
        bump: account.bump,
      };
    } catch (error: any) {
      if (error?.message?.includes("Account does not exist")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all escrow accounts for a depositor
   */
  async getEscrowsByDepositor(
    depositor: PublicKey,
    limit: number = 50
  ): Promise<EscrowAccount[]> {
    this.ensureInitialized();

    try {
      const accounts = await this.getAccount("escrowAccount").all([
        {
          memcmp: {
            offset: 8 + 32, // Skip discriminator + channel pubkey
            bytes: depositor.toBase58(),
          },
        },
      ]);

      return accounts.slice(0, limit).map(({ account }: { account: any }) => ({
        channel: account.channel,
        depositor: account.depositor,
        balance: account.amount.toNumber(),
        amount: account.amount.toNumber(),
        createdAt: account.createdAt.toNumber(),
        lastUpdated: account.createdAt.toNumber(),
        bump: account.bump,
      }));
    } catch (error) {
      console.warn("Failed to fetch escrow accounts:", error);
      return [];
    }
  }

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
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("participant"),
        channelPDA.toBuffer(),
        userPublicKey.toBuffer(),
      ],
      this.programId
    );
  }
}
