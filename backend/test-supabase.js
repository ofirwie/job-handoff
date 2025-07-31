const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://pjiqcpusjxfjuulojzhc.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY'
);

async function checkDatabase() {
  console.log('Checking existing database structure...');
  
  // Check what tables exist by trying to query common table names
  const tablesToCheck = ['users', 'handovers', 'templates', 'handover_tasks', 'jobs', 'job_transitions', 'employee_profiles', 'profiles', 'organizations', 'departments'];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`✅ Table ${table} exists`);
        if (data && data.length > 0) {
          console.log(`   Sample record:`, data[0]);
        } else {
          console.log(`   No records yet`);
        }
      } else {
        console.log(`❌ Table ${table} error: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Table ${table} error: ${err.message}`);
    }
  }
}

checkDatabase().catch(console.error);