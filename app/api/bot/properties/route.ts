import { NextRequest, NextResponse } from 'next/server';
import { validateBotApiKey, getBotSupabase } from '@/lib/bot-auth';
import { revalidatePath } from 'next/cache';

// GET /api/bot/properties — list properties with optional filters
// POST /api/bot/properties — create a new property
// PATCH /api/bot/properties — edit an existing property (pass id in body)
// DELETE /api/bot/properties — soft-deactivate a property (pass id in body)

export async function GET(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);

  // --- Pagination ---
  const PAGE_SIZE = parseInt(searchParams.get('pageSize') || '10');
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // --- Filters (same as /buscar page) ---
  const location     = searchParams.get('location');
  const minPrice     = searchParams.get('minPrice');
  const maxPrice     = searchParams.get('maxPrice');
  const type         = searchParams.get('type');
  const status       = searchParams.get('status');        // 'comprar' | 'alquilar'
  const beds         = searchParams.get('beds');
  const baths        = searchParams.get('baths');
  const parking      = searchParams.get('parking');
  const minArea      = searchParams.get('minArea');
  const maxArea      = searchParams.get('maxArea');
  const age          = searchParams.get('age');
  const disposition  = searchParams.get('disposition');
  const featuredStatus = searchParams.get('featuredStatus');
  const datePublished  = searchParams.get('datePublished');

  const supabase = getBotSupabase();
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .contains('features', ['Agua Corriente', 'Luz']) // Servicios esenciales obligatorios
    .order('id', { ascending: false });

  // Location — partial match only on the location field (city-based filter)
  if (location && location.trim()) {
    const term = location.trim();
    query = query.ilike('location', `%${term}%`);
  }

  // Price range
  if (minPrice) query = query.gte('price', Number(minPrice));
  if (maxPrice) query = query.lte('price', Number(maxPrice));

  // Property type — exact match (case-insensitive)
  if (type && type !== 'Todos' && type !== 'Any Type') {
    query = query.eq('type', type);
  }

  // Status (comprar / alquilar)
  if (status && status !== 'active' && status !== 'inactive' && status !== 'all') {
    query = query.eq('status', status);
  }

  // Beds, Baths, Parking — exact match
  if (beds    && Number(beds)    > 0) query = query.eq('beds',    Number(beds));
  if (baths   && Number(baths)   > 0) query = query.eq('baths',   Number(baths));
  if (parking && Number(parking) > 0) query = query.eq('parking', Number(parking));

  // Area
  if (minArea && Number(minArea) > 0)       query = query.gte('area', Number(minArea));
  if (maxArea && Number(maxArea) < 10000)   query = query.lte('area', Number(maxArea));

  // Age
  if (age && age !== 'Cualquiera') {
    if (age === 'En construcción') query = query.eq('age', 'En construcción');
    else if (age === 'A estrenar')     query = query.in('age', ['En construcción', 'A estrenar']);
    else if (age === 'Hasta 5 años')   query = query.in('age', ['En construcción', 'A estrenar', 'Hasta 5 años']);
    else if (age === 'Hasta 10 años')  query = query.in('age', ['En construcción', 'A estrenar', 'Hasta 5 años', 'Hasta 10 años']);
    else if (age === 'Hasta 20 años')  query = query.in('age', ['En construcción', 'A estrenar', 'Hasta 5 años', 'Hasta 10 años', 'Hasta 20 años']);
  }

  // Disposition
  if (disposition && disposition !== 'Cualquiera') query = query.eq('disposition', disposition);

  // Featured status
  if (featuredStatus === 'Destacadas') query = query.eq('is_featured', true);
  if (featuredStatus === 'Comunes')    query = query.eq('is_featured', false);

  // Date published
  if (datePublished && datePublished !== 'Cualquiera') {
    const date = new Date();
    if (datePublished === 'Hoy')            date.setDate(date.getDate() - 1);
    if (datePublished === 'Última semana')  date.setDate(date.getDate() - 7);
    if (datePublished === 'Últimos 15 días') date.setDate(date.getDate() - 15);
    if (datePublished === 'Últimos 30 días') date.setDate(date.getDate() - 30);
    if (datePublished === 'Últimos 45 días') date.setDate(date.getDate() - 45);
    query = query.gte('created_at', date.toISOString());
  }

  const { data, error, count } = await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    properties: data ?? [],
    count: count ?? 0,
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}

export async function POST(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const body = await request.json();
  const supabase = getBotSupabase();

  // Get next ID
  const { data: maxIdData } = await supabase
    .from('properties')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const nextId = maxIdData ? maxIdData.id + 1 : 1;

  const payload = {
    id: nextId,
    title: body.title || '',
    description: body.description || '',
    price: parseFloat(body.price) || 0,
    location: body.location || '',
    latitude: body.latitude ? parseFloat(body.latitude) : null,
    longitude: body.longitude ? parseFloat(body.longitude) : null,
    type: body.type || 'Departamento',
    status: body.status === 'alquilar' ? 'alquilar' : 'comprar',
    beds: parseInt(body.beds) || 0,
    baths: parseInt(body.baths) || 0,
    parking: parseInt(body.parking) || 0,
    area: parseInt(body.area) || 0,
    age: body.age,
    disposition: body.disposition,
    features: Array.isArray(body.features) ? body.features : [],
    images: body.images || [],
    is_featured: body.is_featured || false,
    is_active: true,
  };

  const { data, error } = await supabase.from('properties').insert([payload]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/[locale]/admin/properties', 'page');
  revalidatePath('/', 'page');

  return NextResponse.json({ success: true, property: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'Property id is required' }, { status: 400 });

  const supabase = getBotSupabase();

  // Build update payload — only include fields that were sent
  const payload: Record<string, any> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.price !== undefined) payload.price = parseFloat(updates.price);
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.beds !== undefined) payload.beds = parseInt(updates.beds);
  if (updates.baths !== undefined) payload.baths = parseInt(updates.baths);
  if (updates.parking !== undefined) payload.parking = parseInt(updates.parking);
  if (updates.area !== undefined) payload.area = parseInt(updates.area);
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.age !== undefined) payload.age = updates.age;
  if (updates.disposition !== undefined) payload.disposition = updates.disposition;
  if (updates.features !== undefined) payload.features = Array.isArray(updates.features) ? updates.features : [];
  if (updates.is_active !== undefined) payload.is_active = updates.is_active;
  if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured;
  if (updates.latitude !== undefined) payload.latitude = updates.latitude ? parseFloat(updates.latitude) : null;
  if (updates.longitude !== undefined) payload.longitude = updates.longitude ? parseFloat(updates.longitude) : null;

  const { data, error } = await supabase
    .from('properties')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/[locale]/admin/properties', 'page');
  revalidatePath('/', 'page');

  return NextResponse.json({ success: true, property: data });
}

export async function DELETE(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: 'Property id is required' }, { status: 400 });

  const supabase = getBotSupabase();

  const { error } = await supabase
    .from('properties')
    .update({ is_active: false })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/[locale]/admin/properties', 'page');
  revalidatePath('/', 'page');

  return NextResponse.json({ success: true, message: `Property ${id} deactivated` });
}
