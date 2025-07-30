#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * This script will help set up the database schema by providing instructions
 * and attempting automated execution where possible.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUPABASE_URL = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNzMzNzIsImV4cCI6MjA1MDg0OTM3Mn0.vEG15zFRNcUwfzDHGcgLIlx4Qs9DWrCPjxkFCJIbmhw';

const SQL_FILES = [
  '01_flexible_schema.sql',
  '02_rls_policies.sql', 
  '03_initial_data.sql'
];

/**
 * Read and display SQL file contents
 */
function displaySqlFile(filename) {
  const sqlPath = join(__dirname, 'database', filename);
  const content = readFileSync(sqlPath, 'utf-8');
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 ${filename}`);
  console.log(`${'='.repeat(60)}`);
  console.log(content);
  console.log(`${'='.repeat(60)}\n`);
  
  return content;
}

/**
 * Test Supabase connection using fetch
 */
async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
      return true;
    } else {
      console.log(`❌ Connection failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
    return false;
  }
}

/**
 * Attempt to execute SQL via Supabase Edge Functions or direct API
 */
async function executeSqlViaAPI(sqlContent, filename) {
  try {
    console.log(`🔄 Attempting to execute ${filename} via API...`);
    
    // Try using the SQL endpoint if available
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql: sqlContent })
    });

    if (response.ok) {
      console.log(`✅ ${filename} executed successfully via API`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`⚠️  API execution failed for ${filename}: ${response.status}`);
      console.log(`   Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️  API execution error for ${filename}: ${error.message}`);
    return false;
  }
}

/**
 * Generate a consolidated SQL file for manual execution
 */
function generateConsolidatedSql() {
  console.log('\n📝 Generating consolidated SQL file for manual execution...');
  
  let consolidatedSql = `-- CONSOLIDATED SQL FOR JOB HANDOFF PROJECT DATABASE SETUP
-- Generated on: ${new Date().toISOString()}
-- Execute this entire script in Supabase SQL Editor
-- URL: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql

`;

  SQL_FILES.forEach((filename, index) => {
    const sqlPath = join(__dirname, 'database', filename);
    const content = readFileSync(sqlPath, 'utf-8');
    
    consolidatedSql += `
-- ============================================================================
-- ${index + 1}. ${filename}
-- ============================================================================

${content}

-- End of ${filename}
-- ============================================================================

`;
  });
  
  // Write consolidated file
  const consolidatedPath = join(__dirname, 'database_setup_consolidated.sql');
  try {
    import('fs').then(fs => {
      fs.writeFileSync(consolidatedPath, consolidatedSql);
      console.log(`✅ Consolidated SQL saved to: ${consolidatedPath}`);
    });
  } catch (error) {
    console.log(`⚠️  Could not save consolidated file: ${error.message}`);
  }
  
  return consolidatedSql;
}

/**
 * Show manual execution instructions
 */
function showManualInstructions() {
  console.log(`\n${'🔧 MANUAL SETUP INSTRUCTIONS'.padEnd(60, '🔧')}`);
  console.log(`\n📋 Since automated execution has limitations with DDL operations,`);
  console.log(`   please follow these steps to set up your database:`);
  
  console.log(`\n1️⃣  Open Supabase Dashboard:`);
  console.log(`   ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}`);
  
  console.log(`\n2️⃣  Navigate to SQL Editor:`);
  console.log(`   Click "SQL Editor" in the left sidebar`);
  
  console.log(`\n3️⃣  Execute SQL files in order:`);
  SQL_FILES.forEach((file, index) => {
    console.log(`   ${index + 1}. Copy contents of database/${file} and execute`);
  });
  
  console.log(`\n4️⃣  Verify setup:`);
  console.log(`   After execution, you should see these tables created:`);
  console.log(`   • organizations, plants, departments, jobs`);
  console.log(`   • user_profiles, categories, item_types`);
  console.log(`   • base_templates, templates, template_items`);
  console.log(`   • handovers, handover_progress`);
  console.log(`   • learning_insights, audit_logs, user_permissions`);
  
  console.log(`\n5️⃣  Test your React app:`);
  console.log(`   cd ${__dirname}`);
  console.log(`   npm run dev`);
  console.log(`   The white screen issue should be resolved!`);
  
  console.log(`\n💡 Alternative: Use the consolidated SQL file generated above`);
  console.log(`   Copy all contents from database_setup_consolidated.sql`);
  console.log(`   Paste into Supabase SQL Editor and execute once`);
}

/**
 * Main setup function
 */
async function main() {
  console.log('🚀 JOB HANDOFF PROJECT - DATABASE SETUP');
  console.log('==========================================');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using anon key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  
  // Test connection
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed without valid Supabase connection');
    console.log('   Please check your SUPABASE_URL and SUPABASE_ANON_KEY');
    return;
  }
  
  // Generate consolidated SQL for manual execution
  const consolidatedSql = generateConsolidatedSql();
  
  // Attempt automated execution for each file
  console.log('\n🤖 Attempting automated execution...');
  let automatedSuccess = 0;
  let automatedFailed = 0;
  
  for (const filename of SQL_FILES) {
    const sqlPath = join(__dirname, 'database', filename);
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    const success = await executeSqlViaAPI(sqlContent, filename);
    if (success) {
      automatedSuccess++;
    } else {
      automatedFailed++;
    }
  }
  
  console.log(`\n📊 Automated Execution Results:`);
  console.log(`   ✅ Successful: ${automatedSuccess}/${SQL_FILES.length}`);
  console.log(`   ❌ Failed: ${automatedFailed}/${SQL_FILES.length}`);
  
  if (automatedFailed > 0) {
    console.log(`\n⚠️  Some files could not be executed automatically.`);
    console.log(`   This is normal for DDL operations with anon keys.`);
    showManualInstructions();
  } else {
    console.log(`\n🎉 All files executed successfully!`);
    console.log(`\n✅ Your database should now be ready.`);
    console.log(`   Test your React app with: npm run dev`);
  }
  
  // Always show the file contents for reference
  console.log(`\n📚 SQL FILE CONTENTS (for reference):`);
  SQL_FILES.forEach(filename => {
    displaySqlFile(filename);
  });
}

// Run the setup
main().catch(console.error);