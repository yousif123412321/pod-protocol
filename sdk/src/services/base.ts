import { Connection, PublicKey, Commitment } from "@solana/web3.js";
import anchor from "@coral-xyz/anchor";
const { Program } = anchor;
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
export abstract class BaseService {
  protected connection: Connection;
  protected programId: PublicKey;
  protected commitment: Commitment;
  protected program?: AnchorProgram;

  constructor(config: BaseServiceConfig) {
    this.connection = config.connection;
    this.programId = config.programId;
    this.commitment = config.commitment;
    this.program = config.program;
  }

  protected ensureInitialized(): AnchorProgram {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }
    return this.program;
  }

  protected getAccount(accountName: string) {
    const program = this.ensureInitialized();
    return (program.account as any)[accountName];
  }

  protected getProgramMethods() {
    const program = this.ensureInitialized();
    return program.methods as any;
  }

  setProgram(program: AnchorProgram) {
    this.program = program;
  }
} 