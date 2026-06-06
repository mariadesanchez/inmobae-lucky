'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface AdminNavbarProps {
  locale: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    }
  };
}

export default function AdminNavbar({ locale, user }: AdminNavbarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name = user.user_metadata?.full_name || user.email || 'Admin';
  const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=006655&color=fff`;

  const isUsers = pathname.includes('/users');
  const isProperties = pathname.includes('/admin/properties') || (!isUsers && pathname.includes('/admin'));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="bg-white dark:bg-[#152e2a] border-b border-nordic/5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-12">
          <Link href={`/${locale}`} className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <span className="material-symbols-outlined text-mosque text-2xl group-hover:scale-110 transition-transform">apartment</span>
            <span className="font-bold text-lg text-nordic dark:text-white tracking-tight">LuxeEstate</span>
          </Link>
          <div className="hidden md:flex space-x-2">
            <Link 
              href={`/${locale}/admin/properties`}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${isProperties ? 'text-mosque bg-hint-of-green/30 border-b-2 border-mosque' : 'text-nordic/60 dark:text-gray-400 hover:text-mosque hover:bg-nordic/5'}`}
            >
              <span className="material-icons text-[18px]">holiday_village</span>
              Properties
            </Link>
            <Link 
              href={`/${locale}/admin/users`}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${isUsers ? 'text-mosque bg-hint-of-green/30 border-b-2 border-mosque' : 'text-nordic/60 dark:text-gray-400 hover:text-mosque hover:bg-nordic/5'}`}
            >
              <span className="material-icons text-[18px]">people</span>
              Users
            </Link>
            <Link 
              href={`/${locale}`}
              className="text-nordic/60 dark:text-gray-400 hover:text-mosque hover:bg-nordic/5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1"
            >
              Main Site
              <span className="material-icons text-[14px]">open_in_new</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button className="text-nordic/60 dark:text-gray-400 hover:text-mosque transition-colors">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button className="text-nordic/60 dark:text-gray-400 hover:text-mosque transition-colors relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#152e2a]"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 ml-2 border-l border-nordic/10 dark:border-white/10" ref={dropdownRef}>
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-nordic dark:text-white">{name}</span>
              <span className="text-xs text-nordic-muted dark:text-gray-400">Administrator</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-9 w-9 rounded-full bg-nordic/10 flex items-center justify-center overflow-hidden border border-nordic/10 hover:ring-2 hover:ring-mosque/50 transition-all cursor-pointer"
              >
                <img
                  src={avatarUrl}
                  alt={name}
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1f3e3a] rounded-xl shadow-lg border border-nordic/5 py-1 z-50">
                  <div className="px-4 py-2 border-b border-nordic/5 dark:border-white/5 sm:hidden">
                    <p className="text-sm font-medium text-nordic dark:text-white truncate">{name}</p>
                    {user.email && <p className="text-xs text-nordic-muted dark:text-gray-400 truncate">{user.email}</p>}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                  >
                    <span className="material-icons font-material-icons text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
