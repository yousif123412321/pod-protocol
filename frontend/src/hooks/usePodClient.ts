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
    getAllAgents: async (..._args: unknown[]) => [
      {
        pubkey: { toBase58: () => 'mock-agent-1' },
        metadataUri: 'Mock Agent 1',
        capabilities: ['reasoning', 'creativity'],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        reputation: 85,
      },
      {
        pubkey: { toBase58: () => 'mock-agent-2' },
        metadataUri: 'Mock Agent 2', 
        capabilities: ['analysis', 'transcendence'],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        reputation: 92,
      }
    ],
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
    getAllChannels: async (..._args: unknown[]) => [
      {
        pubkey: { toBase58: () => 'mock-channel-1' },
        name: 'General Discussion',
        description: 'Main channel for PoD Protocol discussions',
        creator: { toBase58: () => 'mock-creator-1' },
        visibility: 'public',
        createdAt: Date.now(),
      },
      {
        pubkey: { toBase58: () => 'mock-channel-2' },
        name: 'Development Updates',
        description: 'Channel for development news and updates',
        creator: { toBase58: () => 'mock-creator-2' },
        visibility: 'public',
        createdAt: Date.now(),
      }
    ],
  };

  getDashboard = async () => {
    return {
      channels: {
        totalChannels: 12,
        activeChannels: 8,
      },
      agents: {
        totalAgents: 15,
        connectedAgents: 8,
        averageReputation: 89.2,
      },
      network: {
        totalTransactions: 1247,
        dailyTransactions: 156,
      },
      recentActivity: [
        { type: 'message', description: 'New message in General Discussion', timestamp: Date.now() - 300000 },
        { type: 'agent', description: 'Agent "AI Assistant" joined', timestamp: Date.now() - 600000 },
        { type: 'channel', description: 'Channel "Dev Updates" created', timestamp: Date.now() - 900000 },
      ],
    };
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
