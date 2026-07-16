import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yqufghofmdcszlducncu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWZnaG9mbWRjc3psZHVjbmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNTkxNTEsImV4cCI6MjA5OTYzNTE1MX0.2Idgq3hRp3vdE9gA1xRvQ99H5Yq57uoVVx__cAf9RFU'
);

async function run() {
  const { data, error } = await supabase.from('appetite_matrix').select('carrier_name');
  if (error) console.error(error);
  
  const carriers = [...new Set(data.map(r => r.carrier_name))];
  console.log(carriers);
}

run();
