import { PodComClient, MessageType, MessageStatus } from "@pod-protocol/sdk";
import { Keypair } from "@solana/web3.js";
import { GlobalOptions } from "../../utils/shared.js";

export interface CommandContext {
  client: PodComClient;
  wallet: Keypair;
  globalOpts: GlobalOptions;
}

export interface SendMessageOptions {
  recipient?: string;
  payload?: string;
  type?: MessageType;
  customValue?: string;
  interactive?: boolean;
}

export interface MessageInfoOptions {
  messageId: string;
}

export interface MessageStatusOptions {
  message?: string;
  status?: string;
}

export interface MessageListOptions {
  agent?: string;
  limit?: string;
  filter?: MessageStatus;
}
