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
    produccion,
    producción,
  } = body;

  const rawProduccion = produccion || producción;
  let parsedLocation = location;
  let parsedMinPrice = minPrice;
  let parsedMaxPrice = maxPrice;
  let parsedBeds = beds;
  let parsedBaths = baths;
  let parsedParking;
  let parsedArea;
  let parsedStatus = status;
  let parsedCategory = category;

  if (rawProduccion && typeof rawProduccion === 'string') {
    // Parse the raw key-value string
    const lines = rawProduccion.split('\n');
    lines.forEach(line => {
      const [key, ...rest] = line.split(':');
      if (!key || rest.length === 0) return;
      const val = rest.join(':').trim().replace(/,$/, '').replace(/^"|"$/g, '');
      if (val === 'NULL') return;

      const k = key.trim().toLowerCase();
      if (k === 'ubicación' || k === 'ubicacion' || k === 'location') parsedLocation = val;
      if (k === 'precio' || k === 'price') parsedMaxPrice = Number(val);
      if (k === 'camas' || k === 'beds') parsedBeds = Number(val);
      if (k === 'baños' || k === 'baths') parsedBaths = Number(val);
      if (k === 'estacionamiento' || k === 'parking') parsedParking = Number(val);
      if (k === 'area') parsedArea = Number(val);
      if (k === 'estado' || k === 'status') parsedStatus = val;
      if (k === 'categoría' || k === 'categoria' || k === 'category') parsedCategory = val;
    });
  }

  const supabase = getBotSupabase();

  let dbQuery = supabase
    .from('properties')
    .select('id, title, description, location, price, status, category, beds, baths, area, images, latitude, longitude')
    .eq('is_active', true)
    .order('id', { ascending: false })
    .limit(limit);

  // Text search across all title/location columns
  if (parsedLocation && parsedLocation.trim()) {
    const term = parsedLocation.trim();
    dbQuery = dbQuery.or(
      [
        `title.ilike.%${term}%`,
        `location.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ].join(',')
    );
  }

  // Also try the raw query text for location matching if no structured location
  if (!parsedLocation && query && query.trim()) {
    const term = query.trim();
    dbQuery = dbQuery.or(
      [
        `title.ilike.%${term}%`,
        `location.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ].join(',')
    );
  }

  if (parsedStatus) {
    if (parsedStatus.toLowerCase().includes('comprar') || parsedStatus.toLowerCase().includes('venta')) {
      dbQuery = dbQuery.eq('status', 'comprar');
    } else if (parsedStatus.toLowerCase().includes('alquilar') || parsedStatus.toLowerCase().includes('renta')) {
      dbQuery = dbQuery.eq('status', 'alquilar');
    } else {
      dbQuery = dbQuery.eq('status', parsedStatus);
    }
  }
  if (parsedCategory) dbQuery = dbQuery.ilike('type', `%${parsedCategory}%`);
  if (parsedBeds && Number(parsedBeds) > 0) dbQuery = dbQuery.gte('beds', Number(parsedBeds));
  if (parsedBaths && Number(parsedBaths) > 0) dbQuery = dbQuery.gte('baths', Number(parsedBaths));
  if (parsedParking && Number(parsedParking) > 0) dbQuery = dbQuery.gte('parking', Number(parsedParking));
  if (parsedArea && Number(parsedArea) > 0) dbQuery = dbQuery.gte('area', Number(parsedArea) * 0.8); // 20% tolerance
  if (parsedMinPrice) dbQuery = dbQuery.gte('price', Number(parsedMinPrice));
  if (parsedMaxPrice) dbQuery = dbQuery.lte('price', Number(parsedMaxPrice) * 1.2); // 20% tolerance

  const { data, error } = await dbQuery;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Format for bot response
  const results = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    status: p.status === 'alquilar' ? 'Alquiler' : 'Venta',
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    image: p.images?.[0] || null,
    url: `/propiedades/${p.id}`,
  }));

  return NextResponse.json({
    results,
    count: results.length,
    message: results.length === 0
      ? 'No encontré propiedades con esas características.'
      : `Encontré ${results.length} propiedad${results.length > 1 ? 'es' : ''}.`
  });
}
