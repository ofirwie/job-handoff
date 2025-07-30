import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLStatements(sqlContent) {
  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const statement of statements) {
    try {
      // Skip empty statements
      if (!statement || statement.length < 5) continue;
      
      // Use Supabase admin API to execute SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query: statement + ';'
        })
      });
      
      if (response.ok) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      errorCount++;
    }
  }
  
  return { successCount, errorCount, total: statements.length };
}

async function setupDatabase() {
  console.log('🚀 Starting database setup for Job Handoff System...\n');
  
  try {
    // First, let's check what tables already exist
    console.log('🔍 Checking existing tables...');
    
    // Try to query information schema
    const { data: existingTables, error: schemaError } = await supabase
      .rpc('get_tables', {})
      .single();
    
    if (schemaError) {
      console.log('ℹ️  Cannot query existing tables via RPC');
    }
    
    // Read SQL files
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', '01_flexible_schema.sql'), 'utf8');
    const policiesSQL = fs.readFileSync(path.join(__dirname, 'database', '02_rls_policies.sql'), 'utf8');
    const dataSQL = fs.readFileSync(path.join(__dirname, 'database', '03_initial_data.sql'), 'utf8');
    
    // Since Supabase doesn't allow direct DDL execution via client library,
    // we need to use their Migration API or SQL Editor
    
    console.log('\n📝 Attempting to set up database using Supabase Management API...');
    
    // Try using Supabase Management API
    const migrationResponse = await fetch(`https://api.supabase.com/v1/projects/${getProjectId(supabaseUrl)}/database/migrations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'job_handoff_setup',
        up: schemaSQL + '\n\n' + policiesSQL + '\n\n' + dataSQL
      })
    });
    
    if (!migrationResponse.ok) {
      console.log('❌ Cannot execute via Management API');
      
      // Alternative: Create tables that we can via the client
      console.log('\n🔧 Attempting alternative setup method...');
      await alternativeSetup();
    } else {
      console.log('✅ Migration created successfully');
    }
    
    // Create combined SQL file for manual execution
    const fullSQL = `-- Job Handoff System Complete Database Setup
-- Generated at: ${new Date().toISOString()}
-- Supabase Project: ${supabaseUrl}

-- IMPORTANT: Run this entire script in Supabase SQL Editor
-- URL: ${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/${getProjectId(supabaseUrl)}/sql/new

${schemaSQL}

-- Security Policies
${policiesSQL}

-- Initial Data
${dataSQL}
`;
    
    fs.writeFileSync(path.join(__dirname, 'EXECUTE_THIS_SQL.sql'), fullSQL);
    console.log('\n📄 Created EXECUTE_THIS_SQL.sql for manual execution');
    
    // Verify what we can
    await verifyDatabaseSetup();
    
  } catch (error) {
    console.error('\n❌ Setup error:', error.message);
    createManualInstructions();
  }
}

function getProjectId(url) {
  // Extract project ID from Supabase URL
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

async function alternativeSetup() {
  console.log('🔄 Checking what can be accessed...');
  
  // Test various table access
  const testTables = ['organizations', 'plants', 'departments', 'templates', 'handovers'];
  const existingTables = [];
  const missingTables = [];
  
  for (const table of testTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        missingTables.push(table);
      } else {
        existingTables.push(table);
      }
    } catch {
      missingTables.push(table);
    }
  }
  
  console.log(`✅ Existing tables: ${existingTables.length > 0 ? existingTables.join(', ') : 'None'}`);
  console.log(`❌ Missing tables: ${missingTables.length > 0 ? missingTables.join(', ') : 'None'}`);
  
  if (missingTables.length > 0) {
    console.log('\n⚠️  Database tables need to be created manually');
  }
}

async function verifyDatabaseSetup() {
  console.log('\n🔍 Verifying database setup...');
  
  const criticalTables = [
    { name: 'organizations', description: 'Company structure' },
    { name: 'plants', description: 'Manufacturing facilities' },
    { name: 'departments', description: 'Organizational units' },
    { name: 'jobs', description: 'Job roles' },
    { name: 'templates', description: 'Handover templates' },
    { name: 'handovers', description: 'Active handovers' },
    { name: 'categories', description: 'Content categories' }
  ];
  
  let successCount = 0;
  
  for (const table of criticalTables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`✅ ${table.name}: Ready (${table.description})`);
        successCount++;
      } else {
        console.log(`❌ ${table.name}: Not found - ${table.description}`);
      }
    } catch {
      console.log(`❌ ${table.name}: Error checking`);
    }
  }
  
  const setupComplete = successCount === criticalTables.length;
  
  if (setupComplete) {
    console.log('\n🎉 Database is fully set up and ready!');
  } else {
    console.log(`\n⚠️  Database setup incomplete: ${successCount}/${criticalTables.length} tables ready`);
  }
  
  return setupComplete;
}

function createManualInstructions() {
  const instructions = `
# 🚨 URGENT: Manual Database Setup Required

The Job Handoff app is showing a white screen because the database tables don't exist.

## Quick Fix (2 minutes):

1. **Open Supabase SQL Editor**
   Click this link: https://supabase.com/dashboard/project/pjiqcpusjxfjuulojzhc/sql/new

2. **Run the SQL**
   - Open the file: EXECUTE_THIS_SQL.sql (in this directory)
   - Copy ALL contents (Ctrl+A, then Ctrl+C)
   - Paste into SQL Editor (Ctrl+V)
   - Click "RUN" button

3. **Done!**
   Your app will work immediately after the SQL runs.

## What This Creates:
- Complete database schema for job handoffs
- Security policies for data access
- Sample data for Albaad International

## Alternative Method:
If the above doesn't work, run these 3 files separately in order:
1. database/01_flexible_schema.sql
2. database/02_rls_policies.sql  
3. database/03_initial_data.sql

## Need Help?
The white screen is caused by missing database tables.
Once you run the SQL, the app will connect and display properly.
`;
  
  fs.writeFileSync(path.join(__dirname, 'FIX_WHITE_SCREEN_NOW.md'), instructions);
  console.log('\n📋 Created FIX_WHITE_SCREEN_NOW.md with urgent instructions');
}

// Run setup
setupDatabase();