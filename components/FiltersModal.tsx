'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

interface FiltersState {
  location: string;
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  beds: number;
  baths: number;
  parking: number;
  amenities: string[];
  minArea: number;
  maxArea: number;
  age: string;
  disposition: string;
  featuredStatus: string;
  datePublished: string;
}

const PROPERTY_FEATURES = {
  property: ['Amoblado', 'Permite Mascotas', 'Apto profesional'],
  rooms: ['Cocina', 'Balcón', 'Living', 'Terraza', 'Jardín', 'Patio', 'Toilette', 'Dormitorio en suite', 'Oficina'],
  services: ['Agua Corriente', 'Luz', 'Gas natural', 'Wifi / Internet', 'Calefaccion'],
  amenities: ['Pileta', 'Parrilla', 'Seguridad', 'Ascensor', 'Aire acondicionado', 'SUM', 'Lavadero']
};



const PROPERTY_TYPES = ['Todos', 'Terreno', 'Casa', 'Departamento', 'PH', 'Cochera', 'Local', 'Edificio Comercial', 'Campo', 'Oficina', 'Quinta', 'Depósito', 'Fondo de Comercio', 'Chacra', 'Hotel'];

const MIN_PRICE = 0;
const MAX_PRICE = 10_000_000;

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount?: number;
  dict?: any;
}

