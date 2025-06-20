import { PodComClient } from "@pod-protocol/sdk";
import { Keypair } from "@solana/web3.js";
import { GlobalOptions } from "../../utils/shared.js";

export interface CommandContext {
  client: PodComClient;
  wallet: Keypair;
  globalOpts: GlobalOptions;
}

export interface AgentRegisterOptions {
  capabilities?: string;
  metadata?: string;
  interactive?: boolean;
}

export interface AgentListOptions {
  limit?: string;
}

export interface AgentUpdateOptions {
  capabilities?: string;
  metadata?: string;
  agent?: string;
  interactive?: boolean;
}
