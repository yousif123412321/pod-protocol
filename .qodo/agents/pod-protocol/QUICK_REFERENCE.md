# PoD-Protocol Agent Quick Reference

## 🚀 Key Commands & Workflows

### Development Commands
```bash
# Build everything
bun run build:all

# Start development with ZK compression
./scripts/dev-with-zk.sh

# Run tests
anchor test
bun test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Agent Specializations

#### 🦀 Rust/Anchor (programs/pod-com/)
- **Files**: `lib.rs`, `Cargo.toml`, `Anchor.toml`
- **Focus**: ZK compression, CPI safety, account validation
- **Tools**: `cargo`, `anchor`, `solana`

#### 📦 TypeScript SDK (sdk/)
- **Files**: `client.ts`, `types.ts`, `services/*.ts`
- **Focus**: Type safety, API consistency, ZK integration
- **Tools**: `tsc`, `rollup`, `jest`

#### 🖥️ CLI (cli/)
- **Files**: `commands/*.ts`, `utils/*.ts`
- **Focus**: UX, error handling, interactive flows
- **Tools**: `commander`, `inquirer`, `chalk`

#### 📚 Documentation (docs/)
- **Files**: `*.md`, API references
- **Focus**: Clarity, runnable examples, site sync
- **Tools**: `markdown`, `docusaurus`

## 🔧 Common Tasks

### Adding New Features
1. **Branch**: `feat/<feature-name>`
2. **Files**: Update relevant modules
3. **Tests**: Add comprehensive tests
4. **Docs**: Update documentation
5. **PR**: Include security & performance notes

### Bug Fixes
1. **Branch**: `fix/<bug-description>`
2. **Root Cause**: Identify and fix core issue
3. **Tests**: Add regression tests
4. **Validation**: Ensure no breaking changes

### Security Reviews
- ✅ CPI call safety
- ✅ Account validation
- ✅ Privilege escalation checks
- ✅ Input sanitization
- ✅ Error handling

### Performance Optimization
- 🔍 Hot spot identification
- ⚡ Gas optimization
- 📦 Bundle size reduction
- 🚀 Load time improvements

## 📁 Key File Locations

### Core Program
- `programs/pod-com/src/lib.rs` - Main program logic
- `programs/pod-com/Cargo.toml` - Rust dependencies
- `Anchor.toml` - Anchor configuration

### SDK
- `sdk/src/client.ts` - Main SDK client
- `sdk/src/types.ts` - Type definitions
- `sdk/src/services/` - Service implementations

### CLI
- `cli/src/commands/` - Command implementations
- `cli/src/utils/` - Shared utilities
- `cli/package.json` - CLI dependencies

### Documentation
- `README.md` - Main project documentation
- `PROTOCOL_SPEC.md` - Protocol specification
- `docs/` - Detailed documentation
- `examples/` - Code examples

### Configuration
- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables
- `docker-compose.prod.yml` - Production setup

## 🎯 Quality Standards

### Code Quality
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier
- **Testing**: >80% coverage
- **Documentation**: Inline comments + README

### Security
- **Solana**: CPI-safe calls
- **Validation**: Input sanitization
- **Access Control**: Proper authorization
- **Dependencies**: Regular updates

### Performance
- **Blockchain**: Gas optimization
- **Frontend**: Bundle size <500KB
- **API**: Response time <200ms
- **Database**: Query optimization

## 🚨 Common Issues & Solutions

### Build Issues
```bash
# Clean and rebuild
bun run clean
bun install
bun run build:all
```

### Test Failures
```bash
# Run specific tests
anchor test --skip-deploy
bun test --verbose
```

### Deployment Issues
```bash
# Check Solana config
solana config get
solana balance

# Redeploy program
anchor clean
anchor build
anchor deploy
```

### ZK Compression Issues
```bash
# Test compression setup
./scripts/setup-photon-indexer.sh
pod zk config --test
```

## 📞 Getting Help

1. **Documentation**: Check `docs/` and `README.md`
2. **Examples**: Review `examples/` directory
3. **Tests**: Look at test files for usage patterns
4. **Issues**: Check GitHub issues for known problems
5. **Community**: Join Discord/Telegram for support