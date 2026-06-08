'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UserMenuProps {
  user: {
    email?: string;
    user_metadata: {
      avatar_url?: string;
      full_name?: string;
    };
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const avatarUrl = user.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  const name = user.user_metadata?.full_name || user.email || 'User';

  return (
    <div className="flex items-center gap-3">
      <div className="relative border-argentina-navy/10 flex items-center" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-argentina-blue transition-all relative">
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-50">
              <p className="text-sm font-medium text-argentina-navy truncate">{name}</p>
              {user.email && <p className="text-xs text-argentina-navy-muted truncate">{user.email}</p>}
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <span className="material-icons font-material-icons text-[18px]">close</span>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
