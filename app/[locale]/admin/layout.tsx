import { Locale } from '@/i18n-config';
import { getDictionary } from '@/lib/dictionaries';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="bg-argentina-light dark:bg-background-dark text-argentina-navy dark:text-gray-100 font-display min-h-screen flex flex-col antialiased">
      <AdminNavbar locale={locale} user={user} />
      
      {/* Main Content */}
      {children}
    </div>
  );
}
