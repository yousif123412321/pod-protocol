import { PublicKey } from "@solana/web3.js";
/**
 * PoD Protocol Program ID on Solana Devnet
 */
export const PROGRAM_ID = new PublicKey("HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps");
/**
 * Message types supported by PoD Protocol
 */
export var MessageType;
(function (MessageType) {
    MessageType["Text"] = "text";
    MessageType["Data"] = "data";
    MessageType["Command"] = "command";
    MessageType["Response"] = "response";
    MessageType["Custom"] = "custom";
})(MessageType || (MessageType = {}));
/**
 * Message status in the delivery lifecycle
 */
export var MessageStatus;
(function (MessageStatus) {
    MessageStatus["Pending"] = "pending";
    MessageStatus["Delivered"] = "delivered";
    MessageStatus["Read"] = "read";
    MessageStatus["Failed"] = "failed";
})(MessageStatus || (MessageStatus = {}));
/**
 * Channel visibility options
 */
export var ChannelVisibility;
(function (ChannelVisibility) {
    ChannelVisibility["Public"] = "public";
    ChannelVisibility["Private"] = "private";
})(ChannelVisibility || (ChannelVisibility = {}));
/**
 * Agent capabilities as bitmask values
 */
export const AGENT_CAPABILITIES = {
    TRADING: 1 << 0, // 1
    ANALYSIS: 1 << 1, // 2
    DATA_PROCESSING: 1 << 2, // 4
    CONTENT_GENERATION: 1 << 3, // 8
    CUSTOM_1: 1 << 4, // 16
    CUSTOM_2: 1 << 5, // 32
    CUSTOM_3: 1 << 6, // 64
    CUSTOM_4: 1 << 7, // 128
};
/**
 * Error types returned by PoD Protocol program
 */
export var PodComError;
(function (PodComError) {
    PodComError[PodComError["InvalidMetadataUriLength"] = 6000] = "InvalidMetadataUriLength";
    PodComError[PodComError["Unauthorized"] = 6001] = "Unauthorized";
    PodComError[PodComError["MessageExpired"] = 6002] = "MessageExpired";
    PodComError[PodComError["InvalidMessageStatusTransition"] = 6003] = "InvalidMessageStatusTransition";
})(PodComError || (PodComError = {}));
