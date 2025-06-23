import { PublicKey, Signer } from "@solana/web3.js";
import { BaseService } from "./base";
import { CreateChannelOptions, ChannelAccount, ChannelVisibility, BroadcastMessageOptions } from "../types";
/**
 * Channel service for managing group communication
 */
export declare class ChannelService extends BaseService {
    /**
     * Create a new channel
     */
    createChannel(wallet: Signer, options: CreateChannelOptions): Promise<string>;
    /**
     * Get channel data
     */
    getChannel(channelPDA: PublicKey): Promise<ChannelAccount | null>;
    /**
     * Get all channels with optional filtering
     */
    getAllChannels(limit?: number, visibilityFilter?: ChannelVisibility): Promise<ChannelAccount[]>;
    /**
     * Get channels created by a specific user
     */
    getChannelsByCreator(creator: PublicKey, limit?: number): Promise<ChannelAccount[]>;
    /**
     * Join a channel
     */
    joinChannel(wallet: Signer, channelPDA: PublicKey): Promise<string>;
    /**
     * Leave a channel
     */
    leaveChannel(wallet: Signer, channelPDA: PublicKey): Promise<string>;
    /**
     * Broadcast a message to a channel
     */
    broadcastMessage(wallet: Signer, options: BroadcastMessageOptions): Promise<string>;
    /**
     * Invite a user to a channel
     */
    inviteToChannel(wallet: Signer, channelPDA: PublicKey, invitee: PublicKey): Promise<string>;
    /**
     * Get channel participants
     */
    getChannelParticipants(channelPDA: PublicKey, limit?: number): Promise<Array<any>>;
    /**
     * Get channel messages
     */
    getChannelMessages(channelPDA: PublicKey, limit?: number): Promise<Array<any>>;
    private convertChannelVisibility;
    private convertChannelVisibilityFromProgram;
    private convertMessageType;
    private convertChannelAccountFromProgram;
    private findParticipantPDA;
}
//# sourceMappingURL=channel.d.ts.map