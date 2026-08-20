import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yqufghofmdcszlducncu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWZnaG9mbWRjc3psZHVjbmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNTkxNTEsImV4cCI6MjA5OTYzNTE1MX0.2Idgq3hRp3vdE9gA1xRvQ99H5Yq57uoVVx__cAf9RFU'
);

async function run() {
  const { data, error } = await supabase.from('carriers').select('*').limit(1);
  if (error) {
    console.error("Error or table doesn't exist:", error.message);
  } else {
    console.log("Table 'carriers' exists!", data);
  }
}

run();
