# PoD Protocol Production Deployment Guide

## 🚀 Production Deployment

This guide covers deploying PoD Protocol to production environments.

## Prerequisites

- Node.js >= 18.0.0
- Bun >= 1.0.0
- Docker (optional)
- Solana CLI tools
- Access to Solana mainnet RPC endpoint

## Environment Setup

### 1. Environment Variables

Copy the production environment template:
```bash
cp .env.example .env.production
```

Update `.env.production` with your production values:
- `SOLANA_NETWORK=mainnet-beta`
- `SOLANA_RPC_URL=https://api.mainnet-beta.solana.com`
- Set appropriate logging and monitoring configurations

### 2. Build for Production

```bash
# Build all packages
bun run build:all

# Or build individually
cd sdk && bun run build:prod
cd ../cli && bun run build:prod
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

```bash
# Build production image
docker build -f Dockerfile.prod -t pod-protocol:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Direct Node.js Deployment

```bash
# Install production dependencies
bun install --production

# Build the project
bun run build:all

# Start the application
NODE_ENV=production node cli/dist/index.js
```

### Option 3: Package Installation

```bash
# Install globally from npm
npm install -g @pod-protocol/cli

# Or install locally
npm install @pod-protocol/cli @pod-protocol/sdk
```

## Production Configuration

### Security Checklist

- [ ] Environment variables are properly secured
- [ ] API keys are stored in secure environment variables
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] Logging excludes sensitive information

### Performance Optimization

- [ ] Connection pooling configured
- [ ] Caching strategies implemented
- [ ] Request timeouts set appropriately
- [ ] Resource limits configured
- [ ] Health checks enabled

### Monitoring Setup

1. **Prometheus Metrics**
   ```bash
   # Start monitoring stack
   docker-compose -f docker-compose.prod.yml up monitoring
   ```

2. **Health Checks**
   ```bash
   # Check application health
   curl http://localhost:3000/health
   ```

3. **Log Monitoring**
   - Logs are written to `/app/logs/` in container
   - Configure log rotation and retention
   - Set up log aggregation (ELK stack, etc.)

## Maintenance

### Updates

```bash
# Pull latest version
git pull origin main

# Rebuild and restart
bun run build:all
docker-compose -f docker-compose.prod.yml restart
```

### Backup

- Backup configuration files
- Backup environment variables
- Backup any persistent data

### Troubleshooting

1. **Check logs**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

2. **Verify configuration**
   ```bash
   node cli/dist/index.js status
   ```

3. **Test connectivity**
   ```bash
   node cli/dist/index.js agent list --network mainnet-beta
   ```

## Support

For production support, please:
1. Check the troubleshooting section
2. Review logs for error details
3. Open an issue on GitHub with production environment details
4. Contact the development team for critical issues

## Security Considerations

- Keep dependencies updated
- Monitor for security vulnerabilities
- Use secure RPC endpoints
- Implement proper access controls
- Regular security audits
- Monitor for unusual activity
