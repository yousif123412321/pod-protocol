#!/usr/bin/env node

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs';

async function fundTestWallet() {
  try {
    // Load the test keypair
    const testKeypairPath = process.env.HOME + '/.config/solana/test-id.json';
    const keypairData = JSON.parse(fs.readFileSync(testKeypairPath, 'utf8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log('Funding test wallet:', keypair.publicKey.toBase58());
    
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Request airdrop
    console.log('Requesting airdrop...');
    const airdropSignature = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
    
    // Check balance
    const balance = await connection.getBalance(keypair.publicKey);
    console.log('Wallet funded with:', balance / LAMPORTS_PER_SOL, 'SOL');
    
  } catch (error) {
    console.error('Error funding wallet:', error.message);
  }
}

fundTestWallet();