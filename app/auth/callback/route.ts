import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error, data: sessionData } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.user) {
      // Garantizar que exista el registro en user_roles
      const { createServerClient } = await import('@supabase/ssr');
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
      
      const { data: roleData } = await adminSupabase
        .from('user_roles')
        .select('id')
        .eq('user_id', sessionData.user.id)
        .single();
        
      if (!roleData) {
        await adminSupabase.from('user_roles').insert({
          user_id: sessionData.user.id,
          role: 'user'
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`);
}
