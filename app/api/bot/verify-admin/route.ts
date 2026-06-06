import { NextRequest, NextResponse } from 'next/server';
import { validateBotApiKey, getBotSupabase } from '@/lib/bot-auth';

// POST /api/bot/verify-admin
// Body: { telegram_chat_id }
// Checks if a Telegram chat_id is registered as an admin in Supabase table `telegram_admins`

export async function POST(request: NextRequest) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const body = await request.json();
  const { telegram_chat_id } = body;

  if (!telegram_chat_id) {
    return NextResponse.json({ error: 'telegram_chat_id is required' }, { status: 400 });
  }

  const supabase = getBotSupabase();

  // Check the telegram_admins table
  const { data, error } = await supabase
    .from('telegram_admins')
    .select('chat_id, name, is_active')
    .eq('chat_id', String(telegram_chat_id))
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return NextResponse.json({
      is_admin: false,
      message: 'No autorizado. Tu chat_id no está registrado como administrador.'
    });
  }

  return NextResponse.json({
    is_admin: true,
    name: data.name,
    message: `Bienvenido, ${data.name}. Tenés acceso de administrador.`
  });
}
