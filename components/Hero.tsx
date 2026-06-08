'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FiltersModal from './FiltersModal';

const CATEGORY_FILTERS = [
  { id: 'All', key: 'Todos', label: 'Tipo de propiedad' },
  { id: 'Terreno', key: 'Terreno', label: 'Terreno' },
  { id: 'Casa', key: 'Casa', label: 'Casa' },
  { id: 'Departamento', key: 'Departamento', label: 'Departamento' },
  { id: 'PH', key: 'PH', label: 'PH' },
  { id: 'Cochera', key: 'Cochera', label: 'Cochera' },
  { id: 'Local', key: 'Local', label: 'Local' },
  { id: 'Edificio Comercial', key: 'Edificio Comercial', label: 'Edificio Comercial' },
  { id: 'Campo', key: 'Campo', label: 'Campo' },
  { id: 'Oficina', key: 'Oficina', label: 'Oficina' },
  { id: 'Quinta', key: 'Quinta', label: 'Quinta' },
  { id: 'Depósito', key: 'Depósito', label: 'Depósito' },
  { id: 'Fondo de Comercio', key: 'Fondo de Comercio', label: 'Fondo de Comercio' },
  { id: 'Chacra', key: 'Chacra', label: 'Chacra' },
  { id: 'Hotel', key: 'Hotel', label: 'Hotel' }
];

const HeroInner = ({ dict }: { dict?: any }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get('location') ?? '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('type') ?? 'Todos');
  const [activeOperation, setActiveOperation] = useState('comprar');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('location', searchText.trim());
    if (activeCategory !== 'Todos') params.set('type', activeCategory);
    params.set('status', activeOperation);
    params.set('page', '1');
    router.push(`/buscar?${params.toString()}`);
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
      <div className="absolute inset-0 z-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center">
        
        {/* Floating Box Container */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)] hover:-translate-y-1.5 transition-all duration-500 p-4 sm:p-6 sm:pb-8 flex flex-col gap-4 sm:gap-6 mt-16 ring-1 ring-white/20">
          
          {/* Top Row: Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-start border-b border-gray-200 pb-2 gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-6 text-sm font-bold text-gray-400 overflow-x-auto hide-scroll w-full">
              {['COMPRAR', 'ALQUILAR'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveOperation(tab === 'COMPRAR' ? 'comprar' : 'alquilar')}
                  className={`pb-2 relative whitespace-nowrap transition-colors ${
                    (tab === 'COMPRAR' && activeOperation === 'comprar') || 
                    (tab === 'ALQUILAR' && activeOperation === 'alquilar')
                      ? 'text-argentina-blue' 
                      : 'hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {((activeOperation === 'comprar' && tab === 'COMPRAR') ||
                    (activeOperation === 'alquilar' && tab === 'ALQUILAR')) && (
                    <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-argentina-blue" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row: Search Inputs */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Property Type Select */}
            <div className="sm:w-1/3 relative">
              <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded text-gray-700 font-medium outline-none focus:border-argentina-blue focus:ring-1 focus:ring-argentina-blue transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[position:calc(100%-1rem)_center] bg-[length:1em]"
              >
                {CATEGORY_FILTERS.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Location Input and Search Button */}
            <div className="flex-1 flex border border-gray-300 rounded overflow-hidden focus-within:border-argentina-blue focus-within:ring-1 focus-within:ring-argentina-blue transition-all bg-white h-12">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ingresá localidades o barrios"
                className="flex-1 px-4 h-full bg-transparent text-gray-800 placeholder-gray-400 font-medium outline-none"
              />
              <button
                onClick={handleSearch}
                className="w-12 h-full bg-argentina-blue hover:bg-argentina-blue/90 text-white transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Buscar"
              >
                <span className="material-icons font-bold text-xl">search</span>
              </button>
            </div>
            {/* Filter Button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="h-12 px-4 border border-gray-300 rounded bg-white text-gray-700 font-medium hover:border-argentina-blue hover:text-argentina-blue transition-all flex items-center gap-2 flex-shrink-0"
            >
              <span className="material-icons text-[20px]">tune</span>
              <span className="hidden sm:inline">Más Filtros</span>
            </button>
          </div>

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
