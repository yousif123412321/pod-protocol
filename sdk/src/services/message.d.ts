import { PublicKey, Signer } from "@solana/web3.js";
import { BaseService } from "./base";
import { MessageAccount, SendMessageOptions, MessageStatus } from "../types";
/**
 * Message-related operations service
 */
export declare class MessageService extends BaseService {
    sendMessage(wallet: Signer, options: SendMessageOptions): Promise<string>;
    updateMessageStatus(wallet: Signer, messagePDA: PublicKey, newStatus: MessageStatus): Promise<string>;
    getMessage(messagePDA: PublicKey): Promise<MessageAccount | null>;
    getAgentMessages(agentPublicKey: PublicKey, limit?: number, statusFilter?: MessageStatus): Promise<MessageAccount[]>;
    private convertMessageType;
    private convertMessageTypeFromProgram;
    private convertMessageStatus;
    private convertMessageStatusFromProgram;
    private convertMessageAccountFromProgram;
}
//# sourceMappingURL=message.d.ts.map