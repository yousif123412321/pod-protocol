import { PublicKey, Signer } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { BaseService } from "./base";
import { AgentAccount, CreateAgentOptions, UpdateAgentOptions } from "../types";
import { findAgentPDA, retry } from "../utils";

/**
 * Agent-related operations service
 */
export class AgentService extends BaseService {
  async registerAgent(wallet: Signer, options: CreateAgentOptions): Promise<string> {
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

  async updateAgent(wallet: Signer, options: UpdateAgentOptions): Promise<string> {
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

  async getAllAgents(limit: number = 100): Promise<AgentAccount[]> {
    try {
      const accounts = await this.getAccount("agentAccount").all();

      return accounts
        .slice(0, limit)
        .map((acc: any) => ({
          pubkey: acc.publicKey,
          capabilities: acc.account.capabilities.toNumber(),
          metadataUri: acc.account.metadataUri,
          reputation: acc.account.reputation?.toNumber() || 0,
          lastUpdated: acc.account.lastUpdated?.toNumber() || acc.account.updatedAt?.toNumber() || Date.now(),
          bump: acc.account.bump,
        }));
    } catch (error: any) {
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }
  }
} 