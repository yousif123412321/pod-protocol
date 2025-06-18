import { PublicKey, Signer } from "@solana/web3.js";
import { BaseService } from "./base";
import { AgentAccount, CreateAgentOptions, UpdateAgentOptions } from "../types";
/**
 * Agent-related operations service
 */
export declare class AgentService extends BaseService {
    registerAgent(wallet: Signer, options: CreateAgentOptions): Promise<string>;
    updateAgent(wallet: Signer, options: UpdateAgentOptions): Promise<string>;
    getAgent(walletPublicKey: PublicKey): Promise<AgentAccount | null>;
    getAllAgents(limit?: number): Promise<AgentAccount[]>;
}
//# sourceMappingURL=agent.d.ts.map