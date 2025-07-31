# Google Integration Setup Guide

This guide will help you set up Google Sheets and Google Drive integration for the Job Handoff System.

## Required Environment Variables

Add these to your Vercel project environment variables:

```env
# Google Services Configuration
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
GOOGLE_SHEETS_ID=your-google-sheets-id
GOOGLE_DRIVE_PARENT_FOLDER_ID=your-parent-folder-id

# Cron Job Security
CRON_SECRET=your-secure-random-string

# Supabase Service Role (for API operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API

## Step 2: Create Service Account

1. In Google Cloud Console, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: `handoff-system-service`
4. Grant roles:
   - Editor (for Sheets)
   - Service Account User
5. Create and download the JSON key file
6. Copy the entire JSON content to `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable

## Step 3: Set Up Google Sheets

1. Create a new Google Sheets document
2. Name it "Employee Handovers" or similar
3. Create a sheet tab named "עובדים עוזבים" (Departing Employees)
4. Add headers in row 1:
   - A1: `employee_name`
   - B1: `employee_email`
   - C1: `job_code`
   - D1: `job_title`
   - E1: `departure_date`
   - F1: `manager_email`
   - G1: `processed`
   - H1: `handover_id`
   - I1: `notes`

5. Share the sheet with your service account email (found in the JSON key file)
6. Copy the Sheets ID from the URL: `https://docs.google.com/spreadsheets/d/SHEETS_ID/edit`
7. Set `GOOGLE_SHEETS_ID=SHEETS_ID` in environment variables

## Step 4: Set Up Google Drive

1. Create a parent folder in Google Drive for all handover folders
2. Share the folder with your service account email (Editor permissions)
3. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID`
4. Set `GOOGLE_DRIVE_PARENT_FOLDER_ID=FOLDER_ID` in environment variables

## Step 5: Set Up Database Schema

Run the database migration script:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d your-db-name -f database/04_google_integration_schema.sql
```

Or execute the SQL directly in the Supabase SQL editor.

## Step 6: Configure Vercel Environment Variables

In your Vercel dashboard:

1. Go to Project Settings > Environment Variables
2. Add all the environment variables listed above
3. Generate a secure random string for `CRON_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 7: Test the Integration

### Manual Sync Test
```bash
curl -X POST https://your-app.vercel.app/api/sync/google-sheets \
  -H "Content-Type: application/json"
```

### Add Test Employee
Add a row to your Google Sheets:
- employee_name: `Test Employee`
- employee_email: `test@company.com`
- job_code: `HR001`
- job_title: `Test Role`
- departure_date: `2025-08-15`
- manager_email: `manager@company.com`
- processed: (leave empty)
- handover_id: (leave empty)
- notes: (leave empty)

## Step 8: Verify Automated Sync

The system will automatically sync every 2 hours. Check:
1. Vercel Functions logs for successful executions
2. Supabase `sheets_sync_log` table for sync history
3. Google Sheets for updated `processed` and `handover_id` columns

## File Upload Flow

When employees upload files:
1. Files are uploaded to Google Drive in organized subfolders
2. File metadata is stored in Supabase
3. Tasks are marked as completed automatically

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Check service account permissions
   - Ensure APIs are enabled in Google Cloud

2. **Sheets Not Found**
   - Verify `GOOGLE_SHEETS_ID` is correct
   - Check if service account has access to the sheet

3. **Drive Upload Fails**
   - Verify `GOOGLE_DRIVE_PARENT_FOLDER_ID` is correct
   - Check service account permissions on the folder

4. **Cron Job Not Running**
   - Verify `CRON_SECRET` is set
   - Check Vercel cron job configuration in `vercel.json`

### Debug Endpoints

- `GET /api/sync/google-sheets` - Manual sync trigger
- `GET /api/handovers/[id]/folder` - Check folder status
- View sync logs in Supabase `sheets_sync_log` table

## Security Notes

1. Never commit the service account JSON to version control
2. Use environment variables for all sensitive data  
3. The service account should have minimal required permissions
4. Regularly rotate the `CRON_SECRET`
5. Monitor sync logs for unauthorized access attempts