# Specter Backend — Vercel Deploy Guide

## What's inside
- `api/leads.js` — Apollo.io proxy (the main endpoint)
- `api/health.js` — Health check
- `vercel.json` — Vercel configuration

## Deploy in 5 steps

### Step 1 — Create a GitHub account (if you don't have one)
Go to github.com and sign up for free.

### Step 2 — Create a new GitHub repository
1. Click the "+" icon → "New repository"
2. Name it: `specter-backend`
3. Set it to **Public**
4. Click "Create repository"

### Step 3 — Upload these files to GitHub
1. Click "uploading an existing file" on your new repo page
2. Drag and drop ALL files from this folder:
   - api/leads.js
   - api/health.js
   - vercel.json
   - package.json
3. Click "Commit changes"

### Step 4 — Deploy to Vercel
1. Go to vercel.com → Sign up with your GitHub account
2. Click "Add New Project"
3. Import your `specter-backend` repository
4. Click "Deploy" (no build settings needed)
5. Wait ~30 seconds — your server is live!

### Step 5 — Add your Apollo API Key
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Environment Variables"
3. Add:
   - Name: `APOLLO_API_KEY`
   - Value: `c0n_LUGbiGIm174XSqEt_Q`
4. Click "Save"
5. Go to "Deployments" → click "Redeploy"

## Your API endpoints will be at:
- `https://your-project.vercel.app/api/leads` ← main endpoint
- `https://your-project.vercel.app/api/health` ← check if it's working

## Test it's working
Visit: `https://your-project.vercel.app/api/health`
You should see: `{"status":"online","apollo_configured":true}`
