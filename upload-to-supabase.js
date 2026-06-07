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
  
  // Limitar a 50 fotos
  const filesToUpload = files.slice(0, 50);
  
  console.log(`Encontradas ${files.length} fotos. Subiendo ${filesToUpload.length} fotos al bucket 'properties' de Supabase...`);
  
  let successCount = 0;
  
  for (const file of filesToUpload) {
    const filePath = path.join(imageDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    // Check if it already exists
    const { data: existingData } = await supabase.storage.from('properties').list('', { search: file });
    if (existingData && existingData.length > 0) {
      console.log(`La foto ${file} ya existe en Supabase, omitiendo...`);
      continue;
    }
    
    console.log(`Subiendo ${file}...`);
    const { data, error } = await supabase.storage
      .from('properties')
      .upload(file, fileBuffer, {
        contentType: file.endsWith('.avif') ? 'image/avif' : 'image/jpeg',
        upsert: true
      });
      
    if (error) {
      console.error(`Error subiendo ${file}:`, error.message);
    } else {
      successCount++;
    }
  }
  
  console.log(`\n¡Proceso terminado! Se subieron ${successCount} fotos nuevas exitosamente a Supabase Storage.`);
}

main();
