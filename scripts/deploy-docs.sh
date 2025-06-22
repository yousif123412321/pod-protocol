#!/bin/bash

# GitHub Pages Deployment Script for PoD Protocol

echo "🚀 Deploying PoD Protocol docs to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "docs/index.html" ]; then
    echo "❌ Error: docs/index.html not found. Make sure you're in the project root."
    exit 1
fi

# Create a backup of the current docs
echo "📦 Creating backup..."
cp -r docs docs-backup-$(date +%Y%m%d_%H%M%S)

# Add all docs changes to git
echo "📝 Adding docs changes to git..."
git add docs/

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit in docs/"
else
    # Commit the changes
    echo "💾 Committing docs changes..."
    git commit -m "Update GitHub Pages with interactive terminal demo

- Enhanced terminal UI with comprehensive CLI simulation
- Added all POD-COM CLI commands and realistic outputs
- Improved styling to match matrix theme
- Interactive command history and autocomplete
- Real-time command execution simulation"
fi

# Push to origin
echo "🌐 Pushing to origin..."
git push origin main

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "🔀 Switching to gh-pages branch..."
    git checkout gh-pages
    
    # Merge main branch docs
    git merge main --no-edit
else
    echo "🆕 Creating gh-pages branch..."
    git checkout -b gh-pages
fi

# Push gh-pages
echo "🚀 Deploying to GitHub Pages..."
git push origin gh-pages

# Switch back to main
git checkout main

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your GitHub Pages site should be available at:"
echo "   https://yourusername.github.io/POD-COM/"
echo ""
echo "📝 Note: It may take a few minutes for changes to appear."
echo "🔧 Make sure GitHub Pages is enabled in your repository settings."
