'use client';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useMemo, useEffect } from 'react';
import { PodComClient } from '@pod-protocol/sdk';

export default function usePodClient() {
  const wallet = useAnchorWallet();

  const client = useMemo(() => new PodComClient(), []);

  useEffect(() => {
    let mounted = true;
    client.initialize(wallet).catch((err) => {
      if (mounted) {
        console.error('Failed to initialize PoD client', err);
      }
    });
  
    return () => {
      mounted = false;
    };
  }, [client, wallet]);

  return client;
}
