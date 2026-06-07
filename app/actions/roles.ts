'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Using the service role key for admin operations
function getAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // not needed for admin operations
        },
      },
    }
  );
}

import { createClient } from '@/lib/supabase/server';

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  // Verify current user is admin first!
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const adminSupabase = getAdminSupabase();

  const { data: roleData, error: roleError } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError) {
    console.error('Action Role Check Error:', roleError.message);
  }

  if (!roleData || roleData.role !== 'admin') {
    return { error: 'No tienes autorización para actualizar roles.' };
  }

  // Prevent demoting the last admin
  if (newRole === 'user') {
    const { count, error: countError } = await adminSupabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (countError) {
      console.error('Count Error:', countError);
      return { error: 'No se pudo verificar el conteo de administradores.' };
    }

    if (count !== null && count <= 1) {
      // Check if the target user is currently an admin
      const { data: targetRole } = await adminSupabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (targetRole && targetRole.role === 'admin') {
        return { error: 'No se puede eliminar al último administrador. El sistema requiere al menos un admin.' };
      }
    }
  }

  const { error } = await adminSupabase
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating role:', error);
    return { error: 'No se pudo actualizar el rol.' };
  }

  revalidatePath('/admin/users', 'page');
  return { success: true };
}
