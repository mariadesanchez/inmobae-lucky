-- MIGRACIÓN DE BASE DE DATOS: COLUMNA 'image' A 'images' EN TABLA 'properties'
-- Ejecuta este script en el editor SQL de tu panel de Supabase (https://supabase.com)

-- 1. Agregar la columna 'images' como un array de textos (text[]) si no existe
ALTER TABLE properties ADD COLUMN IF NOT EXISTS images text[];

-- 2. Migrar las propiedades asignándoles un array con su imagen actual y al menos 3 imágenes adicionales
UPDATE properties 
SET images = ARRAY[
  image, 
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c15293036e3?w=800&q=80'
]
WHERE image IS NOT NULL AND (images IS NULL OR cardinality(images) = 0);

-- 3. Configurar la galería real para "The Glass Pavilion" (ID: 1)
UPDATE properties
SET images = ARRAY[
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBjNDU9iE4zwPuWeg-CjIrLI-87GF24_LgOggcXT0vmUYfMx2q1dJAheiqWqVN-39uiwyLKEfP18FsG1vtUyAPX902OhGEfM4clcQiDsJW7MBbc_BoMtZXtqIeFKIfkHnkIPwmFbQg8Eaan6ULV99T8AUVUuKsro0HoTMrIaxw5pp1uSuQlF8X5Dait4US1W4vmyZnVioXbFnCoaOOZ0LPorb0rVGAIQd9reWcpqq27C0oO4ltnsCTHIcjIm0xp-2qVbRJSIZzWPv0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvpJBMaiXUL25hHYwLa_0R6dPhLLM1EuhEt-AVtOy8qSnEi9IcA_RzD5s5ThawY3XG2qw8h4kPqvfP18EY1E5vgA8fs6v7RefCMJ1gY8Gt4uyXGJ85-lcIvL18v8Nlc-U-VOwn1h54yjjg4-KXHt1N5DfuTkQUBdldSELRZeJ6zuZ087NCJ7dDIDaXKJpPgulmd6JC6zD1-Kq00Sb4VXIhVR3IQ1Hd8S6xZkd17QvMHSNqbtKG849PRqHZX3nKLHEWYWWPvbL5_Gs',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAbloTFAmeq6ugmfkwyqn3NMGn11PMk4FU0EIHRHvfYB8nw_-iH5TLps5ig3zipLPoKVZZKO8fOvEVJIwp3MQ9wrS4Dzhgw6ypUDhsycOc-YsboVBbRrXxKOYl-77zNHX9E4hynYyJfVVzXn7ldtURk3Ij3pHIMwqzfDdUxyhYaIJe5dRYa0JN5RpHbPNaV33TcM-IoYW11wNUCKkivtfgC3tk7hkKa3gue7ZTjLhR1ZOE_A1MvMZ3rgBxGDg-HFASH4YP6jI3rwMM',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDRCEooMTK0GZV_7SdAorgeIN1pNz3R9YsLv-2pv39FOje7BUWCWPnKOSA1f6rlYcw7IoJ8NxUp4OU-MAk5_ucnykEtps56-kR6DtQ9JgLlCNyiuazO87fy-xCtXVNROT9kquBZ2JUvUtNGRwWiBaK1DnXOHSxp3ELHbLK8MNS-Ht3Gw8dXgNbya4bZiHZ7C-YnCJfwPjX25zrrQypfbiJsS8jjxFq3--uC264Zbhxp8XCsqDid3BIaJ8RdNMRze6lVvpg49N7Z0tI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBk_c2n3UBtDQJ-NNLPp9wHCUtPuJTKQi4jnndp2ZNKTRfxtmV85MELPvVecn7Ef74j23fC3l08ZwEbHr70k5C1eHlVG8Pj-K0GWve-DoShWQNa5VGFhBad_Vtlxlu_u22wpBT3475EVHpmhcfwY2FekfCxqUrc_fGSBlHLcKIZ8XsNyHpAPUqUD2n10H86tm9E1nexgYeFUXpLsgB-FRTtya2tTZZ8kTJ-i0Mv6kWLi-LJgvYuYsN2lB0jZi0Q7xxJe6O1M-vA9eg'
]
WHERE id = '1';

-- 4. Eliminar la antigua columna 'image' (Opcional, descomenta si deseas limpiar la tabla)
-- ALTER TABLE properties DROP COLUMN IF EXISTS image;
