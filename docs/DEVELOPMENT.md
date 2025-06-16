# Development Setup Guide

## Git Configuration

To avoid the "divergent branches" error and ensure smooth development, configure Git properly:

```bash
# Set merge strategy for pulls (prevents divergent branch errors)
git config --global pull.rebase false

# Set default branch name
git config --global init.defaultBranch main

# Set push behavior
git config --global push.default simple

# Setup proper line ending handling
git config --global core.autocrlf input

# Use VS Code as default editor and merge tool
git config --global core.editor "code --wait"
git config --global merge.tool vscode
git config --global diff.tool vscode
```

## Common Git Issues and Solutions

### 1. Divergent Branches Error

```text
fatal: Need to specify how to reconcile divergent branches.
```

**Solution:**

```bash
git config pull.rebase false
git pull origin main
```

### 2. Merge Conflicts

If you encounter merge conflicts:

```bash
# View conflicts
git status

# Open files in VS Code to resolve conflicts
code path/to/conflicted/file.js

# After resolving conflicts
git add .
git commit -m "resolve merge conflicts"
```

### 3. Accidentally Committed to Wrong Branch

```bash
# Move commits to correct branch
git checkout correct-branch
git cherry-pick commit-hash

# Remove commits from wrong branch
git checkout wrong-branch
git reset --hard HEAD~1  # Remove last commit
```

## Recommended Development Workflow

1. **Start a new feature:**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit:**

   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

3. **Push feature branch:**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request** through GitHub UI

5. **After PR is merged, cleanup:**

   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/your-feature-name
   ```

## Project Setup Commands

```bash
# Install dependencies
npm ci --legacy-peer-deps
cd sdk && npm ci --legacy-peer-deps
cd ../cli && npm ci --legacy-peer-deps

# Build all packages
npm run build:all

# Run tests
npm test

# Run linting
npm run lint

# Clean build artifacts
npm run clean
```

## Troubleshooting

### Issue: npm install fails

**Solution:** Use `npm ci --legacy-peer-deps` instead of `npm install`

### Issue: Build fails on Windows

**Solution:** Ensure you have the latest Node.js and npm versions installed

### Issue: Rust build fails

**Solution:** Install latest Rust toolchain:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update stable
```

### Issue: Solana CLI not found

**Solution:** Install Solana CLI:

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.27/install)"
```
