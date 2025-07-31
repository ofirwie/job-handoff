# Google Integration Deployment Guide

## 🎯 Implementation Complete

All Google Sheets and Drive integration components have been successfully implemented and are ready for deployment.

## ✅ What's Been Implemented

### 🗄️ Database Schema
- ✅ `job_roles` table with job codes (HR001, DEV002, etc.)
- ✅ Updated `handovers` table with Google Drive fields
- ✅ Updated `handover_tasks` table with file metadata
- ✅ `sheets_sync_log` table for monitoring
- ✅ `handover_summary` view for efficient queries

### 🔧 Backend Infrastructure
- ✅ Google Drive utilities (`src/utils/google-drive.ts`)
- ✅ Google Sheets utilities (`src/utils/google-sheets.ts`)
- ✅ Vercel API routes:
  - `/api/sync/google-sheets` - Employee synchronization
  - `/api/tasks/[taskId]/upload` - File uploads to Drive
  - `/api/handovers/[id]/folder` - Folder management
  - `/api/cron/sync-sheets` - Automated sync (every 2 hours)

### 🎨 Frontend Components
- ✅ Updated `AppleHomeScreen` with real Supabase data
- ✅ `GoogleDriveUpload` component for file uploads
- ✅ `GoogleSyncDashboard` for admin monitoring
- ✅ Updated `useAppleHandovers` hook for Google integration

### 📦 Dependencies & Configuration
- ✅ Added `googleapis` and `formidable` packages
- ✅ Updated `vercel.json` with cron jobs and function timeouts
- ✅ Environment variables documentation

## 🚀 Deployment Steps

### 1. Database Migration
```sql
-- Run this in your Supabase SQL editor
\i database/04_google_integration_schema.sql
```

### 2. Install Dependencies
```bash
cd F:/git/job-handoff-project
npm install
```

### 3. Set Environment Variables in Vercel
```env
# Google Services
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEETS_ID=your-sheets-id-here
GOOGLE_DRIVE_PARENT_FOLDER_ID=your-drive-folder-id

# Security
CRON_SECRET=your-secure-random-string-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
NODE_ENV=production
VERCEL_URL=https://your-app.vercel.app
```

### 4. Deploy to Vercel
```bash
# Build and deploy
npm run build
vercel --prod
```

## 🎛️ Google Cloud Setup

Follow the detailed setup in `GOOGLE_SETUP.md`:

1. **Google Cloud Project**
   - Enable Sheets API and Drive API
   - Create service account
   - Download JSON credentials

2. **Google Sheets**
   - Create "עובדים עוזבים" sheet
   - Add required headers
   - Share with service account

3. **Google Drive**
   - Create parent folder
   - Share with service account
   - Get folder ID

## 🔄 How It Works

### Automated Employee Sync
1. **Every 2 hours**: Vercel cron calls `/api/cron/sync-sheets`
2. **Reads Google Sheets**: Departing employees data
3. **Creates handovers**: With Google Drive folders
4. **Updates sheet**: Marks rows as processed
5. **Sends emails**: Welcome emails to employees

### File Upload Flow
1. **Employee uploads file**: Using `GoogleDriveUpload` component
2. **API processes upload**: `/api/tasks/[taskId]/upload`
3. **Stores in Google Drive**: In organized subfolders
4. **Updates database**: File metadata and task completion
5. **Real-time progress**: Updates handover progress

### Apple-Style UI
- **Real-time data**: `useAppleHandovers` fetches from `handover_summary` view
- **Smart urgency**: Prioritizes overdue and review-needed handovers
- **Progress tracking**: Visual progress rings and status indicators

## 📊 Admin Monitoring

Use the `GoogleSyncDashboard` component to monitor:
- Total handovers and statistics
- Sync activity and logs
- Error tracking and troubleshooting
- Quick access to Google services

## 🧪 Testing the Integration

### 1. Test Manual Sync
```bash
curl -X POST https://your-app.vercel.app/api/sync/google-sheets
```

### 2. Add Test Employee
Add to Google Sheets:
```
employee_name: Test Employee
employee_email: test@company.com
job_code: HR001
job_title: Test Role
departure_date: 2025-08-15
manager_email: manager@company.com
```

### 3. Verify Results
- Check Supabase `handovers` table
- Verify Google Drive folder creation
- Confirm sheet updates (processed=TRUE)

## 🔐 Security Features

- **Service account authentication**: Secure Google API access
- **Row-level security**: Supabase RLS policies
- **File validation**: Type and size restrictions
- **Cron authentication**: CRON_SECRET verification
- **Error logging**: Comprehensive error tracking

## 📈 Performance Optimizations

- **Database views**: `handover_summary` for efficient queries
- **File upload progress**: Real-time progress tracking
- **Batch operations**: Google Sheets batch updates
- **Function timeouts**: 5-minute Vercel function limit
- **Auto-retry**: Built-in error handling and retries

## 🎉 Features Ready to Use

### ✅ For Employees
- Receive handover automatically from Google Sheets
- Upload files directly to Google Drive
- Track progress with Apple-style UI
- Get organized folder structure

### ✅ For Managers
- Review handovers with real-time data
- Access all files in Google Drive
- Approve/reject with comments
- Monitor team progress

### ✅ For Admins
- Monitor Google Sheets sync
- View detailed sync logs
- Trigger manual syncs
- Access Google services directly

## 🚨 Troubleshooting

Common issues and solutions are documented in `GOOGLE_SETUP.md`.

## 🎯 Next Steps

The integration is complete and ready for production use. Consider these enhancements:

1. **Email notifications**: Integrate SendGrid/SES for notifications
2. **Hebrew localization**: Add Hebrew language support
3. **Mobile optimization**: Enhance mobile experience
4. **Analytics**: Add usage tracking and reporting
5. **Bulk operations**: Admin tools for bulk management

## 📞 Support

For issues with the Google integration:
1. Check Vercel function logs
2. Review Supabase `sheets_sync_log` table
3. Verify Google Cloud permissions
4. Test API endpoints manually

The system is now fully integrated with Google services and ready for deployment! 🚀