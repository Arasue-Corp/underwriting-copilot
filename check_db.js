const { createClient } = require('./web/node_modules/@supabase/supabase-js');
require('./web/node_modules/dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: policies, error: pErr } = await supabase.from('policies').select('*');
  console.log('Policies in DB:', policies, pErr ? pErr : '');
  
  const { data: profiles, error: prErr } = await supabase.from('profiles').select('*');
  console.log('Profiles in DB:', profiles?.map(p => ({email: p.email, role: p.role, agency: p.agency_id})), prErr ? prErr : '');
}
run();
