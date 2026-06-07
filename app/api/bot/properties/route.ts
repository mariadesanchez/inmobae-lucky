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
  const status = searchParams.get('status'); // 'active' | 'inactive' | 'all'
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '10');

  const supabase = getBotSupabase();
  let query = supabase
    .from('properties')
    .select('id, title, description, location, price, status, type, beds, baths, area, is_active, images')
    .order('id', { ascending: false })
    .limit(limit);

  if (status === 'active') query = query.eq('is_active', true);
  else if (status === 'inactive') query = query.eq('is_active', false);

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ properties: data, count: data?.length || 0 });
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
