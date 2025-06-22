# PoD-Protocol Full-Stack AI Agent

This is the specialized AI agent for the PoD-Protocol project, designed to provide comprehensive development assistance across all project modules.

## Agent Capabilities

### 🦀 **Rust/Anchor Development**
- Audit and optimize Solana smart contracts in `programs/pod-com/`
- Ensure compatibility with Anchor v0.27+
- Implement ZK compression features using Light Protocol
- Security analysis for CPI calls and account validation
- Performance optimization for on-chain operations

### 📦 **TypeScript SDK Development**
- Generate type-safe client helpers in `sdk/`
- Update interfaces and API documentation
- Maintain `PROTOCOL_SPEC.md` accuracy
- Implement ZK compression SDK features
- Ensure backward compatibility

### 🖥️ **CLI Development**
- Add new commands in `cli/`
- Rebuild command parsers and validators
- Update `BANNER_SHOWCASE.md` and `CLI_ENHANCEMENT_SUMMARY.md`
- Implement interactive command flows
- Error handling and user experience improvements

### 📚 **Documentation & Examples**
- Maintain clear markdown documentation in `docs/`
- Keep code samples runnable and up-to-date
- Sync with `dexploarer.github.io/PoD-Protocol/` site
- Create comprehensive examples in `examples/`
- API reference documentation

### 🔧 **Infrastructure & DevOps**
- Database migrations in `migrations/`
- Monitoring setup with Prometheus metrics in `monitoring/`
- CI/CD pipeline improvements
- Docker and deployment configurations
- Performance monitoring and alerting

### 🧪 **Testing & Quality Assurance**
- End-to-end JavaScript tests (`test-implementation.js`)
- Rust unit and integration tests
- Coverage enforcement in CI
- Security testing and audits
- Performance benchmarking

## Usage

The agent is configured to work with the following tools:
- **fs**: File system operations
- **git**: Version control operations
- **context7**: Advanced context management
- **task-manager**: Task tracking and management

## Configuration

The agent uses:
- **Model**: Claude-4 Sonnet for advanced reasoning
- **Temperature**: 0.1 for consistent, focused responses
- **Max Tokens**: 4096 for comprehensive responses
- **MCP File**: `../../mcp.json` for tool configuration

## Development Standards

The agent enforces:
- **TypeScript**: Strict mode compliance
- **Code Style**: Atomic design principles
- **Frontend**: Tailwind CSS + shadcn/ui components
- **Security**: CPI-safe calls and proper validation
- **Performance**: Hot spot identification and optimization
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear, runnable examples

## Workflow

For each task, the agent will:
1. Reference exact file paths
2. Show diffs or full file content with syntax highlighting
3. Propose PR branch names and commit messages
4. Include comprehensive unit tests
5. Highlight compatibility and security considerations
6. Ask clarifying questions when context is missing

## Project Structure Awareness

The agent has deep knowledge of:
```
PoD-Protocol-1/
├── programs/pod-com/     # Rust/Anchor smart contracts
├── sdk/                  # TypeScript SDK
├── cli/                  # Command-line interface
├── docs/                 # Documentation
├── examples/             # Code examples
├── migrations/           # Database migrations
├── monitoring/           # Monitoring setup
├── scripts/              # Utility scripts
└── tests/                # Test suites
```

## Best Practices

The agent promotes:
- **Security First**: Always consider security implications
- **Performance Aware**: Identify and optimize bottlenecks
- **User Experience**: Focus on developer and end-user experience
- **Maintainability**: Write clean, documented, testable code
- **Compatibility**: Ensure backward compatibility when possible
- **Standards Compliance**: Follow Solana and TypeScript best practices