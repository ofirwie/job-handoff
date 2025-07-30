#!/usr/bin/env node

/**
 * Database Setup Script for Job Handoff Project
 * Executes SQL files against Supabase database in correct order
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES module setup for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment variables
const SUPABASE_URL = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNzMzNzIsImV4cCI6MjA1MDg0OTM3Mn0.vEG15zFRNcUwfzDHGcgLIlx4Qs9DWrCPjxkFCJIbmhw';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// SQL files to execute in order
const SQL_FILES = [
  '01_flexible_schema.sql',
  '02_rls_policies.sql', 
  '03_initial_data.sql'
];

/**
 * Execute SQL file against Supabase database
 */
async function executeSqlFile(filename) {
  try {
    console.log(`\n🔄 Executing ${filename}...`);
    
    // Read SQL file
    const sqlPath = join(__dirname, 'database', filename);
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolons and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) {
        continue;
      }
      
      try {
        // Use the RPC function to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          // Try direct query execution as fallback
          const { error: queryError } = await supabase
            .from('_temp_placeholder')
            .select('*')
            .limit(0);
          
          // If that also fails, use the PostgreSQL REST API approach
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ sql_query: statement + ';' })
          });
          
          if (!response.ok) {
            console.log(`   ⚠️  Statement ${i + 1}: ${error.message || 'Unknown error'}`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (execError) {
        console.log(`   ⚠️  Statement ${i + 1}: ${execError.message}`);
        errorCount++;
      }
    }
    
    console.log(`✅ ${filename} completed: ${successCount} successful, ${errorCount} errors`);
    return { successCount, errorCount };
    
  } catch (error) {
    console.error(`❌ Failed to execute ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Alternative approach: Execute SQL via Supabase SQL Editor API
 */
async function executeSqlViaAPI(filename) {
  try {
    console.log(`\n🔄 Executing ${filename} via API...`);
    
    // Read SQL file
    const sqlPath = join(__dirname, 'database', filename);
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // Use Supabase Management API (if available) or direct PostgreSQL connection
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sql',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      },
      body: sqlContent
    });
    
    if (response.ok) {
      console.log(`✅ ${filename} executed successfully`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ ${filename} failed:`, errorText);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Failed to execute ${filename}:`, error.message);
    return false;
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Try to fetch from a system table that should always exist
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

/**
 * Verify schema creation
 */
async function verifySchema() {
  try {
    console.log('\n🔍 Verifying database schema...');
    
    // Check if key tables exist
    const tablesToCheck = [
      'organizations',
      'plants', 
      'departments',
      'jobs',
      'user_profiles',
      'categories',
      'item_types',
      'base_templates',
      'templates',
      'template_items',
      'handovers',
      'handover_progress'
    ];
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', tablesToCheck);
    
    if (error) {
      console.error('❌ Schema verification failed:', error.message);
      return false;
    }
    
    const foundTables = data.map(row => row.table_name);
    const missingTables = tablesToCheck.filter(table => !foundTables.includes(table));
    
    console.log(`✅ Found ${foundTables.length}/${tablesToCheck.length} expected tables`);
    
    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
    }
    
    return missingTables.length === 0;
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    return false;
  }
}

/**
 * Main setup function 
 */
async function setupDatabase() {
  console.log('🚀 Starting database setup for Job Handoff Project');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  
  try {
    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      throw new Error('Database connection failed');
    }
    
    // Execute SQL files in order
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (const filename of SQL_FILES) {
      try {
        // Try primary method first
        const result = await executeSqlFile(filename);
        totalSuccess += result.successCount;
        totalErrors += result.errorCount;
      } catch (error) {
        console.log(`   Trying alternative method for ${filename}...`);
        
        // Try alternative API method
        const success = await executeSqlViaAPI(filename);
        if (success) {
          totalSuccess++;
        } else {
          totalErrors++;
        }
      }
    }
    
    console.log(`\n📊 Setup Summary:`);
    console.log(`   ✅ Total successful operations: ${totalSuccess}`);
    console.log(`   ⚠️  Total errors: ${totalErrors}`);
    
    // Verify the schema was created
    const schemaOk = await verifySchema();
    
    if (schemaOk) {
      console.log('\n🎉 Database setup completed successfully!');
      console.log('   Your job-handoff React app should now work properly.');
    } else {
      console.log('\n⚠️  Database setup completed with some issues.');
      console.log('   Some tables may be missing. Check the logs above.');
    }
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase, testConnection, verifySchema };