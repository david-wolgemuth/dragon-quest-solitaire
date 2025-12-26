# Deployment Guide

This project uses GitHub Pages with automatic PR preview deployments.

## Production Deployment

The `main` branch is automatically deployed to GitHub Pages whenever changes are pushed.

**URL:** `https://<username>.github.io/dragon-quest-solitaire/`

The deployment is handled by the `.github/workflows/deploy-pages.yml` workflow.

## PR Preview Deployments

Every pull request automatically gets its own preview deployment that:
- ✅ Deploys when the PR is opened or updated
- ✅ Updates automatically on every commit
- ✅ Cleans up automatically when the PR is closed

**Preview URL format:** `https://<username>.github.io/dragon-quest-solitaire/pr-preview/pr-<number>/`

The preview deployment is handled by the `.github/workflows/pr-preview.yml` workflow using the [rossjrw/pr-preview-action](https://github.com/rossjrw/pr-preview-action).

### How it works

1. When a PR is opened, the workflow creates a preview by copying the site files to the `gh-pages` branch under `pr-preview/pr-<number>/`
2. A comment is automatically posted on the PR with the preview URL
3. On each new commit, the preview is updated
4. When the PR is closed, the preview directory is automatically removed

### Configuration

The `.pr-preview.json` file controls which files are excluded from the preview deployment. By default, it excludes:
- Development files (node_modules, test files)
- Documentation files (*.md)
- Configuration files (package.json, vitest.config.js, etc.)
- Git files (.git, .github, .gitignore)

## Setup Instructions

### First-time setup

1. Go to your repository Settings → Pages
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. Save the settings

That's it! The workflows will handle the rest automatically.

### Testing locally

```bash
npm start
```

This runs a local server at `http://localhost:8008`.

## Workflow Files

- `.github/workflows/deploy-pages.yml` - Deploys `main` branch to production
- `.github/workflows/pr-preview.yml` - Handles PR preview deployments and cleanup
- `.pr-preview.json` - Configuration for which files to exclude from previews
