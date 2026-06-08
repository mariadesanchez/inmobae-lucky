'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function UsersSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
      params.set('page', '1');
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="relative group w-full md:w-80 flex h-10 shadow-soft rounded-lg overflow-hidden">
      <input 
        type="text" 
        className="block w-full pl-4 pr-3 py-2 border-none bg-white dark:bg-gray-800 text-argentina-navy dark:text-white placeholder-argentina-navy/30 focus:outline-none transition-all text-sm h-full" 
        placeholder="Buscar por email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button 
        onClick={handleSearch}
        className="h-full px-4 bg-argentina-blue hover:bg-argentina-blue/90 text-white transition-colors flex items-center justify-center cursor-pointer"
        title="Buscar"
      >
        <span className="material-icons text-xl">search</span>
      </button>
    </div>
  );
}
