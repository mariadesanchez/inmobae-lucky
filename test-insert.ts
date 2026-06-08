import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function testInsert() {
  const { data, error } = await supabase.from('property_transactions').insert([
    {
      property_id: "81",
      operation_type: "venta",
      price: 50,
      operation_date: new Date().toISOString()
    }
  ]);
  console.log("Error:", error);
}

testInsert();
