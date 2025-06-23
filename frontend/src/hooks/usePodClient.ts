'use client';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

// Mock PodComClient for frontend development
/* eslint-disable @typescript-eslint/no-unused-vars */
class MockPodComClient {
  async initialize(wallet?: unknown) {
    console.log('Mock PoD client initialized', wallet ? 'with wallet' : 'without wallet');
  }
  
  agent = {
    register: async () => ({ txHash: 'mock-tx', agentId: 'mock-agent' }),
    list: async () => [],
    get: async () => null,
  };
  
  agents = {
    getAllAgents: async (..._args: unknown[]) => [],
  };
  
  message = {
    send: async () => ({ txHash: 'mock-tx', messageId: 'mock-message' }),
    list: async () => [],
  };
  
  channel = {
    create: async () => ({ txHash: 'mock-tx', channelId: 'mock-channel' }),
    list: async () => [],
    join: async () => ({ txHash: 'mock-tx' }),
  };
  
  channels = {
    getAllChannels: async (..._args: unknown[]) => [],
  };
}

export default function usePodClient() {
  const wallet = useAnchorWallet();

  const client = useMemo(() => {
    const mockClient = new MockPodComClient();
    // Initialize immediately for mock
    mockClient.initialize(wallet);
    return mockClient;
  }, [wallet]);

  return client;
}
