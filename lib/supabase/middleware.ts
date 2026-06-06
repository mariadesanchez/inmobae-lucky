import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest, response: NextResponse) {
  let supabaseResponse = response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  const pathname = request.nextUrl.pathname;
  // Admin route regex (e.g. /es/admin, /en/admin, /admin, /es/admin/users)
  if (pathname.match(/^\/([a-z]{2}\/)?admin/)) {
    if (!user) {
      // Not logged in, redirect to login
      const locale = pathname.split('/')[1];
      const loginUrl = new URL(locale && locale.length === 2 ? `/${locale}/login` : '/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Create admin client to bypass RLS for role check
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {}
        }
      }
    );

    // Check role
    const { data: roleData, error } = await adminSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Middleware Role Check Error:', error.message);
    }

    if (!roleData || roleData.role !== 'admin') {
      // Not an admin, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}
