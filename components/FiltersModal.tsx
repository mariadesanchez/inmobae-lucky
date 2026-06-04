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
  amenities: string[];
}

const AMENITIES = [
  { id: 'pool', label: 'Swimming Pool', icon: 'pool' },
  { id: 'gym', label: 'Gym', icon: 'fitness_center' },
  { id: 'parking', label: 'Parking', icon: 'local_parking' },
  { id: 'ac', label: 'Air Conditioning', icon: 'ac_unit' },
  { id: 'wifi', label: 'High-speed Wifi', icon: 'wifi' },
  { id: 'terrace', label: 'Patio / Terrace', icon: 'deck' },
];

const PROPERTY_TYPES = ['Any Type', 'House', 'Apartment', 'Condo', 'Townhouse', 'Villa', 'Penthouse'];

const MIN_PRICE = 0;
const MAX_PRICE = 10_000_000;

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount?: number;
}

export default function FiltersModal({ isOpen, onClose, totalCount }: FiltersModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL
  const [filters, setFilters] = useState<FiltersState>({
    location: searchParams.get('location') ?? '',
    minPrice: Number(searchParams.get('minPrice') ?? MIN_PRICE),
    maxPrice: Number(searchParams.get('maxPrice') ?? MAX_PRICE),
    propertyType: searchParams.get('type') ?? 'Any Type',
    beds: Number(searchParams.get('beds') ?? 0),
    baths: Number(searchParams.get('baths') ?? 0),
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : [],
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
      propertyType: 'Any Type',
      beds: 0,
      baths: 0,
      amenities: [],
    });
  };

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.minPrice > MIN_PRICE) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice < MAX_PRICE) params.set('maxPrice', String(filters.maxPrice));
    if (filters.propertyType !== 'Any Type') params.set('type', filters.propertyType);
    if (filters.beds > 0) params.set('beds', String(filters.beds));
    if (filters.baths > 0) params.set('baths', String(filters.baths));
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
      aria-label="Property Filters"
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
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Close filters"
          >
            <span className="material-icons font-material-icons">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">

          {/* Section 1: Location */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Location
            </label>
            <div className="relative group">
              <span className="material-icons font-material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-mosque transition-colors">
                location_on
              </span>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                placeholder="City, neighborhood, or address"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-mosque focus:bg-white transition-all shadow-sm outline-none"
              />
            </div>
          </section>

          {/* Section 2: Price Range */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Price Range
              </label>
              <span className="text-sm font-medium text-mosque">
                {formatPrice(filters.minPrice)} – {formatPrice(filters.maxPrice)}
              </span>
            </div>

            {/* Dual range slider visual */}
            <div className="relative h-12 flex items-center mb-6 px-2">
              <div className="absolute inset-x-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-mosque"
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
              <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Min Price</label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    type="text"
                    value={filters.minPrice.toLocaleString('en-US')}
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
              <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Max Price</label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    type="text"
                    value={filters.maxPrice.toLocaleString('en-US')}
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

          {/* Section 3: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Type */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Property Type
              </label>
              <div className="relative">
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters((p) => ({ ...p, propertyType: e.target.value }))}
                  className="w-full bg-gray-50 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-mosque cursor-pointer outline-none"
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

            {/* Beds & Baths counters */}
            <div className="space-y-4">
              {/* Bedrooms */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Bedrooms</span>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                  <button
                    onClick={() => setFilters((p) => ({ ...p, beds: Math.max(0, p.beds - 1) }))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-40 transition-colors"
                    disabled={filters.beds === 0}
                  >
                    <span className="material-icons font-material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">
                    {filters.beds === 0 ? 'Any' : `${filters.beds}+`}
                  </span>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, beds: p.beds + 1 }))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                  >
                    <span className="material-icons font-material-icons text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Bathrooms</span>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                  <button
                    onClick={() => setFilters((p) => ({ ...p, baths: Math.max(0, p.baths - 1) }))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-40 transition-colors"
                    disabled={filters.baths === 0}
                  >
                    <span className="material-icons font-material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">
                    {filters.baths === 0 ? 'Any' : `${filters.baths}+`}
                  </span>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, baths: p.baths + 1 }))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                  >
                    <span className="material-icons font-material-icons text-base">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Amenities */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Amenities &amp; Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES.map((amenity) => {
                const active = filters.amenities.includes(amenity.id);
                return (
                  <label key={amenity.id} className="cursor-pointer group relative">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="sr-only peer"
                    />
                    <div
                      className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all
                        ${active
                          ? 'border-mosque bg-mosque/5 text-mosque font-medium'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <span className={`material-icons font-material-icons text-lg ${active ? 'text-mosque' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {amenity.icon}
                      </span>
                      {amenity.label}
                    </div>
                    {active && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full" />
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
          <button
            onClick={clearAll}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline decoration-gray-300 underline-offset-4"
          >
            Clear all filters
          </button>
          <button
            onClick={applyFilters}
            className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 active:scale-95"
          >
            {totalCount !== undefined ? `Show ${totalCount} Homes` : 'Apply Filters'}
            <span className="material-icons font-material-icons text-sm">arrow_forward</span>
          </button>
        </footer>
      </div>


    </div>
  );
}
