import { PodComClient, MessageType, MessageStatus } from "@pod-protocol/sdk";
import { GlobalOptions } from "../../utils/shared.js";

export interface CommandContext {
  client: PodComClient;
  wallet: any;
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