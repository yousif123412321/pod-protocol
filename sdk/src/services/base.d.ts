import { Connection, PublicKey, Commitment } from "@solana/web3.js";
import anchor from "@coral-xyz/anchor";
type AnchorProgram = anchor.Program<any>;
/**
 * Configuration object for BaseService constructor
 */
export interface BaseServiceConfig {
    connection: Connection;
    programId: PublicKey;
    commitment: Commitment;
    program?: AnchorProgram;
}
/**
 * Base service class with common functionality for all services
 */
export declare abstract class BaseService {
    protected connection: Connection;
    protected programId: PublicKey;
    protected commitment: Commitment;
    protected program?: AnchorProgram;
    protected idl?: any;
    constructor(config: BaseServiceConfig);
    protected ensureInitialized(): AnchorProgram;
    protected getAccount(accountName: string): any;
    protected getProgramMethods(): any;
    setProgram(program: AnchorProgram): void;
    /**
     * Set the IDL for read-only operations
     */
    setIDL(idl: any): void;
    /**
     * Check if IDL is set for read-only operations
     */
    hasIDL(): boolean;
    protected ensureIDL(): any;
}
export {};
//# sourceMappingURL=base.d.ts.map