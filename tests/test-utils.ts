import { PublicKey } from "@solana/web3.js";

export type MessageType = {
  text?: Record<string, never>;
  data?: Record<string, never>;
  command?: Record<string, never>;
  response?: Record<string, never>;
  custom?: number;
};

export type MessageStatus = {
  pending?: Record<string, never>;
  delivered?: Record<string, never>;
  read?: Record<string, never>;
  failed?: Record<string, never>;
};

export const getMessageTypeId = (msg: MessageType): number => {
  if (msg.text) return 0;
  if (msg.data) return 1;
  if (msg.command) return 2;
  if (msg.response) return 3;
  if (typeof msg.custom === "number") return 4 + msg.custom;
  return 0;
};

export const findAgentPDA = (
  wallet: PublicKey,
  programId: PublicKey,
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent"), wallet.toBuffer()],
    programId,
  );
};

export const findMessagePDA = (
  senderSeed: PublicKey,
  recipient: PublicKey,
  payloadHash: Uint8Array,
  messageType: MessageType,
  programId: PublicKey,
): [PublicKey, number] => {
  const messageTypeId = getMessageTypeId(messageType);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("message"),
      senderSeed.toBuffer(),
      recipient.toBuffer(),
      Buffer.from(payloadHash),
      Buffer.from([messageTypeId]),
    ],
    programId,
  );
};
