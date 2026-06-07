import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching max id...");
  const { data: maxIdData } = await supabase
    .from('properties')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  let nextId = maxIdData ? maxIdData.id + 1 : 1;

  const mockProperties = [
    {
      title: "Hermosa Casa en Barrio Norte",
      description: "Espectacular casa de dos pisos con un amplio jardín trasero, piscina y quincho. Excelente ubicación.",
      price: 150000,
      location: "La Plata",
      type: "Casa",
      status: "comprar",
      beds: 3,
      baths: 2,
      area: 120,
      images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"],
      is_active: true,
      is_featured: true,
    },
    {
      title: "Departamento Céntrico 2 Ambientes",
      description: "Departamento muy luminoso en pleno centro de la ciudad, cerca de facultades y transporte público.",
      price: 350,
      location: "La Plata",
      type: "Departamento",
      status: "alquilar",
      beds: 1,
      baths: 1,
      area: 45,
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"],
      is_active: true,
      is_featured: false,
    },
    {
      title: "Departamento Dúplex Moderno",
      description: "Moderno departamento tipo dúplex con balcón aterrazado y parrilla propia. Detalles de categoría.",
      price: 120000,
      location: "La Plata",
      type: "Departamento",
      status: "comprar",
      beds: 2,
      baths: 2,
      area: 85,
      images: ["https://images.unsplash.com/photo-1502672260266-1c1e5250a6db?auto=format&fit=crop&q=80&w=800"],
      is_active: true,
      is_featured: true,
    },
    {
      title: "Cochera Fija Cubierta",
      description: "Cochera cubierta en edificio céntrico con portón automático y seguridad 24hs. Muy fácil acceso.",
      price: 50,
      location: "La Plata",
      type: "Cochera",
      status: "alquilar",
      beds: 0,
      baths: 0,
      area: 12,
      images: ["https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?auto=format&fit=crop&q=80&w=800"],
      is_active: true,
      is_featured: false,
    },
    {
      title: "Moderna Casa de Estilo Minimalista",
      description: "Hermosa casa estilo minimalista en zona residencial. Grandes ventanales, losa radiante, cochera doble.",
      price: 210000,
      location: "La Plata",
      type: "Casa",
      status: "comprar",
      beds: 4,
      baths: 3,
      area: 250,
      images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"],
      is_active: true,
      is_featured: true,
    }
  ];

  for (let p of mockProperties) {
    console.log(`Inserting: ${p.title} (${p.type} - ${p.status})`);
    
    // Asignar id secuencial para evitar fallos si no auto incrementa en la tabla actual
    const payload = { ...p, id: nextId++ };
    
    const { error } = await supabase.from('properties').insert([payload]);
    if (error) {
      console.error("Error inserting:", error);
    } else {
      console.log("Success.");
    }
  }

  console.log("Done.");
}

main();
