# Manual Vercel Deployment Guide

## Option 1: GitHub Integration (Recommended)

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"

### Step 2: Import Repository  
1. Find your repository: `ofirwie/job-handoff`
2. Click "Import"

### Step 3: Configure Project
- **Project Name:** `job-handoff`
- **Framework Preset:** Vite
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci`

### Step 4: Environment Variables
**BEFORE clicking Deploy, add these environment variables:**

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://pjiqcpusjxfjuulojzhc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY` |

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. You'll get a live URL like: `job-handoff-xyz.vercel.app`

---

## Option 2: CLI Deployment (if you want to use terminal)

### Step 1: Login to Vercel
```bash
vercel login
```
Choose "Continue with GitHub" and follow the browser login

### Step 2: Deploy
```bash
cd F:\git\job-handoff-project
vercel
```

Answer the prompts:
- Set up and deploy? → **Y**
- Which scope? → Select your account
- Link to existing project? → **N** 
- Project name? → **job-handoff**
- In which directory? → **./`
- Override settings? → **N**

### Step 3: Set Environment Variables
```bash
vercel env add VITE_SUPABASE_URL
# Enter: https://pjiqcpusjxfjuulojzhc.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY  
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY
```

### Step 4: Redeploy with Environment Variables
```bash
vercel --prod
```

---

## What You'll Get:
- ✅ Live URL for your Job Handoff System
- ✅ Automatic deployments on every git push
- ✅ Environment variables properly loaded
- ✅ Working dashboard with real data
- ✅ No more white screen issues

## After Deployment:
1. Visit your live URL
2. You should see the Job Handoff dashboard
3. If you see debug mode, click "Exit Debug Mode"
4. Enjoy your working Smart Handover System!

## Benefits of Vercel:
- Fast global CDN
- Automatic HTTPS
- Custom domains support
- Great developer experience
- Proper environment variable handling