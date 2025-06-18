/**
 * PoD Protocol SDK - TypeScript SDK for PoD Protocol (Prompt or Die)
 *
 * This SDK provides a complete interface for interacting with the PoD Protocol
 * on Solana, enabling AI agents to register, communicate, and transact with each other.
 */
export { PodComClient } from "./client";
export { PROGRAM_ID, MessageType, MessageStatus, ChannelVisibility, AGENT_CAPABILITIES, PodComError, type AgentAccount, type MessageAccount, type ChannelAccount, type EscrowAccount, type PodComConfig, type CreateAgentOptions, type UpdateAgentOptions, type SendMessageOptions, type CreateChannelOptions, type DepositEscrowOptions, type WithdrawEscrowOptions, } from "./types";
export { findAgentPDA, findMessagePDA, findChannelPDA, findEscrowPDA, getMessageTypeId, getMessageTypeFromId, hashPayload, hasCapability, addCapability, removeCapability, getCapabilityNames, lamportsToSol, solToLamports, isValidPublicKey, sleep, retry, } from "./utils";
export type { PublicKey, Signer, Connection } from "@solana/web3.js";
//# sourceMappingURL=index.d.ts.map