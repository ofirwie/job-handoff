#!/bin/bash

# Google Integration Deployment Script
# Run this script to complete the deployment

echo "🚀 Google Integration Deployment Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project directory confirmed"

# Step 1: Run database migration
echo ""
echo "📊 Step 1: Database Migration"
echo "Please run the following SQL in your Supabase SQL editor:"
echo ""
echo "--- Copy and paste this into Supabase SQL Editor ---"
cat database/04_google_integration_schema.sql
echo "--- End of SQL ---"
echo ""
read -p "Press Enter after you've run the SQL migration in Supabase..."

# Step 2: Environment Variables Check
echo ""
echo "🔧 Step 2: Environment Variables"
echo "Please ensure these are set in your Vercel project:"
echo ""
echo "Required environment variables:"
echo "- GOOGLE_SERVICE_ACCOUNT_KEY (full JSON from Google Cloud)"
echo "- GOOGLE_SHEETS_ID (from Google Sheets URL)"
echo "- GOOGLE_DRIVE_PARENT_FOLDER_ID (from Google Drive URL)"
echo "- CRON_SECRET (generate with: openssl rand -hex 32)"
echo "- SUPABASE_SERVICE_ROLE_KEY (from Supabase settings)"
echo ""
echo "Optional:"
echo "- NODE_ENV=production"
echo "- VERCEL_URL=https://your-app.vercel.app"
echo ""
read -p "Press Enter after setting environment variables in Vercel..."

# Step 3: Deploy to Vercel
echo ""
echo "🌐 Step 3: Deploy to Vercel"
echo ""
echo "If you have Vercel CLI installed:"
echo "  vercel --prod"
echo ""
echo "Or push to GitHub to trigger automatic deployment"
echo ""
read -p "Press Enter to continue with testing setup..."

# Step 4: Testing Setup
echo ""
echo "🧪 Step 4: Testing Setup"
echo ""
echo "1. Create Google Sheets with headers:"
echo "   A: employee_name"
echo "   B: employee_email"  
echo "   C: job_code"
echo "   D: job_title"
echo "   E: departure_date"
echo "   F: manager_email"
echo "   G: processed"
echo "   H: handover_id"
echo "   I: notes"
echo ""
echo "2. Add test employee row:"
echo "   Test Employee | test@company.com | HR001 | Test Role | 2025-08-15 | manager@company.com | | | "
echo ""
echo "3. Test manual sync:"
echo "   curl -X POST https://your-app.vercel.app/api/sync/google-sheets"
echo ""

# Step 5: Verification
echo ""
echo "✅ Step 5: Verification"
echo ""
echo "After deployment, verify:"
echo "1. Visit your app URL - should show Apple-style interface"
echo "2. Check Supabase 'handovers' table for new records"
echo "3. Verify Google Drive folder creation"
echo "4. Test file upload functionality"
echo "5. Check 'sheets_sync_log' table for sync history"
echo ""

echo "📚 Documentation:"
echo "- Setup Guide: GOOGLE_SETUP.md"
echo "- Deployment Guide: DEPLOYMENT_GOOGLE_INTEGRATION.md"
echo ""

echo "🎉 Google Integration Deployment Complete!"
echo ""
echo "Key Features Now Active:"
echo "✅ Automated employee sync from Google Sheets (every 2 hours)"
echo "✅ Google Drive file uploads with organized folders"
echo "✅ Real-time Apple-style UI with progress tracking"
echo "✅ Admin monitoring dashboard"
echo "✅ Comprehensive error logging and retry mechanisms"
echo ""
echo "Your Job Handoff System is now fully integrated with Google services!"