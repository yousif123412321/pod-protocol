#!/usr/bin/env node

import { PodComClient } from '@pod-protocol/sdk';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

async function testNewAgent() {
  console.log('=== Testing New Agent Registration ===');
  
  try {
    // Load the test keypair
    const testKeypairPath = process.env.HOME + '/.config/solana/test-id.json';
    const keypairData = JSON.parse(fs.readFileSync(testKeypairPath, 'utf8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log('Using test wallet:', keypair.publicKey.toBase58());
    
    // Create wallet interface
    const wallet = {
      publicKey: keypair.publicKey,
      signTransaction: async (tx) => {
        console.log('Signing transaction...');
        tx.partialSign(keypair);
        return tx;
      },
      signAllTransactions: async (txs) => {
        console.log('Signing all transactions...');
        return txs.map(tx => {
          tx.partialSign(keypair);
          return tx;
        });
      }
    };
    
    // Create client
    const client = new PodComClient({
      endpoint: 'https://api.devnet.solana.com',
      commitment: 'confirmed',
    });
    
    // Initialize with wallet
    await client.initialize(wallet);
    console.log('Client initialized');
    
    // Check if agent already exists (this should work since we initialized with wallet)
    console.log('Checking if agent already exists...');
    const existingAgent = await client.agents.getAgent(keypair.publicKey);
    if (existingAgent) {
      console.log('Agent already exists:', existingAgent.pubkey.toBase58());
      return;
    }
    
    console.log('Agent does not exist, proceeding with registration...');
    
    // Register agent
    const result = await client.agents.registerAgent(keypair, {
      capabilities: 1,
      metadataUri: 'https://new-agent.example.com'
    });
    
    console.log('🎉 SUCCESS! Transaction:', result);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testNewAgent();