import { Connection, PublicKey, Commitment } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";

/**
 * Base service class with common functionality for all services
 */
export abstract class BaseService {
  protected connection: Connection;
  protected programId: PublicKey;
  protected commitment: Commitment;
  protected program?: Program<any>;

  constructor(
    connection: Connection,
    programId: PublicKey,
    commitment: Commitment,
    program?: Program<any>
  ) {
    this.connection = connection;
    this.programId = programId;
    this.commitment = commitment;
    this.program = program;
  }

  protected ensureInitialized(): Program<any> {
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

  setProgram(program: Program<any>) {
    this.program = program;
  }
} 