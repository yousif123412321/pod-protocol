# POD-COM Project Rules and Guidelines

This document outlines the rules and guidelines for the POD-COM project to ensure consistency, security, and maintainability.

## Development Environment

- **Rust Toolchain**: Nightly (required for Solana/Agave development)
- **Solana/Agave CLI**: 2.2.16+
- **Anchor**: 0.31.1 (installed via AVM)
- **Node.js**: 18+
- **Package Manager**: Bun (preferred) or Yarn

## Dependency Management

### Rust Dependencies
- Always pin dependency versions using `=x.y.z` syntax
- Avoid dependencies that pull in `getrandom` or `rand` crates
- Keep `Cargo.lock` in version control

### JavaScript/TypeScript Dependencies
- Use Bun as the package manager
- Update `package.json` with exact versions using `bun add -E`

## Build and Test

### Building the Project
```bash
# Build the program
anchor build

# Build with optimizations
anchor build --release
```

### Running Tests
```bash
# Run all tests
anchor test

# Run specific test file
bun test tests/my-test.ts
```

## Code Style

### Rust
- Follow Rust's official style guidelines
- Use `rustfmt` for consistent formatting
- Document public APIs with `///` doc comments

### TypeScript/JavaScript
- Use TypeScript for type safety
- Follow the Airbnb JavaScript Style Guide
- Use ESLint and Prettier for consistent formatting

## Security Guidelines

1. **No Randomness in Programs**: Avoid using random number generators in Solana programs
2. **Input Validation**: Always validate inputs to program instructions
3. **Account Validation**: Verify all account ownership and signers
4. **Error Handling**: Use descriptive error messages and proper error types

## CI/CD

- Run `anchor build` and `anchor test` on all pull requests
- Ensure all tests pass before merging to main
- Deploy to devnet after merging to main

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Clean the target directory: `cargo clean`
   - Update dependencies: `cargo update`
   - Check for conflicting dependency versions

2. **Test Failures**
   - Ensure the local validator is running if testing against a local cluster
   - Check for sufficient devnet SOL: `solana airdrop 2`

3. **Dependency Issues**
   - If you see `getrandom` or `rand` related errors, check for transitive dependencies
   - Use `cargo tree` to inspect the dependency graph

## Documentation

- Keep `README.md` files up to date
- Document all public interfaces
- Add inline comments for complex logic
- Update this document as the project evolves
