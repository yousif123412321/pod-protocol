import { PublicKey, Signer } from "@solana/web3.js";
import { BaseService } from "./base";
import { DepositEscrowOptions, WithdrawEscrowOptions, EscrowAccount } from "../types";
/**
 * Escrow service for managing channel deposits and payments
 */
export declare class EscrowService extends BaseService {
    /**
     * Deposit funds to escrow for a channel
     */
    depositEscrow(wallet: Signer, options: DepositEscrowOptions): Promise<string>;
    /**
     * Withdraw funds from escrow
     */
    withdrawEscrow(wallet: Signer, options: WithdrawEscrowOptions): Promise<string>;
    /**
     * Get escrow account data
     */
    getEscrow(channel: PublicKey, depositor: PublicKey): Promise<EscrowAccount | null>;
    /**
     * Get all escrow accounts by depositor
     */
    getEscrowsByDepositor(depositor: PublicKey, limit?: number): Promise<EscrowAccount[]>;
    private convertEscrowAccountFromProgram;
}
//# sourceMappingURL=escrow.d.ts.map