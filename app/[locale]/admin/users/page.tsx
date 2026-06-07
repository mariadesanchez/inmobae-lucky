import { createServerClient } from '@supabase/ssr';
import UserRoleTable from '@/components/admin/UserRoleTable';
import { createClient as createStandardClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminUsersPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ locale: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  
  const page = parseInt(resolvedSearchParams.page as string || '1', 10);
  const pageSize = 10;
  
  // Use standard client to get current user ID
  const standardSupabase = await createStandardClient();
  const { data: { user: currentUser } } = await standardSupabase.auth.getUser();

  // Use service role client to fetch all auth users
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

  // 1. Fetch users from auth with pagination
  const { data: authData, error: authError } = await adminSupabase.auth.admin.listUsers({
    page,
    perPage: pageSize,
  });
  
  if (authError) {
    console.error('Error fetching users:', authError);
    return <div>Error loading users.</div>;
  }

  const users = authData?.users || [];

  // Get total count from user_roles
  const { count } = await adminSupabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true });
    
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  // 2. Fetch roles from public.user_roles for the current page of users
  const userIds = users.map(u => u.id);
  const { data: roles, error: rolesError } = await adminSupabase
    .from('user_roles')
    .select('*')
    .in('user_id', userIds);

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return <div>Error loading roles.</div>;
  }

  // 3. Map together
  const mappedUsers = users.map(u => {
    const roleRecord = roles?.find(r => r.user_id === u.id);
    return {
      id: u.id,
      email: u.email || '',
      name: u.user_metadata?.full_name || u.email || 'Unknown',
      avatar: u.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      role: (roleRecord?.role as 'admin' | 'user') || 'user',
      created_at: u.created_at
    };
  });

  return (
    <div className="w-full pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col h-full">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-argentina-navy dark:text-white">User Directory</h1>
            <p className="text-argentina-navy/60 dark:text-gray-400 mt-1 text-sm">Manage user access and roles for your properties.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-argentina-navy/40 group-focus-within:text-argentina-blue text-xl">search</span>
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white dark:bg-gray-800 text-argentina-navy dark:text-white shadow-soft placeholder-argentina-navy/30 focus:ring-2 focus:ring-argentina-blue focus:bg-white transition-all text-sm" 
                placeholder="Search by email..."
              />
            </div>
            <button className="bg-argentina-blue hover:bg-argentina-blue/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-argentina-blue/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 whitespace-nowrap">
              <span className="material-icons text-base">add</span> Add User
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-6 border-b border-argentina-navy/10 overflow-x-auto">
          <button className="pb-3 text-sm font-semibold text-argentina-blue border-b-2 border-argentina-blue whitespace-nowrap">All Users</button>
          <button className="pb-3 text-sm font-medium text-argentina-navy/60 hover:text-argentina-navy transition-colors whitespace-nowrap">Agents</button>
          <button className="pb-3 text-sm font-medium text-argentina-navy/60 hover:text-argentina-navy transition-colors whitespace-nowrap">Brokers</button>
          <button className="pb-3 text-sm font-medium text-argentina-navy/60 hover:text-argentina-navy transition-colors whitespace-nowrap">Admins</button>
        </div>
      </header>

      <main className="flex-grow pb-12 w-full space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-argentina-navy/50 mb-2">
          <div className="col-span-4">User Details</div>
          <div className="col-span-3">Role & Status</div>
          <div className="col-span-3">Performance</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <UserRoleTable users={mappedUsers} currentUserId={currentUser?.id || ''} />
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-argentina-navy/5 dark:border-argentina-blue/20 flex items-center justify-between bg-argentina-light/50 dark:bg-argentina-blue/5 rounded-xl border mt-4">
          <div className="text-sm text-argentina-navy-muted dark:text-gray-400">
            Showing <span className="font-medium text-argentina-navy dark:text-white">{totalItems === 0 ? 0 : (page - 1) * pageSize + 1}</span> to <span className="font-medium text-argentina-navy dark:text-white">{Math.min(page * pageSize, totalItems)}</span> of <span className="font-medium text-argentina-navy dark:text-white">{totalItems}</span> results
          </div>
          <div className="flex gap-2">
            <Link 
              href={`/${locale}/admin/users?page=${page - 1}`}
              className={`px-3 py-1 text-sm border border-argentina-navy/10 dark:border-argentina-blue/30 rounded-md text-argentina-navy-muted dark:text-gray-300 hover:bg-white dark:hover:bg-argentina-blue/20 transition-colors ${isFirstPage ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={isFirstPage}
            >
              Previous
            </Link>
            <Link 
              href={`/${locale}/admin/users?page=${page + 1}`}
              className={`px-3 py-1 text-sm border border-argentina-navy/10 dark:border-argentina-blue/30 rounded-md text-argentina-navy-muted dark:text-gray-300 hover:bg-white dark:hover:bg-argentina-blue/20 transition-colors ${isLastPage ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={isLastPage}
            >
              Next
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
