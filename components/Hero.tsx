'use client';

import { useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import FiltersModal from './FiltersModal';

const CATEGORY_FILTERS = [
  { id: 'All', key: 'any', label: 'Todas' },
  { id: 'House', key: 'house', label: 'Casas' },
  { id: 'Apartment', key: 'apartment', label: 'Departamentos' },
  { id: 'Villa', key: 'villa', label: 'Villas' },
  { id: 'Penthouse', key: 'penthouse', label: 'Penthouses' }
];

const HeroInner = ({ dict }: { dict?: any }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get('location') ?? '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('type') ?? 'All');
  const [activeOperation, setActiveOperation] = useState('Venta');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('location', searchText.trim());
    if (activeCategory !== 'All') params.set('type', activeCategory);
    // You can extend the API to filter by operation later
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}#propiedades`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center pt-20 pb-16 mt-[-80px] z-0">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center gap-4 mt-16">
        
        {/* Search Bar Container */}
        <div className="w-full max-w-5xl bg-white rounded-xl sm:rounded-sm shadow-2xl flex flex-col sm:flex-row overflow-hidden border border-white/20">
          
          {/* Operation Type */}
          <div className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-200">
            <select 
              value={activeOperation}
              onChange={(e) => setActiveOperation(e.target.value)}
              className="w-full h-full min-h-[60px] px-6 bg-transparent text-gray-700 font-medium outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[position:calc(100%-1rem)_center] bg-[length:1em]"
            >
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Comercial">Comercial</option>
            </select>
          </div>

          {/* Property Type */}
          <div className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-200">
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full h-full min-h-[60px] px-6 bg-transparent text-gray-700 font-medium outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[position:calc(100%-1rem)_center] bg-[length:1em]"
            >
              {CATEGORY_FILTERS.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Location Input */}
          <div className="flex-[2] relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ingresa Ubicación, Asesor, Oficina, ID"
              className="w-full h-full min-h-[60px] pl-6 pr-12 bg-transparent text-gray-800 placeholder-gray-400 font-medium outline-none"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="min-h-[60px] w-full sm:w-[80px] bg-[#C8B17A] hover:bg-[#b09b67] text-black transition-colors flex items-center justify-center"
            aria-label="Buscar"
          >
            <span className="material-icons font-bold text-2xl">search</span>
          </button>
        </div>

      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setFiltersOpen(false)}
        dict={dict?.filters}
      />
    </section>
  );
};

const Hero = ({ dict }: { dict?: any }) => (
  <Suspense>
    <HeroInner dict={dict} />
  </Suspense>
);

export default Hero;
