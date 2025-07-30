#!/usr/bin/env node

/**
 * Creates a consolidated SQL file for easy manual execution
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SQL files to process in order
const SQL_FILES = [
  '01_flexible_schema.sql',
  '02_rls_policies.sql', 
  '03_initial_data.sql'
];

function createConsolidatedSql() {
  console.log('🔄 Creating consolidated SQL file...');
  
  let consolidatedSql = `-- ====================================================================
-- JOB HANDOFF PROJECT - CONSOLIDATED DATABASE SETUP
-- ====================================================================
-- Generated on: ${new Date().toISOString()}
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/pjiqcpusjxfjuulojzhc/sql
-- 2. Copy this entire file content
-- 3. Paste into the SQL Editor
-- 4. Click "Run" to execute all statements
-- 5. Check for any errors and resolve them
-- 6. Test your React app: npm run dev
-- 
-- NOTE: Some statements may fail if already executed - this is normal
-- ====================================================================

`;

  SQL_FILES.forEach((filename, index) => {
    console.log(`📄 Processing ${filename}...`);
    
    const sqlPath = join(__dirname, 'database', filename);
    const content = readFileSync(sqlPath, 'utf-8');
    
    consolidatedSql += `
-- ====================================================================
-- ${index + 1}. ${filename.toUpperCase()}
-- ====================================================================
-- File: database/${filename}
-- Description: ${getFileDescription(filename)}
-- ====================================================================

${content}

-- ====================================================================
-- END OF ${filename.toUpperCase()}
-- ====================================================================

`;
  });
  
  consolidatedSql += `
-- ====================================================================
-- SETUP COMPLETE
-- ====================================================================
-- 
-- If all statements executed successfully, your database should now have:
-- 
-- ✅ Core Tables:
--    • organizations, plants, departments, jobs
--    • user_profiles, categories, item_types
--    • base_templates, templates, template_items
--    • handovers, handover_progress
--    • learning_insights, audit_logs, user_permissions
-- 
-- ✅ Security Policies:
--    • Row Level Security enabled on sensitive tables
--    • Role-based access controls configured
-- 
-- ✅ Initial Data:
--    • Albaad organization structure
--    • Default categories and item types
--    • Sample templates and adaptation rules
-- 
-- 🚀 Next Steps:
--    1. Test your React app: npm run dev
--    2. The white screen issue should be resolved
--    3. You can now create handovers and templates
-- 
-- ❓ If you encounter issues:
--    • Check the Supabase logs for specific error messages
--    • Some CREATE EXTENSION commands may fail if already installed
--    • RLS policies may fail if tables don't exist - execute schema first
-- 
-- ====================================================================
`;
  
  // Write consolidated file
  const outputPath = join(__dirname, 'CONSOLIDATED_DATABASE_SETUP.sql');
  writeFileSync(outputPath, consolidatedSql, 'utf-8');
  
  console.log(`✅ Consolidated SQL file created: ${outputPath}`);
  console.log(`📊 Total size: ${(consolidatedSql.length / 1024).toFixed(1)} KB`);
  
  return outputPath;
}

function getFileDescription(filename) {
  const descriptions = {
    '01_flexible_schema.sql': 'Creates all database tables, indexes, and constraints',
    '02_rls_policies.sql': 'Sets up Row Level Security policies for data access control',
    '03_initial_data.sql': 'Inserts sample data including organizations, categories, and templates'
  };
  return descriptions[filename] || 'Database setup file';
}

function showInstructions(outputPath) {
  console.log(`\n${'🎯 SETUP INSTRUCTIONS'.padEnd(60, '=')}}`);
  console.log(`\n1️⃣  Open the consolidated SQL file:`);
  console.log(`   ${outputPath}`);
  
  console.log(`\n2️⃣  Copy all contents (Ctrl+A, Ctrl+C)`);
  
  console.log(`\n3️⃣  Open Supabase SQL Editor:`);
  console.log(`   https://supabase.com/dashboard/project/pjiqcpusjxfjuulojzhc/sql`);
  
  console.log(`\n4️⃣  Paste and execute:`);
  console.log(`   • Paste the SQL (Ctrl+V)`);
  console.log(`   • Click "Run" button`);
  console.log(`   • Wait for execution to complete`);
  console.log(`   • Check for any error messages`);
  
  console.log(`\n5️⃣  Test your React app:`);
  console.log(`   cd F:\\git\\job-handoff-project`);
  console.log(`   npm run dev`);
  console.log(`   • The white screen should be resolved`);
  console.log(`   • You should see the job handoff interface`);
  
  console.log(`\n✨ Alternative: Use the HTML setup tool:`);
  console.log(`   Open: F:\\git\\job-handoff-project\\database-setup.html`);
  console.log(`   Follow the step-by-step guided process`);
  
  console.log(`\n${''.padEnd(60, '=')}`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const outputPath = createConsolidatedSql();
    showInstructions(outputPath);
  } catch (error) {
    console.error('❌ Error creating consolidated SQL:', error.message);
    process.exit(1);
  }
}