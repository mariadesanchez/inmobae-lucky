'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function UsersSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
      params.set('page', '1');
    } else {
      params.delete('search');
    }
    window.location.href = `${pathname}?${params.toString()}`;
  };

  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    window.location.href = `${pathname}?${params.toString()}`;
  };

  return (
    <form onSubmit={handleSearch} className="relative group w-full md:w-80 flex h-10 shadow-soft rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="relative flex-1">
        <input 
          type="text" 
          className="block w-full pl-4 pr-10 py-2 border-none bg-transparent text-argentina-navy dark:text-white placeholder-argentina-navy/30 focus:outline-none transition-all text-sm h-full" 
          placeholder="Buscar por email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-0 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Borrar búsqueda"
          >
            <span className="material-icons text-[16px]">close</span>
          </button>
        )}
      </div>
      <button 
        type="submit"
        className="h-full px-4 bg-argentina-blue hover:bg-argentina-blue/90 text-white transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
        title="Buscar"
      >
        <span className="material-icons text-xl">search</span>
      </button>
    </form>
  );
}
