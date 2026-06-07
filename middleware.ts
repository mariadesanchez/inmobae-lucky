import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Validate session and roles for protected routes via Supabase
  return await updateSession(request, NextResponse.next());
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, `/auth/` and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)'],
};
