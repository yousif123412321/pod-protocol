'use client';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
<<<<<<< HEAD
import { useMemo, useEffect } from 'react';
import { PodComClient, PodComConfig } from '@pod-protocol/sdk';
import { PublicKey } from '@solana/web3.js';
=======
import { useMemo, useEffect, useState } from 'react';
import { PodComClient } from '@pod-protocol/sdk';
import toast from 'react-hot-toast';
>>>>>>> 01a55ee (feat(frontend): add comprehensive UI components and error handling)

export default function usePodClient() {
  const wallet = useAnchorWallet();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

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
    
    const initializeClient = async () => {
      try {
        setInitError(null);
        setIsInitialized(false);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await client.initialize(wallet as any);
        
        if (mounted) {
          setIsInitialized(true);
          console.log('PoD client initialized successfully');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Failed to initialize PoD client:', err);
        
        if (mounted) {
          setInitError(errorMessage);
          
          // Show user-friendly error message
          if (errorMessage.includes('network')) {
            toast.error('Network connection failed. Please check your internet connection.');
          } else if (errorMessage.includes('wallet')) {
            toast.error('Wallet connection failed. Please ensure your wallet is connected.');
          } else {
            toast.error('Failed to initialize PoD client. Please try refreshing the page.');
          }
        }
      }
    };

    initializeClient();
  
    return () => {
      mounted = false;
<<<<<<< HEAD
      client.secureCleanup();
=======
      // Cleanup client on unmount
      if (client && typeof client.secureCleanup === 'function') {
        try {
          client.secureCleanup();
        } catch (err) {
          console.warn('Error during client cleanup:', err);
        }
      }
>>>>>>> 01a55ee (feat(frontend): add comprehensive UI components and error handling)
    };
  }, [client, wallet]);

  return {
    client,
    isInitialized,
    initError,
    retry: () => {
      // Force re-initialization by updating a dependency
      setInitError(null);
      setIsInitialized(false);
    }
  };
}
