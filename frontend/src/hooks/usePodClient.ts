'use client';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useMemo, useEffect } from 'react';
import { PodComClient, PodComConfig } from '@pod-protocol/sdk';
import { PublicKey } from '@solana/web3.js';

export default function usePodClient() {
  const wallet = useAnchorWallet();

  const client = useMemo(() => {
    const config: PodComConfig = {};

    if (process.env.NEXT_PUBLIC_RPC_ENDPOINT) {
      config.endpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
    }

    if (process.env.NEXT_PUBLIC_PROGRAM_ID) {
      try {
        config.programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);
      } catch (err) {
        console.warn('Invalid NEXT_PUBLIC_PROGRAM_ID', err);
      }
    }

    if (process.env.NEXT_PUBLIC_LIGHT_RPC_URL) {
      config.zkCompression = {
        lightRpcUrl: process.env.NEXT_PUBLIC_LIGHT_RPC_URL,
      };
    }

    return new PodComClient(config);
  }, []);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.initialize(wallet as any).catch((err) => {
      if (mounted) {
        console.error('Failed to initialize PoD client', err);
      }
    });
  
    return () => {
      mounted = false;
      client.secureCleanup();
    };
  }, [client, wallet]);

  return client;
}
