import { PodComClient } from "pod-protocol-sdk";
import { getNetworkEndpoint, loadKeypair } from "./config";
import { Keypair } from "@solana/web3.js";

export async function createClient(network?: string): Promise<PodComClient> {
  const client = new PodComClient({
    endpoint: getNetworkEndpoint(network),
    commitment: "confirmed",
  });
  await client.initialize();
  return client;
}

export function getWallet(keypairPath?: string): Keypair {
  return loadKeypair(keypairPath);
}
