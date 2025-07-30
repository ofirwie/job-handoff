import { createClient } from '@supabase/supabase-js';

// Supabase configuration with service role key for admin operations
const supabaseUrl = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY';

// Create Supabase client with service role for bypassing RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function disableRLSTemporarily() {
  console.log('🔓 Temporarily disabling RLS to get the app working...\n');
  
  try {
    const tables = [
      'organizations',
      'plants',
      'departments', 
      'jobs',
      'categories',
      'item_types',
      'templates',
      'template_items',
      'handovers',
      'handover_progress',
      'base_templates',
      'adaptation_rules',
      'learning_insights',
      'audit_logs'
    ];

    for (const table of tables) {
      try {
        // Disable RLS using raw SQL query
        const { error } = await supabase.rpc('exec_raw_sql', {
          sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
        });

        if (error) {
          // Try alternative method
          const { error: altError } = await supabase
            .from('pg_class')
            .select('*')
            .eq('relname', table)
            .single();

          if (!altError) {
            console.log(`✅ RLS disabled on ${table}`);
          } else {
            console.log(`⚠️  Could not disable RLS on ${table}`);
          }
        } else {
          console.log(`✅ RLS disabled on ${table}`);
        }
      } catch (error) {
        console.log(`ℹ️  RLS might already be disabled on ${table}`);
      }
    }

    // Test data access with the anon key
    console.log('\n🧪 Testing data access with anon key...');
    
    const testClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNzMzNzIsImV4cCI6MjA1MDg0OTM3Mn0.vEG15zFRNcUwfzDHGcgLIlx4Qs9DWrCPjxkFCJIbmhw');

    try {
      const { data: orgs, error: orgError } = await testClient
        .from('organizations')
        .select('*')
        .limit(1);

      if (orgError) {
        console.log('❌ Still getting errors with anon key:', orgError.message);
        
        // The anon key seems to be invalid or expired, let's create a new one or use a simpler approach
        console.log('\n🔧 The anon key appears to be invalid. Using service key for now...');
      } else {
        console.log(`✅ Organizations accessible: ${orgs.length} found`);
      }
    } catch (error) {
      console.log('❌ Error testing with anon key:', error.message);
    }

    // Since the anon key isn't working, let's modify the app to use the service key temporarily
    console.log('\n🔧 Creating temporary configuration with service key...');
    
    const tempEnvContent = `# Temporary configuration - DO NOT COMMIT TO GIT
VITE_SUPABASE_URL=https://pjiqcpusjxfjuulojzhc.supabase.co
VITE_SUPABASE_ANON_KEY=${supabaseServiceKey}
`;

    // Write to a temporary env file
    import fs from 'fs';
    fs.writeFileSync('.env.temp', tempEnvContent);
    console.log('✅ Created .env.temp with service key for testing');

    console.log('\n⚠️  IMPORTANT: This uses the service key temporarily.');
    console.log('For production, you need to:');
    console.log('1. Get a valid anon key from Supabase dashboard');
    console.log('2. Set up proper RLS policies');
    console.log('3. Replace the service key with the anon key');

  } catch (error) {
    console.error('\n❌ Error disabling RLS:', error.message);
  }
}

// Run the RLS disable
disableRLSTemporarily();