import { createClient } from '@supabase/supabase-js';

// Test both service key and anon key
const supabaseUrl = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNzMzNzIsImV4cCI6MjA1MDg0OTM3Mn0.vEG15zFRNcUwfzDHGcgLIlx4Qs9DWrCPjxkFCJIbmhw';

async function testSetup() {
  console.log('🧪 Testing Job Handoff System Setup...\n');

  // Test with service key
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  console.log('🔧 Testing with service key (admin access)...');

  try {
    const { data: orgs, error: orgError } = await adminClient
      .from('organizations')
      .select('*')
      .limit(1);

    if (orgError) {
      console.log('❌ Service key failed:', orgError.message);
    } else {
      console.log(`✅ Service key works: ${orgs.length} organizations found`);
    }
  } catch (error) {
    console.log('❌ Service key error:', error.message);
  }

  // Test with anon key (what the app will use)
  const appClient = createClient(supabaseUrl, supabaseAnonKey);
  console.log('\n🌐 Testing with anon key (app access)...');

  const testTables = [
    { name: 'organizations', description: 'Organizations' },
    { name: 'plants', description: 'Plants' },
    { name: 'departments', description: 'Departments' },
    { name: 'jobs', description: 'Jobs' },
    { name: 'categories', description: 'Categories' },
    { name: 'templates', description: 'Templates' },
    { name: 'handovers', description: 'Handovers' }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const table of testTables) {
    try {
      const { data, error } = await appClient
        .from(table.name)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table.description}: ${error.message}`);
        failCount++;
      } else {
        console.log(`✅ ${table.description}: ${data.length} records accessible`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ ${table.description}: ${error.message}`);
      failCount++;
    }
  }

  // Test the complex query that the app actually uses
  console.log('\n🔍 Testing complex handover query (what the app uses)...');
  try {
    const { data, error } = await appClient
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
      
      // Try simpler fallback query
      console.log('🔄 Trying fallback simple query...');
      const { data: simpleData, error: simpleError } = await appClient
        .from('handovers')
        .select('*')
        .limit(1);

      if (simpleError) {
        console.log('❌ Simple fallback also failed:', simpleError.message);
      } else {
        console.log(`✅ Simple fallback works: ${simpleData.length} handovers found`);
      }
    } else {
      console.log(`✅ Complex query works! ${data.length} complete handovers with relations`);
    }
  } catch (error) {
    console.log('❌ Query test error:', error.message);
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Successful table access: ${successCount}/${testTables.length}`);
  console.log(`❌ Failed table access: ${failCount}/${testTables.length}`);

  if (successCount === testTables.length) {
    console.log('\n🎉 SUCCESS: All tests passed! Your app should work now.');
    console.log('\n🚀 Next steps:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Open http://localhost:8094 (or whatever port Vite assigns)');
    console.log('3. You should see the Job Handoff dashboard instead of white screen');
  } else if (successCount > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS: Some tables accessible, app might work with fallbacks');
  } else {
    console.log('\n❌ FAILURE: No tables accessible. Check Supabase configuration.');
  }

  // Check data counts
  console.log('\n📈 Data Summary:');
  try {
    const counts = {};
    for (const table of testTables) {
      try {
        const { count, error } = await adminClient
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          counts[table.name] = count;
        }
      } catch (error) {
        counts[table.name] = 'Error';
      }
    }

    Object.entries(counts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} records`);
    });
  } catch (error) {
    console.log('Could not get data counts');
  }
}

// Run the test
testSetup().catch(console.error);