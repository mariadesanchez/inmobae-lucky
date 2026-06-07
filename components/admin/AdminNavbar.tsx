'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface AdminNavbarProps {
  
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    }
  };
}

export default function AdminNavbar({ user }: AdminNavbarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <nav className="bg-white dark:bg-[#152e2a] border-b border-argentina-navy/5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-12">
          <Link href={``} className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <span className="text-2xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-argentina-navy to-argentina-blue">Inmobae-Lucky</span>
          </Link>
          <div className="hidden md:flex space-x-2">
            <Link 
              href={`/admin/properties`}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${isProperties ? 'text-argentina-blue bg-argentina-sun/30 border-b-2 border-argentina-blue' : 'text-argentina-navy/60 dark:text-gray-400 hover:text-argentina-blue hover:bg-argentina-navy/5'}`}
            >
              <span className="material-icons text-[18px]">holiday_village</span>
              Properties
            </Link>
            <Link 
              href={`/admin/users`}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${isUsers ? 'text-argentina-blue bg-argentina-sun/30 border-b-2 border-argentina-blue' : 'text-argentina-navy/60 dark:text-gray-400 hover:text-argentina-blue hover:bg-argentina-navy/5'}`}
            >
              <span className="material-icons text-[18px]">people</span>
              Users
            </Link>
            <Link 
              href={``}
              className="text-argentina-navy/60 dark:text-gray-400 hover:text-argentina-blue hover:bg-argentina-navy/5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1"
            >
              Main Site
              <span className="material-icons text-[14px]">open_in_new</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-argentina-navy/60 dark:text-gray-400 hover:text-argentina-blue transition-colors">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button className="hidden sm:block text-argentina-navy/60 dark:text-gray-400 hover:text-argentina-blue transition-colors relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#152e2a]"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 ml-2 border-l border-argentina-navy/10 dark:border-white/10" ref={dropdownRef}>
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-argentina-navy dark:text-white">{name}</span>
              <span className="text-xs text-argentina-navy-muted dark:text-gray-400">Administrator</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-9 w-9 rounded-full bg-argentina-navy/10 flex items-center justify-center overflow-hidden border border-argentina-navy/10 hover:ring-2 hover:ring-argentina-blue/50 transition-all cursor-pointer"
              >
                <img
                  src={avatarUrl}
                  alt={name}
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1f3e3a] rounded-xl shadow-lg border border-argentina-navy/5 py-1 z-50">
                  <div className="px-4 py-2 border-b border-argentina-navy/5 dark:border-white/5 sm:hidden">
                    <p className="text-sm font-medium text-argentina-navy dark:text-white truncate">{name}</p>
                    {user.email && <p className="text-xs text-argentina-navy-muted dark:text-gray-400 truncate">{user.email}</p>}
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

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-argentina-navy/70 dark:text-gray-300 hover:bg-argentina-navy/5 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-icons text-xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-argentina-navy/10 bg-white dark:bg-[#152e2a] shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link
              href={`/admin/properties`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${isProperties ? 'text-argentina-blue bg-argentina-sun/30' : 'text-argentina-navy/70 dark:text-gray-300 hover:bg-argentina-navy/5'}`}
            >
              <span className="material-icons text-base">holiday_village</span>
              Properties
            </Link>
            <Link
              href={`/admin/users`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${isUsers ? 'text-argentina-blue bg-argentina-sun/30' : 'text-argentina-navy/70 dark:text-gray-300 hover:bg-argentina-navy/5'}`}
            >
              <span className="material-icons text-base">people</span>
              Users
            </Link>
            <Link
              href={``}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-argentina-navy/60 dark:text-gray-400 hover:bg-argentina-navy/5"
            >
              <span className="material-icons text-base">open_in_new</span>
              Sitio Principal
            </Link>
            <div className="pt-2 border-t border-argentina-navy/10">
              <button
                onClick={handleSignOut}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <span className="material-icons text-base">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
