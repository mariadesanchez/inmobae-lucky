const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const imageDir = path.join(__dirname, 'public', 'fotos-inmobae-lucky');

async function main() {
  const files = fs.readdirSync(imageDir).filter(file => file.endsWith('.jpg') || file.endsWith('.avif'));
  
  // Create logical groups based on prefixes
  const groups = {
    group_6974113: files.filter(f => f.startsWith('6974113_')),
    group_7071163: files.filter(f => f.startsWith('7071163_')),
    group_aes: files.filter(f => f.startsWith('aes-')),
    group_clay: files.filter(f => f.startsWith('clay-banks-')),
    group_dan: files.filter(f => f.startsWith('dan-burton-')),
    group_david: files.filter(f => f.startsWith('david-walker-')),
    group_foto: files.filter(f => f.startsWith('fotografias-inmobiliarias-')),
    group_francesca: files.filter(f => f.startsWith('francesca-tosolini-')),
    group_lotus: files.filter(f => f.startsWith('lotus-design-n-print-')),
    group_point3d: files.filter(f => f.startsWith('point3d-commercial-imaging-ltd-')),
    group_mikita: files.filter(f => f.startsWith('mikita-yo-')),
    group_steven: files.filter(f => f.startsWith('steven-ungermann-')),
    group_bernard: files.filter(f => f.startsWith('bernard-hermant-')),
  };

  // Collect any files that aren't in a group
  const groupedFiles = new Set(Object.values(groups).flat());
  const singleFiles = files.filter(f => !groupedFiles.has(f));

  // Convert files to URLs
  const toUrls = (filenames) => filenames.map(f => `/fotos-inmobae-lucky/${f}`);

  const imageSets = Object.values(groups).map(toUrls);
  
  // Add single files as 1-image sets
  for (const f of singleFiles) {
    imageSets.push(toUrls([f]));
  }

  // Fetch properties from Supabase
  const { data: properties, error } = await supabase.from('properties').select('id, title').order('id', { ascending: true });
  
  if (error) {
    console.error("Error fetching properties:", error);
    return;
  }

  console.log(`Found ${properties.length} properties to update.`);

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    // Assign a set of images to this property (cycling through sets if necessary)
    const imageSet = imageSets[i % imageSets.length];
    
    console.log(`Updating property ${property.id} (${property.title}) with ${imageSet.length} images...`);
    
    const { error: updateError } = await supabase
      .from('properties')
      .update({ images: imageSet })
      .eq('id', property.id);
      
    if (updateError) {
      console.error(`Failed to update property ${property.id}:`, updateError);
    }
  }

  console.log("All properties updated successfully!");
}

main();
