import { NextRequest, NextResponse } from 'next/server';
import { validateBotApiKey, getBotSupabase } from '@/lib/bot-auth';

// POST /api/bot/search
// Body: { query, beds?, baths?, status?, category?, location?, minPrice?, maxPrice?, limit? }
// Used by the client-facing bot to find properties via natural language extracted filters

export async function POST(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const body = await request.json();
  const {
    query,
    beds,
    baths,
    status,      // 'sale' | 'rent'
    category,    // 'house' | 'apartment' | 'villa' | 'penthouse' | 'new' | 'market' | 'featured'
    location,
    minPrice,
    maxPrice,
    limit = 5,
  } = body;

  const supabase = getBotSupabase();

  let dbQuery = supabase
    .from('properties')
    .select('id, title, title_es, location, location_es, price, status, category, beds, baths, area, images, latitude, longitude')
    .eq('is_active', true)
    .order('id', { ascending: false })
    .limit(limit);

  // Text search across all title/location columns
  if (location && location.trim()) {
    const term = location.trim();
    dbQuery = dbQuery.or(
      [
        `title.ilike.%${term}%`,
        `title_es.ilike.%${term}%`,
        `location.ilike.%${term}%`,
        `location_es.ilike.%${term}%`,
      ].join(',')
    );
  }

  // Also try the raw query text for location matching if no structured location
  if (!location && query && query.trim()) {
    const term = query.trim();
    dbQuery = dbQuery.or(
      [
        `title.ilike.%${term}%`,
        `title_es.ilike.%${term}%`,
        `location.ilike.%${term}%`,
        `location_es.ilike.%${term}%`,
      ].join(',')
    );
  }

  if (status) dbQuery = dbQuery.eq('status', status);
  if (category) dbQuery = dbQuery.ilike('category', category);
  if (beds && Number(beds) > 0) dbQuery = dbQuery.gte('beds', Number(beds));
  if (baths && Number(baths) > 0) dbQuery = dbQuery.gte('baths', Number(baths));
  if (minPrice) dbQuery = dbQuery.gte('price', Number(minPrice));
  if (maxPrice) dbQuery = dbQuery.lte('price', Number(maxPrice));

  const { data, error } = await dbQuery;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Format for bot response
  const results = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title_es || p.title,
    location: p.location_es || p.location,
    price: p.price,
    status: p.status === 'rent' ? 'Alquiler' : 'Venta',
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    image: p.images?.[0] || null,
    url: `/es/propiedades/${p.id}`,
  }));

  return NextResponse.json({
    results,
    count: results.length,
    message: results.length === 0
      ? 'No encontré propiedades con esas características.'
      : `Encontré ${results.length} propiedad${results.length > 1 ? 'es' : ''}.`
  });
}
