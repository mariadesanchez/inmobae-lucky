'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {}
      }
    }
  );
}

// Function to bypass RLS using service role (for operations that require admin privileges)
function getAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {}
      }
    }
  );
}

export async function createProperty(data: any) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify Admin
  const adminSupabase = getAdminSupabase();
  const { data: roleData } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleData || roleData.role !== 'admin') {
    throw new Error('Not authorized to create properties');
  }

  // Filter payload to only fields that exist in the DB currently
  const payload = {
    title: data.title || '',
    description: data.description || '',
    price: parseFloat(data.price) || 0,
    location: data.location || '',
    latitude: data.latitude ? parseFloat(data.latitude) : null,
    longitude: data.longitude ? parseFloat(data.longitude) : null,
    type: data.type || 'Departamento',
    status: data.status === 'alquilar' ? 'alquilar' : 'comprar',
    beds: parseInt(data.beds) || 0,
    baths: parseInt(data.baths) || 0,
    parking: parseInt(data.parking) || 0,
    area: parseInt(data.area) || 0,
    age: data.age,
    disposition: data.disposition,
    features: Array.isArray(data.features) ? data.features : [],
    images: data.images || [],
    is_featured: data.is_featured || false,
    ...(data.date_entry && { date_entry: new Date(data.date_entry).toISOString() })
  };

  // Check max ID to manually auto-increment in case the table is missing the Identity property
  const { data: maxIdData } = await adminSupabase
    .from('properties')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  
  const nextId = maxIdData ? maxIdData.id + 1 : 1;
  const insertPayload = { ...payload, id: nextId };

  let { data: insertedData, error } = await adminSupabase
    .from('properties')
    .insert([insertPayload])
    .select()
    .single();

  // Fallback if schema cache hasn't updated yet for latitude/longitude
  if (error && error.message.includes("Could not find the 'latitude' column")) {
    console.warn("Schema cache missing latitude. Retrying without coordinate fields...");
    delete (insertPayload as any).latitude;
    delete (insertPayload as any).longitude;
    
    const fallbackResponse = await adminSupabase
      .from('properties')
      .insert([insertPayload])
      .select()
      .single();
    
    insertedData = fallbackResponse.data;
    error = fallbackResponse.error;
  }

  if (error) {
    console.error('Error creating property:', error);
    throw new Error('Failed to create property: ' + error.message);
  }

  revalidatePath('/[locale]/admin/properties', 'page');
  revalidatePath('/', 'page');
  
  return insertedData;
}

export async function updateProperty(id: number, data: any) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify Admin
  const adminSupabase = getAdminSupabase();
  const { data: roleData } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleData || roleData.role !== 'admin') {
    throw new Error('Not authorized to update properties');
  }

  const payload = {
    title: data.title,
    description: data.description,
    price: parseFloat(data.price) || 0,
    location: data.location,
    latitude: data.latitude ? parseFloat(data.latitude) : null,
    longitude: data.longitude ? parseFloat(data.longitude) : null,
    type: data.type,
    status: data.status === 'alquilar' ? 'alquilar' : 'comprar',
    beds: parseInt(data.beds) || 0,
    baths: parseInt(data.baths) || 0,
    parking: parseInt(data.parking) || 0,
    area: parseInt(data.area) || 0,
    age: data.age,
    disposition: data.disposition,
    features: Array.isArray(data.features) ? data.features : [],
    images: data.images,
  };

  // Remove undefined fields
  Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

  let { data: updatedData, error } = await adminSupabase
    .from('properties')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  // Fallback if schema cache hasn't updated yet for latitude/longitude
  if (error && error.message.includes("Could not find the 'latitude' column")) {
    console.warn("Schema cache missing latitude. Retrying without coordinate fields...");
    delete (payload as any).latitude;
    delete (payload as any).longitude;
    
    const fallbackResponse = await adminSupabase
      .from('properties')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    updatedData = fallbackResponse.data;
    error = fallbackResponse.error;
  }

  if (error) {
    console.error('Error updating property:', error);
    throw new Error('Failed to update property: ' + error.message);
  }

  revalidatePath('/[locale]/admin/properties', 'page');
  revalidatePath('/', 'page');
  
  return updatedData;
}

export async function uploadPropertyImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const adminSupabase = getAdminSupabase();
  const { data: roleData } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleData || roleData.role !== 'admin') {
    throw new Error('Not authorized to upload images');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

  const { error } = await adminSupabase.storage
    .from('properties')
    .upload(fileName, file);

  if (error) {
    console.error('Upload error:', error);
    throw new Error(error.message);
  }

  const { data: { publicUrl } } = adminSupabase.storage
    .from('properties')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function togglePropertyStatus(id: number, isActive: boolean) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const adminSupabase = getAdminSupabase();
  const { data: roleData } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleData || roleData.role !== 'admin') {
    throw new Error('Not authorized to update properties');
  }

  const { error } = await adminSupabase
    .from('properties')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    // If schema cache hasn't updated for is_active column yet
    if (error.message.includes("Could not find the 'is_active' column")) {
      console.warn("Schema cache missing is_active column. Please run: NOTIFY pgrst, 'reload schema'; in Supabase SQL Editor.");
      throw new Error(
        "La columna 'is_active' aún no está en el caché de Supabase. " +
        "Ve al SQL Editor de Supabase y ejecuta: NOTIFY pgrst, 'reload schema';"
      );
    }
    console.error('Error updating property status:', error);
    throw new Error('Failed to update property status: ' + error.message);
  }

  revalidatePath('/[locale]/admin/properties', 'page');
  revalidatePath('/', 'page');
}
