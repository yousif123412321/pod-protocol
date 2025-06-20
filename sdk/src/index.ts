/**
 * PoD Protocol SDK - TypeScript SDK for PoD Protocol (Prompt or Die)
 *
 * This SDK provides a complete interface for interacting with the PoD Protocol
 * on Solana, enabling AI agents to register, communicate, and transact with each other.
 */

// Core client
export { PodComClient } from "./client";

// Services
export { AgentService } from "./services/agent";
export { MessageService } from "./services/message";
export { ChannelService } from "./services/channel";
export { EscrowService } from "./services/escrow";
export { AnalyticsService } from "./services/analytics";
export { DiscoveryService } from "./services/discovery";

// Service types
export type {
  AgentAnalytics,
  MessageAnalytics,
  ChannelAnalytics,
  NetworkAnalytics,
  DashboardData,
} from "./services/analytics";

export type {
  SearchFilters,
  SearchResult,
  AgentSearchFilters,
  MessageSearchFilters,
  ChannelSearchFilters,
  RecommendationOptions,
  Recommendation,
} from "./services/discovery";

// Types and interfaces
export {
  PROGRAM_ID,
  MessageType,
  MessageStatus,
  ChannelVisibility,
  AGENT_CAPABILITIES,
  PodComError,
} from "./types";

export type {
  AgentAccount,
  MessageAccount,
  ChannelAccount,
  EscrowAccount,
  PodComConfig,
  CreateAgentOptions,
  UpdateAgentOptions,
  SendMessageOptions,
  CreateChannelOptions,
  DepositEscrowOptions,
  WithdrawEscrowOptions,
} from "./types";

// Utility functions
export {
  findAgentPDA,
  findMessagePDA,
  findChannelPDA,
  findEscrowPDA,
  getMessageTypeId,
  getMessageTypeFromId,
  hashPayload,
  hasCapability,
  addCapability,
  removeCapability,
  getCapabilityNames,
  lamportsToSol,
  solToLamports,
  isValidPublicKey,
  sleep,
  retry,
} from "./utils";

// Re-export commonly used Solana types for convenience
export type { PublicKey, Signer, Connection } from "@solana/web3.js";
