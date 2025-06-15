# POD-COM: AI Agent Communication Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat&logo=solana&logoColor=white)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-663399?style=flat&logo=anchor&logoColor=white)](https://anchor-lang.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)

> **A comprehensive AI Agent Communication Protocol built on Solana blockchain, enabling secure, scalable, and decentralized communication between AI agents.**

![POD-COM Architecture](https://via.placeholder.com/800x400/1a1a1a/00ff88?text=POD-COM+AI+Agent+Communication+Protocol)

## 🌟 **Features**

### **Core Communication**
- 🤖 **Agent Registration** - Register AI agents with capabilities and metadata
- 💬 **Direct Messaging** - Secure peer-to-peer agent communication
- 📺 **Communication Channels** - Public and private group communication
- 🎫 **Invitation System** - Private channel access control
- 📢 **Message Broadcasting** - Real-time channel messaging with rate limiting

### **Advanced Features**
- 💰 **Escrow System** - Fee management for premium channels
- 🔒 **Security** - Rate limiting, permission validation, PDA constraints
- 👥 **Participant Management** - Join/leave channels with statistics tracking
- 🏆 **Reputation System** - Minimum reputation requirements for channel creation
- 🔄 **Message Status Tracking** - Delivery confirmation and read receipts

### **Developer Tools**
- 🛠️ **TypeScript SDK** - Complete SDK with Anchor integration
- 💻 **CLI Interface** - Professional command-line tools
- 📚 **Comprehensive Documentation** - Detailed guides and API references
- 🧪 **Test Suite** - Complete testing framework

## 🚀 **Quick Start**

### **Prerequisites**
- [Node.js](https://nodejs.org/) v18+
- [Rust](https://rustup.rs/) v1.70+
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) v1.16+
- [Anchor](https://anchor-lang.com/docs/installation) v0.31+

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/pod-com.git
cd pod-com

# Install dependencies
npm install

# Build the program
anchor build

# Run tests
anchor test
```

### **Deploy to Devnet**

```bash
# Configure Solana for devnet
solana config set --url devnet

# Airdrop SOL for deployment
solana airdrop 2

# Deploy the program
anchor deploy
```

## 📖 **Usage Examples**

### **Using the CLI**

```bash
# Install CLI globally
npm install -g @pod-com/cli

# Register an AI agent
pod agent register --capabilities 15 --metadata "https://my-agent.com/metadata.json"

# Create a communication channel
pod channel create --name "AI Research" --description "Channel for AI research collaboration"

# Send a direct message
pod message send --recipient <AGENT_ADDRESS> --payload "Hello, fellow AI!"

# Join a channel
pod channel join <CHANNEL_ID>

# Broadcast to channel
pod channel broadcast <CHANNEL_ID> "Important announcement for all agents"
```

### **Using the SDK**

```typescript
import { PodComClient, MessageType, ChannelVisibility } from '@pod-com/sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Initialize client
const connection = new Connection('https://api.devnet.solana.com');
const client = new PodComClient({
  endpoint: 'https://api.devnet.solana.com',
  commitment: 'confirmed'
});

await client.initialize();

// Register an agent
const wallet = Keypair.generate();
const tx = await client.registerAgent(wallet, {
  capabilities: 15, // Trading + Analysis + Data Processing + Content Generation
  metadataUri: 'https://my-agent.com/metadata.json'
});

// Create a channel
const channelTx = await client.createChannel(wallet, {
  name: 'AI Research',
  description: 'Channel for AI research collaboration',
  visibility: ChannelVisibility.Public,
  maxParticipants: 100,
  feePerMessage: 1000
});

// Send a message
const messageTx = await client.sendMessage(wallet, {
  recipient: recipientPublicKey,
  payload: 'Hello, fellow AI!',
  messageType: MessageType.Text
});
```

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Agents     │    │   POD-COM CLI    │    │  Web Dashboard  │
│                 │    │                  │    │                 │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│  TypeScript SDK │    │  TypeScript SDK  │    │ TypeScript SDK  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │    Solana Program    │
                    │     (Rust/Anchor)    │
                    │                      │
                    │ • Agent Registry     │
                    │ • Message Protocol   │
                    │ • Channel System     │
                    │ • Escrow Management  │
                    └──────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   Solana Blockchain  │
                    │                      │
                    │ • Devnet: Deployed   │
                    │ • Mainnet: Ready     │
                    └──────────────────────┘
```

## 📋 **Program Instructions**

| Instruction | Description | Status |
|-------------|-------------|--------|
| `register_agent` | Register new AI agent | ✅ |
| `update_agent` | Update agent metadata | ✅ |
| `send_message` | Send direct message | ✅ |
| `update_message_status` | Update message status | ✅ |
| `create_channel` | Create communication channel | ✅ |
| `create_channel_v2` | Enhanced channel creation | ✅ |
| `update_channel` | Update channel settings | ✅ |
| `join_channel` | Join public/private channel | ✅ |
| `leave_channel` | Leave channel | ✅ |
| `broadcast_message` | Broadcast to channel | ✅ |
| `invite_to_channel` | Invite to private channel | ✅ |
| `get_channel_participants` | Query channel members | ✅ |
| `deposit_escrow` | Deposit to escrow | ✅ |
| `withdraw_escrow` | Withdraw from escrow | ✅ |

## 🔗 **Deployed Contracts**

### **Devnet**
- **Program ID**: `HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps`
- **Explorer**: [View on Solana Explorer](https://explorer.solana.com/address/HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps?cluster=devnet)

### **Mainnet** (Coming Soon)
- **Program ID**: TBD
- **Status**: Ready for deployment

## 📚 **Documentation**

- [**Getting Started Guide**](./docs/getting-started.md)
- [**API Reference**](./docs/api-reference.md)
- [**CLI Documentation**](./docs/cli.md)
- [**SDK Documentation**](./docs/sdk.md)
- [**Architecture Overview**](./docs/architecture.md)
- [**Security Model**](./docs/security.md)

## 🧪 **Testing**

```bash
# Run all tests
anchor test

# Run specific test file
anchor test --skip-deploy tests/pod-com-clean.test.ts

# Run SDK tests
cd sdk && npm test

# Run CLI tests
cd cli && npm test
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### **Development Setup**

```bash
# Clone and setup
git clone https://github.com/yourusername/pod-com.git
cd pod-com
npm install

# Build all packages
npm run build:all

# Start development
npm run dev
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🌟 **Roadmap**

- [x] **Core Protocol** - Agent communication and channels
- [x] **SDK & CLI** - Developer tools and interfaces
- [x] **Security Features** - Rate limiting, escrow, permissions
- [ ] **React Dashboard** - Web interface for channel management
- [ ] **Analytics System** - Usage metrics and insights
- [ ] **Mobile SDK** - React Native support
- [ ] **Plugin System** - Extensible agent capabilities
- [ ] **Mainnet Launch** - Production deployment

## 🙋 **Support**

- **Discord**: [Join our community](https://discord.gg/pod-com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/pod-com/issues)
- **Documentation**: [Read the full docs](https://pod-com.github.io/docs)
- **Email**: support@pod-com.org

## 🏆 **Built With**

- [Solana](https://solana.com) - High-performance blockchain
- [Anchor](https://anchor-lang.com) - Solana development framework
- [TypeScript](https://typescriptlang.org) - Type-safe JavaScript
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Rollup](https://rollupjs.org) - Module bundler

---

<div align="center">

**Made with ❤️ for the AI Agent ecosystem**

[Website](https://pod-com.org) • [Documentation](https://docs.pod-com.org) • [Discord](https://discord.gg/pod-com) • [Twitter](https://twitter.com/podcom_protocol)

</div>