import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function fixCoordinates() {
  const { data: properties } = await supabase.from('properties').select('id, latitude, longitude');
  
  if (!properties) return;

  for (const p of properties) {
    let lat = Number(p.latitude);
    let lng = Number(p.longitude);
    let needsFix = false;

    // Check if latitude is valid (-90 to 90)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      needsFix = true;
      // Random lat in La Plata: -34.90 to -34.94
      lat = -34.90 - (Math.random() * 0.04);
    }

    // Check if longitude is valid (-180 to 180)
    if (isNaN(lng) || lng < -180 || lng > 180) {
      needsFix = true;
      // Random lng in La Plata: -57.93 to -57.97
      lng = -57.93 - (Math.random() * 0.04);
    }

    if (needsFix) {
      console.log(`Fixing ${p.id}: [${p.latitude}, ${p.longitude}] -> [${lat}, ${lng}]`);
      await supabase
        .from('properties')
        .update({ latitude: String(lat), longitude: String(lng) })
        .eq('id', p.id);
    }
  }
  console.log('Fixed all invalid coordinates.');
}

fixCoordinates();
