# LIV8 GHL Backend - Vercel Deployment Guide

## Quick Deploy to os.liv8ai.com

### Step 1: Authenticate with Vercel

The `vercel login` command is running. You should see a browser window open asking you to:
1. Log in to your Vercel account (or create one at vercel.com)
2. Authorize the Vercel CLI

Once authenticated, the CLI will show: ✓ Success!

---

### Step 2: Deploy Backend

After authentication completes, run:

```bash
cd backend
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → `liv8-ghl-backend` (or your choice)
- **Directory to deploy?** → `./` (current directory)
- **Want to modify settings?** → No

Vercel will:
1. Build your project
2. Deploy to a temporary URL (e.g., `liv8-ghl-backend.vercel.app`)
3. Show you the deployment URL

---

### Step 3: Set Environment Variables

```bash
# Add environment variables one by one
vercel env add POSTGRES_URL
# Paste your Vercel Postgres URL when prompted

vercel env add JWT_SECRET
# Generate: $(openssl rand -base64 32)

vercel env add GEMINI_API_KEY
# Your Gemini API key

vercel env add HIGHLEVEL_MCP_URL
# https://services.leadconnectorhq.com/mcp/

vercel env add GHL_TEST_TOKEN
# pit-1b141389-ba1e-4ac6-b85a-30b2b069bee5
```

Select **Production** for each variable.

---

### Step 4: Add Vercel Postgres Database

1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `liv8-ghl-backend`
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Name it: `liv8-ghl-db`
6. Click **Create**

Vercel will automatically add `POSTGRES_URL` to your environment variables.

---

### Step 5: Initialize Database Schema

```bash
# Get your Postgres URL from Vercel dashboard
# Storage → liv8-ghl-db → .env.local tab → Copy POSTGRES_URL

# Run schema migration
psql "your-postgres-url-here" < src/db/schema.sql
```

This creates all tables:
- agencies
- users
- ghl_locations
- audit_log
- macros

---

### Step 6: Configure Custom Domain (os.liv8ai.com)

#### In Vercel Dashboard:

1. Go to your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `os.liv8ai.com`
4. Click **Add**

Vercel will show DNS records you need to add.

#### In Your DNS Provider (liv8ai.com):

Add CNAME record:
```
Type: CNAME
Name: os
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

**Alternative (if you manage DNS in Vercel):**
- Vercel will automatically configure it

Wait 5-10 minutes for DNS propagation.

---

### Step 7: Deploy to Production

```bash
vercel --prod
```

This deploys to production with all environment variables.

Your backend will be live at:
- https://os.liv8ai.com ✅

---

### Step 8: Test Deployment

```bash
# Health check
curl https://os.liv8ai.com/health

# Expected response:
# {"status":"ok","service":"LIV8 GHL Backend"}
```

---

### Step 9: Update Extension

Update the extension to use production backend:

```bash
# In GHL-AGENTS/.env.local
VITE_BACKEND_URL=https://os.liv8ai.com
```

Rebuild:
```bash
npm run build
```

Reload extension in Chrome.

---

## Troubleshooting

### "Module not found" errors
```bash
cd backend
npm install
vercel --prod
```

### Database connection fails
- Verify `POSTGRES_URL` is set in Vercel
- Check database schema was initialized
- Test connection: `psql $POSTGRES_URL -c "SELECT 1;"`

### CORS errors from extension
- Check `src/index.ts` CORS config includes `chrome-extension://*`
- Redeploy: `vercel --prod`

### Custom domain not working
- Wait 10-15 minutes for DNS propagation
- Check DNS: `dig os.liv8ai.com`
- Verify CNAME points to `cname.vercel-dns.com`

---

## Monitoring

**View Logs:**
```bash
vercel logs
```

**View Deployments:**
```bash
vercel ls
```

**View Project in Dashboard:**
https://vercel.com/dashboard

---

## Security Checklist

✅ POSTGRES_URL is environment variable (not in code)
✅ JWT_SECRET is strong random string
✅ GHL tokens encrypted in database
✅ CORS restricted to extension + dashboard origins
✅ All API routes require JWT authentication

---

Your backend is now live at **https://os.liv8ai.com** 🚀
