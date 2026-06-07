const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/properties/`;

async function main() {
  // Fetch properties from Supabase
  const { data: properties, error } = await supabase.from('properties').select('id, title, images').order('id', { ascending: true });
  
  if (error) {
    console.error("Error fetching properties:", error);
    return;
  }

  console.log(`Found ${properties.length} properties to update.`);

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    
    if (!property.images || property.images.length === 0) continue;

    // Convert local paths to Supabase Storage URLs
    const newImages = property.images.map(img => {
      if (img.startsWith('/fotos-inmobae-lucky/')) {
        const filename = img.replace('/fotos-inmobae-lucky/', '');
        return `${storageBaseUrl}${filename}`;
      }
      return img;
    });
    
    console.log(`Updating property ${property.id} (${property.title})...`);
    
    const { error: updateError } = await supabase
      .from('properties')
      .update({ images: newImages })
      .eq('id', property.id);
      
    if (updateError) {
      console.error(`Failed to update property ${property.id}:`, updateError);
    }
  }

  console.log("All properties updated with Supabase Storage URLs successfully!");
}

main();
