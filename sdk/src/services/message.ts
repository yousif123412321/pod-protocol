import { PublicKey, Signer, GetProgramAccountsFilter } from "@solana/web3.js";
import anchor from "@coral-xyz/anchor";
import { BaseService } from "./base";
import {
  MessageAccount,
  SendMessageOptions,
  MessageType,
  MessageStatus,
} from "../types";
import {
  findMessagePDA,
  hashPayload,
  retry,
  convertMessageTypeToProgram,
  convertMessageTypeFromProgram,
  getAccountTimestamp,
  getAccountCreatedAt,
} from "../utils";

/**
 * Message-related operations service
 */
export class MessageService extends BaseService {
  async sendMessage(
    wallet: Signer,
    options: SendMessageOptions,
  ): Promise<string> {
    // Hash the payload first
    const payloadHash = await hashPayload(options.payload);

    const [messagePDA] = findMessagePDA(
      wallet.publicKey,
      options.recipient,
      payloadHash,
      options.messageType,
      this.programId,
    );

    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .sendMessage(
          options.recipient,
          options.payload,
          this.convertMessageType(options.messageType, options.customValue),
          payloadHash,
          "", // metadata is not in the interface
        )
        .accounts({
          messageAccount: messagePDA,
          sender: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
  }

  async updateMessageStatus(
    wallet: Signer,
    messagePDA: PublicKey,
    newStatus: MessageStatus,
  ): Promise<string> {
    return retry(async () => {
      const methods = this.getProgramMethods();
      const tx = await methods
        .updateMessageStatus(this.convertMessageStatus(newStatus))
        .accounts({
          messageAccount: messagePDA,
          authority: wallet.publicKey,
        })
        .signers([wallet])
        .rpc({ commitment: this.commitment });

      return tx;
    });
  }

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

  async getAgentMessages(
    agentPublicKey: PublicKey,
    limit: number = 50,
    statusFilter?: MessageStatus,
  ): Promise<MessageAccount[]> {
    try {
      const filters: GetProgramAccountsFilter[] = [
        {
          memcmp: {
            offset: 8 + 32,
            bytes: agentPublicKey.toBase58(),
          },
        },
      ];

      if (statusFilter !== undefined) {
        const statusBytes = this.convertMessageStatus(statusFilter);
        filters.push({
          memcmp: {
            offset: 8 + 32 + 32 + 4 + 200,
            bytes: statusBytes,
          },
        });
      }

      const accounts = await this.connection.getProgramAccounts(
        this.programId,
        {
          filters,
          commitment: this.commitment,
        },
      );

      return accounts.slice(0, limit).map((acc) => {
        const account = this.ensureInitialized().coder.accounts.decode(
          "messageAccount",
          acc.account.data,
        );
        return this.convertMessageAccountFromProgram(account, acc.pubkey);
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch agent messages: ${error.message}`);
    }
  }

  private convertMessageType(
    messageType: MessageType,
    customValue?: number,
  ): any {
    if (messageType === MessageType.Custom && customValue !== undefined) {
      return { type: messageType, customValue };
    }
    return convertMessageTypeToProgram(messageType, customValue);
  }

  private convertMessageTypeFromProgram(programType: any): MessageType {
    const result = convertMessageTypeFromProgram(programType);
    // The utility function returns an object, we just want the type
    return result.type;
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
        throw new Error(`Unknown message status: ${status}`);
    }
  }

  private convertMessageStatusFromProgram(programStatus: any): MessageStatus {
    if (programStatus.pending) return MessageStatus.Pending;
    if (programStatus.delivered) return MessageStatus.Delivered;
    if (programStatus.read) return MessageStatus.Read;
    if (programStatus.failed) return MessageStatus.Failed;
    throw new Error(`Unknown program status: ${JSON.stringify(programStatus)}`);
  }

  private convertMessageAccountFromProgram(
    account: any,
    publicKey: PublicKey,
  ): MessageAccount {
    return {
      pubkey: publicKey,
      sender: new PublicKey(account.sender),
      recipient: new PublicKey(account.recipient),
      payload: account.payload || account.content || "",
      payloadHash: account.payloadHash,
      messageType: this.convertMessageTypeFromProgram(account.messageType),
      status: this.convertMessageStatusFromProgram(account.status),
      timestamp: getAccountTimestamp(account),
      createdAt: getAccountCreatedAt(account),
      expiresAt: account.expiresAt?.toNumber() || 0,
      bump: account.bump,
    };
  }
}
