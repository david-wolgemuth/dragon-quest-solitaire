#!/bin/bash
set -e

echo "Manual deployment of PR 4 to gh-pages..."

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)

# Create temporary directory with clean source files
echo "Creating clean deployment files..."
TEMP_DIR=$(mktemp -d)
git archive HEAD | tar -x -C "$TEMP_DIR"

# Fetch and checkout gh-pages
echo "Checking out gh-pages branch..."
git fetch origin gh-pages
git checkout gh-pages

# Clean the PR 4 directory completely
echo "Cleaning pr-preview/pr-4 directory..."
rm -rf pr-preview/pr-4/*
rm -rf pr-preview/pr-4/.[!.]*

# Copy new files
echo "Copying new files..."
cp -r "$TEMP_DIR"/* "$TEMP_DIR"/.[!.]* pr-preview/pr-4/ 2>/dev/null || true

# Stage and commit
echo "Committing changes..."
git add -A pr-preview/pr-4/
git commit -m "Manual deployment for PR 4 - clean state"

# Push to gh-pages
echo "Pushing to gh-pages..."
git push origin gh-pages

# Return to original branch
echo "Returning to $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH"

# Cleanup
rm -rf "$TEMP_DIR"

echo "✅ Manual deployment complete!"
echo "Preview URL: https://david-wolgemuth.github.io/dragon-quest-solitaire/pr-preview/pr-4/"
