import { NextRequest, NextResponse } from 'next/server';
import { validateBotApiKey, getBotSupabase } from '@/lib/bot-auth';
import { revalidatePath } from 'next/cache';

// GET /api/bot/users — list users with roles
// PATCH /api/bot/users — change user role (pass user_id and role in body)

export async function GET(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const supabase = getBotSupabase();

  // Get all users from auth + their roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) return NextResponse.json({ error: rolesError.message }, { status: 500 });

  // Get user details from auth.users
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });

  const roleMap = new Map((roles || []).map((r: any) => [r.user_id, r.role]));

  const users = (usersData?.users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.full_name || u.email,
    role: roleMap.get(u.id) || 'user',
    created_at: u.created_at,
  }));

  return NextResponse.json({ users, count: users.length });
}

export async function PATCH(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const body = await request.json();
  const { user_id, role } = body;

  if (!user_id || !role) {
    return NextResponse.json({ error: 'user_id and role are required' }, { status: 400 });
  }

  if (!['admin', 'user'].includes(role)) {
    return NextResponse.json({ error: 'role must be "admin" or "user"' }, { status: 400 });
  }

  const supabase = getBotSupabase();

  // Safety check: prevent removing the last admin
  if (role === 'user') {
    const { count } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (count !== null && count <= 1) {
      const { data: targetRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user_id)
        .single();

      if (targetRole?.role === 'admin') {
        return NextResponse.json({
          error: 'No se puede quitar el rol al último administrador.'
        }, { status: 400 });
      }
    }
  }

  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id, role }, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/[locale]/admin/users', 'page');

  return NextResponse.json({
    success: true,
    message: `Usuario ${user_id} ahora tiene rol: ${role}`
  });
}
