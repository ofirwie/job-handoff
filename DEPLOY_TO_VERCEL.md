# Deploy Job Handoff System to Vercel

## Quick Deployment Steps:

### 1. Install Vercel CLI (if you don't have it)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from the project directory
```bash
cd F:\git\job-handoff-project
vercel
```

### 4. Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your personal account
- **Link to existing project?** → No
- **Project name?** → `job-handoff` (or whatever you prefer)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

### 5. Set Environment Variables in Vercel Dashboard:
After deployment, go to your Vercel dashboard:
1. Click on your project
2. Go to "Settings" → "Environment Variables"
3. Add these variables:

```
VITE_SUPABASE_URL = https://pjiqcpusjxfjuulojzhc.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY
```

### 6. Redeploy to pick up environment variables:
```bash
vercel --prod
```

## Alternative: Deploy via GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `https://github.com/ofirwie/job-handoff`
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add environment variables before deploying
6. Click "Deploy"

## What You'll Get:
- ✅ Live URL (something like `job-handoff-xyz.vercel.app`)
- ✅ Automatic deployments on git push
- ✅ Environment variables properly configured
- ✅ Full Job Handoff System with dashboard
- ✅ No more white screen issues

## Troubleshooting:
If you still see issues after deployment:
1. Check the build logs in Vercel dashboard
2. Visit the debug mode at `your-url.vercel.app` to see connection status
3. Verify environment variables are set correctly in Vercel settings