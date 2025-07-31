const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://pjiqcpusjxfjuulojzhc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY'
);

async function simpleTest() {
  console.log('Testing simple handovers query...');
  
  try {
    const { data, error } = await supabase
      .from('handovers')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('✅ Success! Found', data.length, 'handovers');
    console.log('Sample:', data[0]);
    
  } catch (err) {
    console.error('Catch error:', err);
  }
}

simpleTest();