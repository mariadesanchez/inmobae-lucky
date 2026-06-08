'use server';

import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function getAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}

export async function createUserAction(formData: FormData) {
  // Check authorization
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const adminSupabase = getAdminSupabase();

  const { data: roleData } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleData || roleData.role !== 'admin') {
    return { error: 'No tienes permisos para crear usuarios.' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !role) {
    return { error: 'Todos los campos son requeridos.' };
  }

  // 1. Create user in Supabase Auth
  const { data: newUserData, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Automatically confirm
  });

  if (createError) {
    console.error('Error creating user:', createError);
    return { error: createError.message || 'Error al crear el usuario en Auth.' };
  }

  if (!newUserData.user) {
    return { error: 'Error desconocido al crear el usuario.' };
  }

  // 2. Insert into user_roles (use upsert to avoid conflicts with triggers)
  const { error: roleInsertError } = await adminSupabase
    .from('user_roles')
    .upsert({
      user_id: newUserData.user.id,
      role: role
    }, { onConflict: 'user_id' });

  if (roleInsertError) {
    console.error('Error inserting role:', roleInsertError);
    // Best effort cleanup could go here, but omitted for simplicity
    return { error: 'Usuario creado, pero hubo un error asignando el rol.' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}
