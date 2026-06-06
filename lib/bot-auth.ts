import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates the incoming request has a valid BOT_API_KEY header.
 * Returns a 401 response if invalid, or null if valid.
 */
export function validateBotApiKey(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.BOT_API_KEY;

  if (!expectedKey) {
    console.error('BOT_API_KEY is not set in environment variables');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

/**
 * Returns a shared Supabase admin client (service role — bypasses RLS)
 */
export function getBotSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
