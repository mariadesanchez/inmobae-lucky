const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wquslglghacreabyafho.supabase.co',
  'sb_publishable_sVoSsy09ITn_94D1JnGWNg_m8I8a_7m'
);

async function test() {
  // Test 1: ilike exacto
  const { data: d1, count: c1 } = await supabase
    .from('properties')
    .select('id, title, type, location', { count: 'exact' })
    .eq('is_active', true)
    .ilike('type', 'Departamento')
    .limit(5);
  console.log('=== ilike exacto "Departamento" ===');
  console.log('Count:', c1);
  d1?.forEach(r => console.log(`  id:${r.id} type:"${r.type}" loc:"${r.location}"`));

  // Test 2: eq exacto
  const { data: d2, count: c2 } = await supabase
    .from('properties')
    .select('id, title, type, location', { count: 'exact' })
    .eq('is_active', true)
    .eq('type', 'Departamento')
    .limit(5);
  console.log('\n=== eq exacto "Departamento" ===');
  console.log('Count:', c2);
  d2?.forEach(r => console.log(`  id:${r.id} type:"${r.type}" loc:"${r.location}"`));

  // Test 3: tipos distintos en la db
  const { data: d3 } = await supabase
    .from('properties')
    .select('type')
    .eq('is_active', true)
    .limit(200);
  const uniqueTypes = [...new Set(d3?.map(r => r.type))];
  console.log('\n=== Tipos distintos en DB ===');
  console.log(uniqueTypes);
}

test().catch(console.error);
