import { Locale } from '@/i18n-config';
import { createClient } from '@/lib/supabase/server';
import NavbarClient from './NavbarClient';

interface NavbarProps {
  dict?: any;
  locale?: Locale;
}

const Navbar = async ({ dict, locale = 'en' }: NavbarProps) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
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
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData && roleData.role === 'admin') {
      isAdmin = true;
    }
  }

  return <NavbarClient dict={dict} locale={locale} user={user} isAdmin={isAdmin} />;
};

export default Navbar;