export default function FiltersModal({ isOpen, onClose, totalCount, dict }: FiltersModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL
  const [filters, setFilters] = useState<FiltersState>({
    location: searchParams.get('location') ?? '',
    minPrice: Number(searchParams.get('minPrice') ?? MIN_PRICE),
    maxPrice: Number(searchParams.get('maxPrice') ?? MAX_PRICE),
    propertyType: searchParams.get('type') || 'Todos',
    beds: Number(searchParams.get('beds') ?? 0),
    baths: Number(searchParams.get('baths') ?? 0),
    parking: Number(searchParams.get('parking') ?? 0),
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : [],
    minArea: Number(searchParams.get('minArea') ?? 0),
    maxArea: Number(searchParams.get('maxArea') ?? 10000),
    age: searchParams.get('age') || '',
    disposition: searchParams.get('disposition') || 'Cualquiera',
    featuredStatus: searchParams.get('featuredStatus') || 'Todas',
    datePublished: searchParams.get('datePublished') || 'Cualquiera',
  });

  // Slider thumb positions (0-100%)
  const minPct = ((filters.minPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPct = ((filters.maxPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  const formatPrice = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const toggleAmenity = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
    }));
  };

  const clearAll = () => {
    setFilters({
      location: '',
      minPrice: MIN_PRICE,
      maxPrice: MAX_PRICE,
      propertyType: 'Todos',
      beds: 0,
      baths: 0,
      parking: 0,
      amenities: [],
      minArea: 0,
      maxArea: 10000,
      age: '',
      disposition: 'Cualquiera',
      featuredStatus: 'Todas',
      datePublished: 'Cualquiera',
    });
  };

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.minPrice > MIN_PRICE) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice < MAX_PRICE) params.set('maxPrice', String(filters.maxPrice));
    if (filters.propertyType !== 'Todos') params.set('type', filters.propertyType);
    if (filters.beds > 0) params.set('beds', String(filters.beds));
    if (filters.baths > 0) params.set('baths', String(filters.baths));
    if (filters.parking > 0) params.set('parking', String(filters.parking));
    if (filters.minArea > 0) params.set('minArea', String(filters.minArea));
    if (filters.maxArea < 10000) params.set('maxArea', String(filters.maxArea));
    if (filters.age !== '') params.set('age', filters.age);
    if (filters.disposition !== 'Cualquiera') params.set('disposition', filters.disposition);
    if (filters.featuredStatus !== 'Todas') params.set('featuredStatus', filters.featuredStatus);
    if (filters.datePublished !== 'Cualquiera') params.set('datePublished', filters.datePublished);
    if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);
    onClose();
  }, [filters, pathname, router, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Filtros de Propiedades"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Cerrar filtros"
          >
            <span className="material-icons font-material-icons">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">

          {/* Section 1: Location */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Ubicación
            </label>
            <div className="relative group">
              <span className="material-icons font-material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-argentina-blue transition-colors">
                location_on
              </span>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                placeholder="Ciudad, barrio, o dirección"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-argentina-blue focus:bg-white transition-all shadow-sm outline-none"
              />
            </div>
          </section>

          {/* Section 2: Price Range */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rango de Precio
              </label>
              <span className="text-sm font-medium text-argentina-blue">
                {formatPrice(filters.minPrice)} – {formatPrice(filters.maxPrice)}
              </span>
            </div>

            {/* Dual range slider visual */}
            <div className="relative h-12 flex items-center mb-6 px-2">
              <div className="absolute inset-x-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-argentina-blue"
                  style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                />
              </div>
              {/* Min handle */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={50_000}
                value={filters.minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val < filters.maxPrice) setFilters((p) => ({ ...p, minPrice: val }));
                }}
                className="filter-range"
                style={{ zIndex: filters.minPrice > MAX_PRICE * 0.9 ? 5 : 3 }}
              />
              {/* Max handle */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={50_000}
                value={filters.maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val > filters.minPrice) setFilters((p) => ({ ...p, maxPrice: val }));
                }}
                className="filter-range"
                style={{ zIndex: 4 }}
              />
            </div>

            {/* Min / Max inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-argentina-blue/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Precio Mínimo</label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    type="text"
                    value={filters.minPrice.toLocaleString('es-AR')}
                    onChange={(e) => {
                      const cleaned = Number(e.target.value.replace(/\D/g, ''));
                      if (!isNaN(cleaned) && cleaned < filters.maxPrice) {
                        setFilters((p) => ({ ...p, minPrice: cleaned }));
                      }
                    }}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-argentina-blue/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Precio Máximo</label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    type="text"
                    value={filters.maxPrice.toLocaleString('es-AR')}
                    onChange={(e) => {
                      const cleaned = Number(e.target.value.replace(/\D/g, ''));
                      if (!isNaN(cleaned) && cleaned > filters.minPrice) {
                        setFilters((p) => ({ ...p, maxPrice: cleaned }));
                      }
                    }}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          
          {/* Section 3: Destacadas vs Comunes & Published Date */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mostrar Propiedades
              </label>
              <div className="relative">
                <select
                  value={filters.featuredStatus}
                  onChange={(e) => setFilters((p) => ({ ...p, featuredStatus: e.target.value }))}
                  className="w-full bg-gray-50 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  <option value="Todas">Todas</option>
                  <option value="Destacadas">Solo Destacadas</option>
                  <option value="Comunes">Solo Comunes</option>
                </select>
                <span className="material-icons font-material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fecha de Publicación
              </label>
              <div className="relative">
                <select
                  value={filters.datePublished}
                  onChange={(e) => setFilters((p) => ({ ...p, datePublished: e.target.value }))}
                  className="w-full bg-gray-50 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  <option value="Cualquiera">Cualquiera</option>
                  <option value="Hoy">Hoy</option>
                  <option value="Última semana">Última semana</option>
                  <option value="Últimos 15 días">Últimos 15 días</option>
                  <option value="Últimos 30 días">Últimos 30 días</option>
                  <option value="Últimos 45 días">Últimos 45 días</option>
                </select>
                <span className="material-icons font-material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </section>

          {/* Section 4: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tipo de Propiedad
              </label>
              <div className="relative">
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters((p) => ({ ...p, propertyType: e.target.value }))}
                  className="w-full bg-gray-50 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <span className="material-icons font-material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-argentina-blue/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Área Mínima (m²)</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={filters.minArea}
                    onChange={(e) => {
                      const cleaned = Number(e.target.value.replace(/\D/g, ''));
                      if (!isNaN(cleaned)) {
                        setFilters((p) => ({ ...p, minArea: cleaned }));
                      }
                    }}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm outline-none"
                  />
                  <span className="text-gray-400 ml-1 text-xs">m²</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-argentina-blue/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Área Máxima (m²)</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={filters.maxArea === 10000 ? '' : filters.maxArea}
                    placeholder="Sin límite"
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setFilters((p) => ({ ...p, maxArea: 10000 }));
                        return;
                      }
                      const cleaned = Number(e.target.value.replace(/\D/g, ''));
                      if (!isNaN(cleaned)) {
                        setFilters((p) => ({ ...p, maxArea: cleaned }));
                      }
                    }}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm outline-none placeholder-gray-400"
                  />
                  <span className="text-gray-400 ml-1 text-xs">m²</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Año de Construcción</span>
                <input
                  type="text"
                  placeholder="YYYY"
                  value={filters.age}
                  onChange={(e) => setFilters((p) => ({ ...p, age: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  className="w-24 bg-gray-50 border-0 rounded-lg py-2 px-3 text-gray-900 text-sm text-center focus:ring-2 focus:ring-argentina-blue outline-none"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Disposición</span>
                <select
                  value={filters.disposition}
                  onChange={(e) => setFilters((p) => ({ ...p, disposition: e.target.value }))}
                  className="w-40 bg-gray-50 border-0 rounded-lg py-2 pl-3 pr-8 text-gray-900 text-sm appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  <option value="Cualquiera">Cualquiera</option>
                  <option value="Frente">Frente</option>
                  <option value="Contrafrente">Contrafrente</option>
                  <option value="Lateral">Lateral</option>
                  <option value="Interior">Interior</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Dormitorios</span>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1 border border-gray-100">
                  <button onClick={() => setFilters((p) => ({ ...p, beds: Math.max(0, p.beds - 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-argentina-blue disabled:opacity-40 transition-colors" disabled={filters.beds === 0}><span className="material-icons font-material-icons text-base">remove</span></button>
                  <span className="text-sm font-semibold w-6 text-center">{filters.beds === 0 ? 'Cualq.' : `${filters.beds}+`}</span>
                  <button onClick={() => setFilters((p) => ({ ...p, beds: p.beds + 1 }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-argentina-blue hover:bg-argentina-blue hover:text-white transition-colors"><span className="material-icons font-material-icons text-base">add</span></button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Baños</span>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1 border border-gray-100">
                  <button onClick={() => setFilters((p) => ({ ...p, baths: Math.max(0, p.baths - 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-argentina-blue disabled:opacity-40 transition-colors" disabled={filters.baths === 0}><span className="material-icons font-material-icons text-base">remove</span></button>
                  <span className="text-sm font-semibold w-6 text-center">{filters.baths === 0 ? 'Cualq.' : `${filters.baths}+`}</span>
                  <button onClick={() => setFilters((p) => ({ ...p, baths: p.baths + 1 }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-argentina-blue hover:bg-argentina-blue hover:text-white transition-colors"><span className="material-icons font-material-icons text-base">add</span></button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Cocheras</span>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1 border border-gray-100">
                  <button onClick={() => setFilters((p) => ({ ...p, parking: Math.max(0, p.parking - 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-argentina-blue disabled:opacity-40 transition-colors" disabled={filters.parking === 0}><span className="material-icons font-material-icons text-base">remove</span></button>
                  <span className="text-sm font-semibold w-6 text-center">{filters.parking === 0 ? 'Cualq.' : `${filters.parking}+`}</span>
                  <button onClick={() => setFilters((p) => ({ ...p, parking: p.parking + 1 }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-argentina-blue hover:bg-argentina-blue hover:text-white transition-colors"><span className="material-icons font-material-icons text-base">add</span></button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Características y Comodidades */}
          <section className="border-t border-gray-100 pt-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Características y Comodidades</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Propiedad & Ambientes (Left Column) */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-argentina-navy mb-4">Propiedad</h4>
                  <div className="space-y-3">
                    {PROPERTY_FEATURES.property.map((amenity) => {
                      const active = filters.amenities.includes(amenity);
                      return (
                        <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={active} onChange={() => toggleAmenity(amenity)} className="w-4 h-4 text-argentina-blue bg-white border-gray-300 rounded focus:ring-argentina-blue cursor-pointer" />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-argentina-navy mb-4">Ambientes</h4>
                  <div className="space-y-3">
                    {PROPERTY_FEATURES.rooms.map((amenity) => {
                      const active = filters.amenities.includes(amenity);
                      return (
                        <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={active} onChange={() => toggleAmenity(amenity)} className="w-4 h-4 text-argentina-blue bg-white border-gray-300 rounded focus:ring-argentina-blue cursor-pointer" />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Servicios & Comodidades (Right Column) */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-argentina-navy mb-4">Servicios</h4>
                  <div className="space-y-3">
                    {PROPERTY_FEATURES.services.map((amenity) => {
                      const active = filters.amenities.includes(amenity);
                      return (
                        <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={active} onChange={() => toggleAmenity(amenity)} className="w-4 h-4 text-argentina-blue bg-white border-gray-300 rounded focus:ring-argentina-blue cursor-pointer" />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-argentina-navy mb-4">Comodidades</h4>
                  <div className="space-y-3">
                    {PROPERTY_FEATURES.amenities.map((amenity) => {
                      const active = filters.amenities.includes(amenity);
                      return (
                        <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={active} onChange={() => toggleAmenity(amenity)} className="w-4 h-4 text-argentina-blue bg-white border-gray-300 rounded focus:ring-argentina-blue cursor-pointer" />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
          <button
            onClick={clearAll}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline decoration-gray-300 underline-offset-4"
          >
            Limpiar filtros
          </button>
          <button
            onClick={applyFilters}
            className="bg-argentina-blue hover:bg-argentina-blue/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-argentina-blue/30 transition-all hover:shadow-argentina-blue/40 flex items-center gap-2 active:scale-95"
          >
            {totalCount !== undefined 
              ? `Mostrar ${totalCount} Propiedades` 
              : 'Aplicar Filtros'}
            <span className="material-icons font-material-icons text-sm">arrow_forward</span>
          </button>
        </footer>
      </div>

    </div>
  );
}
