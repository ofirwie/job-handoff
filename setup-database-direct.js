import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration with service role key
const supabaseUrl = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY';

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLViaAPI(sql, description) {
  console.log(`\n📄 ${description}...`);
  
  try {
    // Use the Supabase Management API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/sql',
        'Prefer': 'return=minimal'
      },
      body: sql
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    console.log(`✅ ${description} completed!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    throw error;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup for Job Handoff System...');
  console.log('📍 Project: ' + supabaseUrl);

  try {
    // Read SQL files
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', '01_flexible_schema.sql'), 'utf8');
    const policiesSQL = fs.readFileSync(path.join(__dirname, 'database', '02_rls_policies.sql'), 'utf8');
    const dataSQL = fs.readFileSync(path.join(__dirname, 'database', '03_initial_data.sql'), 'utf8');

    // Since Supabase doesn't expose SQL execution via the JS client,
    // we need to use their SQL Editor or migrations
    console.log('\n⚠️  Direct SQL execution is not available via Supabase client.');
    console.log('🔧 Creating a consolidated SQL file and instructions...\n');

    // Create a single SQL file with everything
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullSQL = `-- Job Handoff System Database Setup
-- Generated: ${new Date().toISOString()}
-- Project: ${supabaseUrl}

-- ========================================
-- STEP 1: Database Schema
-- ========================================
${schemaSQL}

-- ========================================
-- STEP 2: Security Policies  
-- ========================================
${policiesSQL}

-- ========================================
-- STEP 3: Initial Data
-- ========================================
${dataSQL}

-- ========================================
-- Setup Complete!
-- ========================================
-- Your database now has:
-- ✅ 15 tables for the handoff system
-- ✅ Row Level Security policies
-- ✅ Sample data for Albaad International
-- ✅ Audit logging and triggers
`;

    // Save the complete SQL
    const sqlFileName = `SETUP_DATABASE_NOW_${timestamp}.sql`;
    fs.writeFileSync(path.join(__dirname, sqlFileName), fullSQL);

    // Create a simple HTML file that can execute the SQL
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Job Handoff Database Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Job Handoff Database Setup</h1>
    
    <div class="status info">
        <h3>⚠️ Manual Setup Required</h3>
        <p>The Supabase JavaScript client cannot execute DDL statements (CREATE TABLE, etc.)</p>
        <p>You must use the Supabase SQL Editor to set up the database.</p>
    </div>

    <h2>Option 1: Quick Setup (Recommended)</h2>
    <ol>
        <li>Open Supabase SQL Editor: 
            <a href="${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/${supabaseUrl.match(/https:\/\/([^.]+)/)[1]}/sql/new" target="_blank">Click here</a>
        </li>
        <li>Copy the SQL from: <code>${sqlFileName}</code></li>
        <li>Paste into SQL Editor and click "RUN"</li>
    </ol>

    <h2>Option 2: Use Supabase CLI</h2>
    <pre>
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Run migration
supabase db push --db-url "${supabaseUrl}" < ${sqlFileName}
    </pre>

    <h2>What This Creates:</h2>
    <ul>
        <li>15 database tables for job handoff management</li>
        <li>Row Level Security policies for data protection</li>
        <li>Sample data including Albaad International structure</li>
        <li>Audit logging for compliance</li>
    </ul>

    <div class="status success">
        <p>Once you run the SQL, your Job Handoff app will work immediately!</p>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(__dirname, 'SETUP_DATABASE.html'), htmlContent);

    console.log('📄 Created files:');
    console.log(`  1. ${sqlFileName} - Complete SQL script`);
    console.log(`  2. SETUP_DATABASE.html - Setup instructions`);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Open Supabase SQL Editor at:');
    console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/pjiqcpusjxfjuulojzhc/sql/new`);
    console.log(`2. Copy contents of ${sqlFileName}`);
    console.log('3. Paste and click RUN');
    console.log('\n✨ Your app will work immediately after running the SQL!');

    // Let's also try using fetch to the SQL endpoint
    console.log('\n🔄 Attempting direct SQL execution via API...');
    
    const projectRef = 'pjiqcpusjxfjuulojzhc';
    const sqlEndpoint = `https://${projectRef}.supabase.co/sql`;
    
    try {
      const response = await fetch(sqlEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: fullSQL
        })
      });
      
      if (response.ok) {
        console.log('✅ SQL executed successfully via API!');
      } else {
        console.log('❌ SQL API not available - manual execution required');
      }
    } catch (apiError) {
      console.log('❌ SQL API endpoint not accessible');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

// Run the setup
setupDatabase().catch(console.error);