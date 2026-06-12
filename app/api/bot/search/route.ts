import { NextRequest, NextResponse } from 'next/server';
import { validateBotApiKey, getBotSupabase } from '@/lib/bot-auth';

// GET /api/bot/search
// Query params: location, type, beds, baths, parking, status, minPrice, maxPrice, amenities, page, limit
// Same params as the web /buscar page — ideal for N8N GET requests
// Example: /api/bot/search?location=la+plata&type=Departamento&beds=1&status=comprar
export async function GET(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);

  const location   = searchParams.get('location')   ?? undefined;
  const type       = searchParams.get('type')        ?? undefined;
  const status     = searchParams.get('status')      ?? undefined;
  const beds       = searchParams.get('beds')        ?? undefined;
  const baths      = searchParams.get('baths')       ?? undefined;
  const parking    = searchParams.get('parking')     ?? undefined;
  const minPrice   = searchParams.get('minPrice')    ?? undefined;
  const maxPrice   = searchParams.get('maxPrice')    ?? undefined;
  const minArea    = searchParams.get('minArea')     ?? undefined;
  const maxArea    = searchParams.get('maxArea')     ?? undefined;
  const amenities  = searchParams.get('amenities')   ?? undefined;
  const page       = parseInt(searchParams.get('page')  ?? '1', 10);
  const limit      = parseInt(searchParams.get('limit') ?? '5', 10);
  const PAGE_SIZE  = Math.min(limit, 20); // cap at 20
  const from       = (Math.max(1, page) - 1) * PAGE_SIZE;
  const to         = from + PAGE_SIZE - 1;

  const supabase = getBotSupabase();

  let dbQuery = supabase
    .from('properties')
    .select('id, title, description, location, price, status, type, beds, baths, parking, area, images, latitude, longitude', { count: 'exact' })
    .eq('is_active', true)
    .order('id', { ascending: false });

  // Location: partial match across title, location, description
  if (location && location.trim()) {
    const term = location.trim();
    dbQuery = dbQuery.or(
      [
        `title.ilike.%${term}%`,
        `location.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ].join(',')
    );
  }

  // Type (Departamento, Casa, etc.) with normalization
  if (type && type !== 'Todos' && type !== 'Any Type') {
    let normalizedType = type.trim().toLowerCase();
    if (normalizedType.startsWith('departamento')) {
      normalizedType = 'Departamento';
    } else if (normalizedType.startsWith('casa')) {
      normalizedType = 'Casa';
    } else if (normalizedType.startsWith('cochera')) {
      normalizedType = 'Cochera';
    } else if (normalizedType.startsWith('ph')) {
      normalizedType = 'PH';
    } else if (normalizedType.startsWith('local')) {
      normalizedType = 'Local';
    } else if (normalizedType.startsWith('oficina')) {
      normalizedType = 'Oficina';
    } else {
      normalizedType = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
    }
    dbQuery = dbQuery.eq('type', normalizedType);
  }

  // Status (comprar / alquilar) with mapping/normalization
  if (status) {
    const s = status.trim().toLowerCase();
    if (s.includes('comprar') || s.includes('venta') || s.includes('sale') || s.includes('buy')) {
      dbQuery = dbQuery.eq('status', 'comprar');
    } else if (s.includes('alquilar') || s.includes('alquiler') || s.includes('renta') || s.includes('rent')) {
      dbQuery = dbQuery.eq('status', 'alquilar');
    } else {
      dbQuery = dbQuery.eq('status', status);
    }
  }

  // Numeric filters
  if (beds    && Number(beds)    > 0) dbQuery = dbQuery.gte('beds',    Number(beds));
  if (baths   && Number(baths)   > 0) dbQuery = dbQuery.gte('baths',   Number(baths));
  if (parking && Number(parking) > 0) dbQuery = dbQuery.gte('parking', Number(parking));
  if (minPrice) dbQuery = dbQuery.gte('price', Number(minPrice));
  if (maxPrice) dbQuery = dbQuery.lte('price', Number(maxPrice));
  if (minArea && Number(minArea) > 0) dbQuery = dbQuery.gte('area', Number(minArea));
  if (maxArea && Number(maxArea) < 10000) dbQuery = dbQuery.lte('area', Number(maxArea));

  const { data, error, count } = await dbQuery.range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const amenitiesArray = amenities ? amenities.split(',').filter(Boolean) : [];

  // Format for bot response
  const results = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    status: p.status === 'alquilar' ? 'Alquiler' : 'Venta',
    type: p.type,
    beds: p.beds,
    baths: p.baths,
    parking: p.parking,
    area: p.area,
    image: p.images?.[0] || null,
    url: `https://inmobae-lucky.vercel.app/propiedades/${p.id}`,
  }));

  return NextResponse.json({
    results,
    count: count ?? results.length,
    page,
    totalPages: count ? Math.ceil(count / PAGE_SIZE) : 1,
    requestedAmenities: amenitiesArray,
    message: results.length === 0
      ? 'No encontré propiedades con esas características.'
      : `Encontré ${count ?? results.length} propiedad${(count ?? results.length) > 1 ? 'es' : ''}, mostrando ${results.length}.`
  });
}

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
    const s = parsedStatus.trim().toLowerCase();
    if (s.includes('comprar') || s.includes('venta') || s.includes('sale') || s.includes('buy')) {
      dbQuery = dbQuery.eq('status', 'comprar');
    } else if (s.includes('alquilar') || s.includes('alquiler') || s.includes('renta') || s.includes('rent')) {
      dbQuery = dbQuery.eq('status', 'alquilar');
    } else {
      dbQuery = dbQuery.eq('status', parsedStatus);
    }
  }
  
  if (parsedCategory) {
    let normalizedCategory = parsedCategory.trim().toLowerCase();
    if (normalizedCategory.startsWith('departamento')) {
      normalizedCategory = 'Departamento';
    } else if (normalizedCategory.startsWith('casa')) {
      normalizedCategory = 'Casa';
    } else if (normalizedCategory.startsWith('cochera')) {
      normalizedCategory = 'Cochera';
    } else if (normalizedCategory.startsWith('ph')) {
      normalizedCategory = 'PH';
    } else if (normalizedCategory.startsWith('local')) {
      normalizedCategory = 'Local';
    } else if (normalizedCategory.startsWith('oficina')) {
      normalizedCategory = 'Oficina';
    } else {
      normalizedCategory = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1);
    }
    dbQuery = dbQuery.eq('type', normalizedCategory);
  }
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
