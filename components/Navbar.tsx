import Link from 'next/link';
import Image from 'next/image';
import LanguageSelector from './LanguageSelector';
import { Locale } from '@/i18n-config';
import UserMenu from './UserMenu';
import { createClient } from '@/lib/supabase/server';

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

    const { data: roleData, error } = await adminSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
      
    if (roleData && roleData.role === 'admin') {
      isAdmin = true;
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-clear-day/95 backdrop-blur-md border-b border-nordic/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-nordic flex items-center justify-center">
              <span className="material-icons text-white text-lg font-material-icons">
                apartment
              </span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic">
              LuxeEstate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#"
              className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1"
            >
              {dict?.buy || 'Buy'}
            </Link>
            <Link
              href="#"
              className="text-nordic/70 hover:text-nordic font-medium text-sm hover:border-b-2 hover:border-nordic/20 px-1 py-1 transition-all"
            >
              {dict?.rent || 'Rent'}
            </Link>
            <Link
              href="#"
              className="text-nordic/70 hover:text-nordic font-medium text-sm hover:border-b-2 hover:border-nordic/20 px-1 py-1 transition-all"
            >
              {dict?.commercial || 'Commercial'}
            </Link>
            <Link
              href="#"
              className="text-nordic/70 hover:text-nordic font-medium text-sm hover:border-b-2 hover:border-nordic/20 px-1 py-1 transition-all"
            >
              {dict?.saved || 'Saved Homes'}
            </Link>

            {/* Admin Links */}
            {isAdmin && (
              <div className="flex items-center space-x-6 border-l border-nordic/20 pl-6 ml-2">
                <Link
                  href={`/${locale}/admin/properties`}
                  className="flex items-center gap-1.5 text-mosque font-semibold text-sm hover:text-mosque/80 transition-colors bg-hint-of-green/30 px-3 py-1.5 rounded-md"
                >
                  <span className="material-icons text-[16px]">holiday_village</span>
                  Properties
                </Link>
                <Link
                  href={`/${locale}/admin/users`}
                  className="flex items-center gap-1.5 text-mosque font-semibold text-sm hover:text-mosque/80 transition-colors bg-hint-of-green/30 px-3 py-1.5 rounded-md"
                >
                  <span className="material-icons text-[16px]">people</span>
                  Users
                </Link>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <button className="text-nordic hover:text-mosque transition-colors">
              <span className="material-icons font-material-icons">search</span>
            </button>
            <button className="text-nordic hover:text-mosque transition-colors relative">
              <span className="material-icons font-material-icons">
                notifications_none
              </span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-clear-day"></span>
            </button>

            <LanguageSelector currentLocale={locale} />

            {/* Profile / Auth */}
            {user ? (
              <div className="ml-2 pl-2 border-l border-nordic/10">
                <UserMenu user={user} />
              </div>
            ) : (
              <div className="ml-2 pl-2 border-l border-nordic/10">
                <Link 
                  href={`/${locale}/login`}
                  className="px-4 py-2 bg-mosque hover:bg-mosque/90 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {dict?.login || 'Login'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu (Hidden by default for now as per design) */}
      <div className="md:hidden border-t border-nordic/5 bg-clear-day overflow-hidden h-0 transition-all duration-300">
        <div className="px-4 py-2 space-y-1">
          <Link
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-mosque bg-mosque/10"
          >
            Buy
          </Link>
          <Link
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic hover:bg-black/5"
          >
            Rent
          </Link>
          <Link
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic hover:bg-black/5"
          >
            Sell
          </Link>
          <Link
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic hover:bg-black/5"
          >
            Saved Homes
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
