import { createServerClient } from '@supabase/ssr';
import UserRoleTable from '@/components/admin/UserRoleTable';
import { createClient as createStandardClient } from '@/lib/supabase/server';
import Link from 'next/link';
import UsersSearch from '@/components/admin/UsersSearch';
import AddUserModal from '@/components/admin/AddUserModal';

export default async function AdminUsersPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  
  
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

  // 1. Fetch users from auth
  const { data: authData, error: authError } = await adminSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  
  if (authError) {
    console.error('Error fetching users:', authError);
    return <div>Error loading users.</div>;
  }

  const allUsers = authData?.users || [];

  // 2. Fetch roles
  const { data: roles, error: rolesError } = await adminSupabase
    .from('user_roles')
    .select('*');

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return <div>Error loading roles.</div>;
  }

  // 3. Map together
  const mappedUsers = allUsers.map(u => {
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

  const searchTerm = (resolvedSearchParams.search as string || '').toLowerCase();
  
  // Filter
  let filteredUsers = mappedUsers;
  if (searchTerm) {
    filteredUsers = mappedUsers.filter(u => 
      u.email.toLowerCase().includes(searchTerm) || 
      u.name.toLowerCase().includes(searchTerm)
    );
  }

  // Paginate
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Ensure current page is valid
  const currentPage = Math.min(Math.max(1, page), totalPages);
  
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="w-full pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col h-full">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-argentina-navy dark:text-white">Administrar Usuarios</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <UsersSearch />
            <AddUserModal />
          </div>
        </div>

      </header>

      <main className="flex-grow pb-12 w-full space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-argentina-navy/50 mb-2">
          <div className="col-span-4">User Details</div>
          <div className="col-span-3">Role & Status</div>
          <div className="col-span-3">Performance</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <UserRoleTable users={paginatedUsers} currentUserId={currentUser?.id || ''} />
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-argentina-navy/5 dark:border-argentina-blue/20 flex items-center justify-between bg-argentina-light/50 dark:bg-argentina-blue/5 rounded-xl border mt-4">
          <div className="text-sm text-argentina-navy-muted dark:text-gray-400">
            Showing <span className="font-medium text-argentina-navy dark:text-white">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-argentina-navy dark:text-white">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-medium text-argentina-navy dark:text-white">{totalItems}</span> results
          </div>
          <div className="flex gap-2">
            <Link 
              href={`/admin/users?page=${currentPage - 1}${searchTerm ? '&search=' + searchTerm : ''}`}
              className={`px-3 py-1 text-sm border border-argentina-navy/10 dark:border-argentina-blue/30 rounded-md text-argentina-navy-muted dark:text-gray-300 hover:bg-white dark:hover:bg-argentina-blue/20 transition-colors ${isFirstPage ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={isFirstPage}
            >
              Previous
            </Link>
            <Link 
              href={`/admin/users?page=${currentPage + 1}${searchTerm ? '&search=' + searchTerm : ''}`}
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
