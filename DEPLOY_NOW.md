# 🚀 Deploy with Settings Wizard

## Ready to Deploy! 

The app is now ready to deploy with minimal configuration. The Google integration can be set up through the Settings UI after deployment.

### What's Included:
- ✅ **Supabase keys** already configured in code
- ✅ **Settings wizard** for Google setup after deployment
- ✅ **Test endpoints** that work without Google credentials
- ✅ **Graceful degradation** - app works without Google initially

### Deployment Steps:

#### Option 1: GitHub → Vercel (Recommended)
1. Go to https://vercel.com/new
2. Import from GitHub: `ofirwie/job-handoff`
3. No environment variables needed initially
4. Deploy!

#### Option 2: Vercel CLI
```bash
npx vercel --prod
```

### After Deployment:
1. Visit your deployed app
2. Click Settings (gear icon)
3. Complete Google setup wizard
4. Configure environment variables through Vercel dashboard

### Environment Variables (Set After Deployment):
These can be added later through Vercel dashboard:
- `GOOGLE_SERVICE_ACCOUNT_KEY`
- `GOOGLE_SHEETS_ID`
- `GOOGLE_DRIVE_PARENT_FOLDER_ID`
- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

The app will work with just the Supabase connection and guide you through Google setup! 🎯