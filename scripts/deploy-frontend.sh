#!/bin/bash

# Frontend Deployment Script for PoD Protocol
# This script handles deployment of the frontend to Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
    print_error "This script must be run from the root of the PoD Protocol repository"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    bun add -g vercel@latest
fi

# Parse command line arguments
ENVIRONMENT="preview"
PRODUCTION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --prod|--production)
            ENVIRONMENT="production"
            PRODUCTION=true
            shift
            ;;
        --preview)
            ENVIRONMENT="preview"
            PRODUCTION=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--prod|--production] [--preview]"
            echo ""
            echo "Options:"
            echo "  --prod, --production    Deploy to production"
            echo "  --preview              Deploy to preview (default)"
            echo "  --help, -h             Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_status "Starting frontend deployment to $ENVIRONMENT..."

# Change to frontend directory
cd frontend

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ]; then
    print_error "VERCEL_TOKEN environment variable is not set"
    print_status "Please set your Vercel token: export VERCEL_TOKEN=your_token_here"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
bun install --frozen-lockfile

# Run linting
print_status "Running linting..."
if ! bun run lint; then
    print_error "Linting failed. Please fix the issues before deploying."
    exit 1
fi

# Run tests (if they exist and pass)
print_status "Running tests..."
if bun run test --passWithNoTests; then
    print_success "Tests passed"
else
    print_warning "Tests failed or no tests found, continuing with deployment..."
fi

# Build the project
print_status "Building the project..."
if ! bun run build; then
    print_error "Build failed. Please fix the issues before deploying."
    exit 1
fi

print_success "Build completed successfully"

# Deploy to Vercel
print_status "Deploying to Vercel ($ENVIRONMENT)..."

if [ "$PRODUCTION" = true ]; then
    # Production deployment
    DEPLOYMENT_URL=$(vercel --prod --token="$VERCEL_TOKEN" --yes)
    print_success "Production deployment completed!"
    print_status "Production URL: $DEPLOYMENT_URL"
else
    # Preview deployment
    DEPLOYMENT_URL=$(vercel --token="$VERCEL_TOKEN" --yes)
    print_success "Preview deployment completed!"
    print_status "Preview URL: $DEPLOYMENT_URL"
fi

# Create deployment summary
echo ""
echo "=========================================="
echo "🚀 DEPLOYMENT SUMMARY"
echo "=========================================="
echo "Environment: $ENVIRONMENT"
echo "URL: $DEPLOYMENT_URL"
echo "Timestamp: $(date)"
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
echo "=========================================="

# Open URL in browser (optional)
if command -v open &> /dev/null; then
    read -p "Open deployment in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$DEPLOYMENT_URL"
    fi
elif command -v xdg-open &> /dev/null; then
    read -p "Open deployment in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open "$DEPLOYMENT_URL"
    fi
fi

print_success "Frontend deployment completed successfully!"