import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse Supabase connection string from URL
const supabaseUrl = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const projectRef = 'pjiqcpusjxfjuulojzhc';

// Supabase database connection - using service role for full access
const connectionString = `postgresql://postgres.${projectRef}:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;

async function createTables() {
  const client = new pg.Client({
    connectionString: connectionString,
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read SQL files
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', '01_flexible_schema.sql'), 'utf8');
    const policiesSQL = fs.readFileSync(path.join(__dirname, 'database', '02_rls_policies.sql'), 'utf8');
    const dataSQL = fs.readFileSync(path.join(__dirname, 'database', '03_initial_data.sql'), 'utf8');

    // Execute schema creation
    console.log('📊 Creating database schema...');
    await client.query(schemaSQL);
    console.log('✅ Database schema created!\n');

    // Execute RLS policies
    console.log('🔒 Setting up security policies...');
    await client.query(policiesSQL);
    console.log('✅ Security policies created!\n');

    // Execute initial data
    console.log('📝 Inserting initial data...');
    await client.query(dataSQL);
    console.log('✅ Initial data inserted!\n');

    // Verify tables were created
    console.log('🔍 Verifying database setup...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('Your Job Handoff app should now work properly.');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
  }
}

// First check if pg is installed
import { execSync } from 'child_process';

try {
  console.log('📦 Installing pg package...');
  execSync('npm install pg', { stdio: 'inherit' });
  console.log('✅ pg package installed\n');
} catch (error) {
  console.log('⚠️  Could not install pg automatically');
}

// Run the setup
createTables().catch(console.error);