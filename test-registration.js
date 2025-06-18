#!/usr/bin/env node

import { PodComClient } from '@pod-protocol/sdk';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

async function testRegistration() {
  console.log('Testing agent registration...');
  
  try {
    // Load the keypair
    const keypairPath = process.env.HOME + '/.config/solana/id.json';
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    // Create wallet-like interface
    const wallet = {
      publicKey: keypair.publicKey,
      signTransaction: async (tx) => {
        tx.partialSign(keypair);
        return tx;
      },
      signAllTransactions: async (txs) => {
        return txs.map(tx => {
          tx.partialSign(keypair);
          return tx;
        });
      }
    };
    
    console.log('Wallet loaded:', wallet.publicKey.toBase58());
    
    // Create client
    const client = new PodComClient({
      endpoint: 'https://api.devnet.solana.com',
      commitment: 'confirmed',
    });
    
    // Initialize with wallet
    await client.initialize(wallet);
    console.log('Client initialized with wallet');
    
    // Try to register agent
    const result = await client.agents.registerAgent(keypair, {
      capabilities: 1,
      metadataUri: 'https://example.com/agent.json'
    });
    
    console.log('Success! Transaction:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRegistration();