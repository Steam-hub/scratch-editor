# Deploying Scratch to Cloudflare Pages

This guide will help you deploy your Scratch editor to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account**: Create a free account at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install the Cloudflare CLI tool
   ```bash
   npm install -g wrangler
   ```

## Method 1: Manual Deployment with Wrangler CLI

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Build and Deploy**:
   ```bash
   npm run deploy:cloudflare
   ```

3. **Your site will be available at**: `https://scratch-editor.pages.dev`

## Method 2: Git Integration (Recommended for production)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Cloudflare Pages deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to **Pages** > **Create a project**
   - Connect your GitHub repository
   - Use these settings:
     - **Project name**: `scratch-editor`
     - **Production branch**: `main` (or `develop`)
     - **Build command**: `npm run build:cloudflare`
     - **Build output directory**: `build`

3. **Environment Variables** (if needed):
   - Node.js version: `18`

## Method 3: GitHub Actions (Automated)

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy your site when you push to the main branch.

**Setup required**:
1. Go to your GitHub repository settings
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Get from Cloudflare dashboard > My Profile > API Tokens
   - `CLOUDFLARE_ACCOUNT_ID`: Get from Cloudflare dashboard > Right sidebar

## Files Created for Deployment

- `wrangler.toml` - Cloudflare configuration
- `_redirects` - SPA routing configuration
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `CLOUDFLARE_DEPLOYMENT.md` - This deployment guide

## Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Click **Custom domains** tab
3. Add your domain and follow DNS setup instructions

## Performance Optimizations

The build includes:
- Minified JavaScript bundles
- Optimized assets
- Source maps for debugging
- SPA routing configuration

Your Scratch editor will be served globally via Cloudflare's CDN for optimal performance!