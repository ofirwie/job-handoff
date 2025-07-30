# Job Handoff Project - Database Setup Guide

## 🚀 Quick Start

Your job-handoff React app is showing a white screen because the Supabase database tables haven't been created yet. Follow these steps to set up the database schema:

### Method 1: One-Click Setup (Recommended)

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/pjiqcpusjxfjuulojzhc/sql
   ```

2. **Copy & Execute SQL**
   - Open the file: `CONSOLIDATED_DATABASE_SETUP.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor (Ctrl+V)
   - Click **"Run"** button
   - Wait for execution to complete

3. **Test Your App**
   ```bash
   cd F:\git\job-handoff-project
   npm run dev
   ```
   - Open http://localhost:5173
   - The white screen should be resolved!

### Method 2: Interactive Setup

1. **Open the HTML setup tool**
   ```
   F:\git\job-handoff-project\database-setup.html
   ```
   - Double-click to open in your browser
   - Follow the step-by-step guided process
   - Test connection and execute SQL files individually

### Method 3: Manual File-by-File

Execute these SQL files in **exact order** in Supabase:

1. `database/01_flexible_schema.sql` - Creates tables and indexes
2. `database/02_rls_policies.sql` - Sets up security policies  
3. `database/03_initial_data.sql` - Inserts sample data

## 🔧 Troubleshooting

### Common Issues

**"CREATE EXTENSION" fails**
- This is normal if the extension already exists
- Continue with the rest of the script

**RLS Policy errors**
- Make sure the schema (tables) was created first
- RLS policies depend on existing tables

**Authentication errors**
- Your anon key is working: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- If connection fails, check Supabase project status

### Verification

Run the test script to verify setup:
```bash
node test-setup.js
```

This will check:
- ✅ Database connection
- ✅ All required tables exist  
- ✅ Initial data is present

## 📋 What Gets Created

### Core Tables
- `organizations` - Company structure (Albaad International)
- `plants` - Global facilities (USA, Poland, Germany, Spain, Israel)
- `departments` - Departments per plant (Production, QA, R&D, etc.)
- `jobs` - Job roles and positions
- `user_profiles` - Extended user information

### Handover System
- `templates` - Handover templates
- `template_items` - Individual handover tasks
- `handovers` - Active handover processes
- `handover_progress` - Task completion tracking

### Dynamic System
- `categories` - Dynamic category system
- `item_types` - Flexible item type definitions
- `base_templates` - Template library with learning
- `adaptation_rules` - Context-aware template modification

### Supporting Tables
- `learning_insights` - AI learning data
- `audit_logs` - Change tracking
- `user_permissions` - Access control

## 🎯 Expected Result

After successful setup, your React app will show:
- Dashboard with handover pipeline
- Job wizard for creating handovers
- Template management system
- User authentication and roles

## 📞 Support

If you encounter issues:

1. **Check Supabase logs** in the dashboard for specific error messages
2. **Verify table creation** using the test script
3. **Re-run specific SQL sections** if needed
4. **Check browser console** for React app errors

## 🔑 Database Credentials

- **URL**: https://pjiqcpusjxfjuulojzhc.supabase.co
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNzMzNzIsImV4cCI6MjA1MDg0OTM3Mn0.vEG15zFRNcUwfzDHGcgLIlx4Qs9DWrCPjxkFCJIbmhw`

These are already configured in your `.env` file.

---

**🎉 Once setup is complete, your job-handoff system will be fully functional!**