#!/usr/bin/env node

import { Keypair } from '@solana/web3.js';
import fs from 'fs';

// Generate a new keypair
const keypair = Keypair.generate();

// Convert to the Solana CLI format (array of bytes)
const keypairArray = Array.from(keypair.secretKey);

// Save to file
const testKeypairPath = process.env.HOME + '/.config/solana/test-id.json';
fs.writeFileSync(testKeypairPath, JSON.stringify(keypairArray));

console.log('Generated test keypair:', keypair.publicKey.toBase58());
console.log('Saved to:', testKeypairPath);