import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { i18n } from './i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string | undefined {
  // Try to get locale from cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // e.g. incoming request is /propiedades/slug
    // The new URL is now /en/propiedades/slug
    const url = new URL(
      `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
      request.url
    );

    // Preserve search params
    url.search = request.nextUrl.search;

    const response = pathname === '/' 
      ? NextResponse.rewrite(url)
      : NextResponse.redirect(url);

    // Ensure the cookie is set if we are redirecting based on negotiator
    response.cookies.set('NEXT_LOCALE', locale || i18n.defaultLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  }

  // If locale exists in pathname, ensure cookie is updated to match it
  const currentLocale = pathname.split('/')[1];
  if (i18n.locales.includes(currentLocale as any)) {
    const response = NextResponse.next();
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale !== currentLocale) {
       response.cookies.set('NEXT_LOCALE', currentLocale, {
         path: '/',
         maxAge: 60 * 60 * 24 * 365,
       });
       return response;
    }
  }

  // Validate session and roles for protected routes via Supabase
  return await updateSession(request, NextResponse.next());
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, `/auth/` and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
};
