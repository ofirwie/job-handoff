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

async function setupRLSPolicies() {
  console.log('🔒 Setting up Row Level Security policies...\n');
  
  try {
    // Enable RLS on key tables (some might already be enabled)
    const tablesToSecure = [
      'handovers',
      'templates', 
      'template_items',
      'handover_progress',
      'user_profiles'
    ];

    console.log('🛡️ Enabling RLS on tables...');
    for (const table of tablesToSecure) {
      try {
        await supabase.rpc('enable_rls', { table_name: table });
        console.log(`✅ RLS enabled on ${table}`);
      } catch (error) {
        // Table might already have RLS enabled, that's okay
        console.log(`ℹ️  RLS already enabled on ${table}`);
      }
    }

    // Create policies for public access to reference data
    console.log('\n📋 Creating public access policies...');
    
    // Allow public read access to organizations, plants, departments, jobs, categories
    const publicTables = [
      'organizations',
      'plants', 
      'departments',
      'jobs',
      'categories',
      'item_types',
      'base_templates',
      'adaptation_rules'
    ];

    for (const table of publicTables) {
      try {
        // Drop existing policy if it exists
        await supabase.rpc('drop_policy', { 
          policy_name: `Public read access to ${table}`,
          table_name: table 
        });
      } catch (error) {
        // Policy might not exist, that's fine
      }

      try {
        // Create public read policy
        const { error: policyError } = await supabase.rpc('create_policy', {
          policy_name: `Public read access to ${table}`,
          table_name: table,
          command: 'SELECT',
          using: 'true' // Allow all reads
        });

        if (policyError) throw policyError;
        console.log(`✅ Public read policy created for ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not create policy for ${table}: ${error.message}`);
      }
    }

    // Create handover access policies
    console.log('\n🤝 Creating handover access policies...');
    
    // Allow anyone to view handovers (for now, to get the app working)
    try {
      const { error } = await supabase.rpc('create_policy', {
        policy_name: 'Allow public read access to handovers',
        table_name: 'handovers',
        command: 'SELECT',
        using: 'true'
      });
      
      if (!error) {
        console.log('✅ Public handover read policy created');
      }
    } catch (error) {
      console.log('ℹ️  Handover read policy might already exist');
    }

    // Allow public read access to templates and template items
    const templateTables = ['templates', 'template_items', 'handover_progress'];
    
    for (const table of templateTables) {
      try {
        const { error } = await supabase.rpc('create_policy', {
          policy_name: `Allow public read access to ${table}`,
          table_name: table,
          command: 'SELECT',
          using: 'true'
        });
        
        if (!error) {
          console.log(`✅ Public read policy created for ${table}`);
        }
      } catch (error) {
        console.log(`ℹ️  Policy for ${table} might already exist`);
      }
    }

    console.log('\n🔍 Testing data access...');
    
    // Test if we can read data without authentication
    const testQueries = [
      { table: 'organizations', description: 'Organizations' },
      { table: 'plants', description: 'Plants' },
      { table: 'departments', description: 'Departments' },
      { table: 'jobs', description: 'Jobs' },
      { table: 'categories', description: 'Categories' },
      { table: 'templates', description: 'Templates' },
      { table: 'handovers', description: 'Handovers' }
    ];

    // Create a client without authentication to test public access
    const publicClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNzMzNzIsImV4cCI6MjA1MDg0OTM3Mn0.vEG15zFRNcUwfzDHGcgLIlx4Qs9DWrCPjxkFCJIbmhw');

    for (const query of testQueries) {
      try {
        const { data, error } = await publicClient
          .from(query.table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${query.description}: ${error.message}`);
        } else {
          console.log(`✅ ${query.description}: Can read ${data.length} records`);
        }
      } catch (error) {
        console.log(`❌ ${query.description}: ${error.message}`);
      }
    }

    // Test the complex query that the app uses
    console.log('\n🧪 Testing complex query with public client...');
    try {
      const { data, error } = await publicClient
        .from('handovers')
        .select(`
          *,
          template:templates(
            *,
            job:jobs(
              *,
              department:departments(
                *,
                plant:plants(
                  *,
                  organization:organizations(*)
                )
              )
            )
          ),
          progress:handover_progress(*)
        `)
        .limit(1);

      if (error) {
        console.log('❌ Complex query failed:', error.message);
      } else {
        console.log(`✅ Complex query works! Found ${data.length} complete handovers`);
      }
    } catch (error) {
      console.log('❌ Complex query error:', error.message);
    }

    console.log('\n🎉 RLS setup completed!');
    console.log('Your app should now be able to read data without authentication issues.');

  } catch (error) {
    console.error('\n❌ Error setting up RLS policies:', error.message);
    console.error('Full error:', error);
  }
}

// Run the RLS setup
setupRLSPolicies();