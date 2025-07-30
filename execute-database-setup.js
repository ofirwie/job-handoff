const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function executeSQLFile(filePath, description) {
  console.log(`\n📄 Executing ${description}...`);
  
  try {
    // Read SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();
    
    if (error) {
      // Try alternative method - direct query
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (!response.ok) {
        // Use Supabase REST API SQL endpoint
        const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sql',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=minimal'
          },
          body: sql
        });
        
        if (!sqlResponse.ok) {
          throw new Error(`SQL execution failed: ${sqlResponse.statusText}`);
        }
      }
    }
    
    console.log(`✅ ${description} executed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing ${description}:`, error.message);
    throw error;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup for Job Handoff System...\n');
  
  try {
    // Test connection first
    console.log('🔗 Testing Supabase connection...');
    const { data: tables, error: tablesError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (!tablesError) {
      console.log('⚠️  Database tables already exist. Skipping schema creation.');
    } else {
      // Execute SQL files in order
      const sqlFiles = [
        { path: './database/01_flexible_schema.sql', desc: 'Database Schema' },
        { path: './database/02_rls_policies.sql', desc: 'Security Policies' },
        { path: './database/03_initial_data.sql', desc: 'Initial Data' }
      ];
      
      // Since direct SQL execution via RPC might not be available,
      // let's create the tables using Supabase client
      console.log('📝 Creating database tables using Supabase client...');
      
      // We'll need to execute the SQL differently
      // Let's check if we can use the Supabase SQL Editor API
      const schemaSQL = fs.readFileSync('./database/01_flexible_schema.sql', 'utf8');
      const policiesSQL = fs.readFileSync('./database/02_rls_policies.sql', 'utf8');
      const dataSQL = fs.readFileSync('./database/03_initial_data.sql', 'utf8');
      
      // Combine all SQL
      const fullSQL = `
-- Combined SQL for Job Handoff System
${schemaSQL}

${policiesSQL}

${dataSQL}
`;
      
      // Write combined SQL for manual execution
      fs.writeFileSync('./EXECUTE_THIS_SQL.sql', fullSQL);
      
      console.log('\n⚠️  Direct SQL execution is not available via API.');
      console.log('📋 I have created EXECUTE_THIS_SQL.sql with all required SQL.');
      console.log('\n🔧 Alternative: Let me try to create tables programmatically...');
      
      // Try to create tables programmatically
      await createTablesProgmatically();
    }
    
    // Verify setup
    console.log('\n🔍 Verifying database setup...');
    await verifyDatabaseSetup();
    
    console.log('\n✅ Database setup process completed!');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('1. Go to: https://supabase.com/dashboard/project/pjiqcpusjxfjuulojzhc/sql');
    console.log('2. Copy contents of EXECUTE_THIS_SQL.sql');
    console.log('3. Paste and run in SQL Editor');
  }
}

async function createTablesProgmatically() {
  try {
    // Check if we can access auth.users
    const { data: authCheck, error: authError } = await supabase.auth.getUser();
    
    console.log('\n📊 Creating tables programmatically...');
    
    // Since we can't execute raw SQL, we need the SQL to be run manually
    console.log('❌ Cannot create tables via API - Supabase requires SQL Editor access');
    
    // Create a detailed instruction file
    const instructions = `
# Database Setup Instructions for Job Handoff System

## ⚠️ IMPORTANT: Manual SQL Execution Required

The Supabase JavaScript client cannot execute DDL (Data Definition Language) statements like CREATE TABLE.
You need to run the SQL manually in the Supabase SQL Editor.

## Steps to Complete Setup:

1. **Open Supabase SQL Editor**
   URL: https://supabase.com/dashboard/project/pjiqcpusjxfjuulojzhc/sql/new

2. **Copy the SQL**
   Open the file: EXECUTE_THIS_SQL.sql
   Copy ALL contents (Ctrl+A, then Ctrl+C)

3. **Paste and Run**
   - Paste the SQL into the SQL Editor (Ctrl+V)
   - Click the "Run" button
   - Wait for "Success" message

4. **Verify Setup**
   After running the SQL, your database will have:
   - 15 tables for the handoff system
   - Security policies configured
   - Sample data for Albaad International

## What This Creates:
- Organizations, Plants, Departments structure
- Job roles and templates system
- Handover tracking with progress
- Dynamic categories and adaptation rules
- Learning insights for AI improvement
- Complete audit logging

## Troubleshooting:
- If you see "relation already exists" errors, some tables were already created
- You can run the SQL multiple times safely
- Check the Table Editor to confirm tables were created

Once complete, your Job Handoff app will work properly!
`;
    
    fs.writeFileSync('./DATABASE_SETUP_INSTRUCTIONS.md', instructions);
    console.log('📄 Created DATABASE_SETUP_INSTRUCTIONS.md with detailed steps');
    
  } catch (error) {
    console.error('❌ Programmatic table creation failed:', error.message);
  }
}

async function verifyDatabaseSetup() {
  const tables = [
    'organizations',
    'plants', 
    'departments',
    'jobs',
    'user_profiles',
    'categories',
    'templates',
    'handovers'
  ];
  
  let missingTables = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        missingTables.push(table);
        console.log(`❌ Table '${table}' not found`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (error) {
      missingTables.push(table);
    }
  }
  
  if (missingTables.length > 0) {
    console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
    console.log('Please run the SQL manually as instructed above.');
  } else {
    console.log('\n🎉 All required tables exist!');
  }
}

// Run the setup
setupDatabase();