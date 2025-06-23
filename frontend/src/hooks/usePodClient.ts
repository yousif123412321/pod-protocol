'use client';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useMemo, useEffect } from 'react';
import { PodComClient } from '@pod-protocol/sdk';

export default function usePodClient() {
  const wallet = useAnchorWallet();

  const client = useMemo(() => new PodComClient(), []);

  useEffect(() => {
    client.initialize(wallet).catch((err) => {
      console.error('Failed to initialize PoD client', err);
    });
  }, [client, wallet]);

  return client;
}
