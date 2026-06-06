import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n-config';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="font-display bg-clear-day dark:bg-background-dark min-h-screen flex items-center justify-center p-4 antialiased text-nordic dark:text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-hint-of-green/30 rounded-full blur-3xl dark:bg-mosque/10"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-mosque/10 rounded-full blur-3xl"></div>
      </div>
      
      <main className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-mosque rounded-xl mb-6 shadow-soft text-white">
            <span className="material-icons font-material-icons text-3xl">real_estate_agent</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic dark:text-white mb-2">{dict?.login?.title || 'Welcome to LuxeEstate'}</h1>
          <p className="text-nordic/60 dark:text-gray-400">{dict?.login?.subtitle || 'Unlock exclusive properties worldwide.'}</p>
        </div>
        
        <div className="bg-white dark:bg-[#152e2a] rounded-2xl shadow-soft p-8 sm:p-10 border border-white/50 dark:border-mosque/20 backdrop-blur-sm">
          <SocialLoginButtons />
          
          <p className="mt-8 text-center text-sm text-nordic/70 dark:text-gray-400">
            {dict?.login?.noAccount || "Don't have an account?"}{' '}
            <a className="font-semibold text-mosque hover:text-mosque/80 transition-colors" href="#">{dict?.login?.signup || 'Sign up'}</a>
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-xs text-nordic/50 dark:text-gray-500">
            <a className="hover:text-nordic dark:hover:text-gray-300 transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-nordic dark:hover:text-gray-300 transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-nordic dark:hover:text-gray-300 transition-colors" href="#">Help Center</a>
          </nav>
        </div>
      </main>
    </div>
  );
}
