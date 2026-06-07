'use client';

import { useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import FiltersModal from './FiltersModal';

const CATEGORY_FILTERS = [
  { id: 'All', key: 'any' },
  { id: 'House', key: 'house' },
  { id: 'Apartment', key: 'apartment' },
  { id: 'Villa', key: 'villa' },
  { id: 'Penthouse', key: 'penthouse' }
];

const HeroInner = ({ dict }: { dict?: any }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get('location') ?? '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('type') ?? 'All');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('location', searchText.trim());
    if (activeCategory !== 'All') params.set('type', activeCategory);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('location', searchText.trim());
    if (cat !== 'All') params.set('type', cat);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-argentina-navy leading-tight">
          {dict?.title || 'Find your '}{' '}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">{dict?.highlight || 'sanctuary'}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-argentina-blue/20 -rotate-1 z-0"></span>
          </span>
          .
        </h1>

        {/* Search Bar */}
        <div className="relative group max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-icons text-argentina-navy-muted text-2xl group-focus-within:text-argentina-blue transition-colors font-material-icons">
                  search
                </span>
              </div>
              <input
                type="text"
                id="hero-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full pl-12 pr-4 py-4 rounded-xl sm:rounded-r-none border-none bg-white text-argentina-navy shadow-soft placeholder-argentina-navy-muted/60 focus:ring-2 focus:ring-argentina-blue focus:bg-white transition-all text-lg outline-none"
                placeholder={dict?.searchPlaceholder || "Search by city, neighborhood, or address..."}
              />
            </div>
            <button
              id="hero-search-btn"
              onClick={handleSearch}
              className="w-full sm:w-auto px-6 py-4 bg-argentina-blue hover:bg-argentina-blue/90 text-white font-medium rounded-xl sm:rounded-l-none transition-colors flex items-center justify-center shadow-lg shadow-argentina-blue/20"
            >
              {dict?.search || 'Search'}
            </button>
          </div>
        </div>

        {/* Category filter — stacked full-width on mobile, pills row on desktop */}
        <div className="max-w-2xl mx-auto">

          {/* Mobile: stacked full-width buttons */}
          <div className="flex flex-col gap-2 sm:hidden">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                id={`category-${cat.id.toLowerCase()}-mobile`}
                onClick={() => handleCategory(cat.id)}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-argentina-navy text-white shadow-md'
                    : 'bg-white border border-argentina-navy/10 text-argentina-navy-muted hover:text-argentina-navy hover:border-argentina-blue/40'
                }`}
              >
                {cat.id === 'All' && dict?.any ? dict.any : cat.id}
              </button>
            ))}
            <button
              id="filters-btn-mobile"
              onClick={() => setFiltersOpen(true)}
              className="w-full py-3 rounded-xl text-sm font-medium bg-white border border-argentina-navy/10 text-argentina-navy flex items-center justify-center gap-2 hover:bg-argentina-blue/5 transition-colors"
            >
              <span className="material-icons text-base font-material-icons">tune</span>
              {dict?.filters || 'Filters'}
            </button>
          </div>

          {/* Desktop: horizontal pill row */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto hide-scroll py-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                id={`category-${cat.id.toLowerCase()}`}
                onClick={() => handleCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 ${
                  activeCategory === cat.id
                    ? 'bg-argentina-navy text-white shadow-lg shadow-argentina-navy/10'
                    : 'bg-white border border-argentina-navy/5 text-argentina-navy-muted hover:text-argentina-navy hover:border-argentina-blue/50 hover:bg-argentina-blue/5'
                }`}
              >
                {cat.id === 'All' && dict?.any ? dict.any : cat.id}
              </button>
            ))}
            <div className="w-px h-6 bg-argentina-navy/10 mx-1" />
            <button
              id="filters-btn"
              onClick={() => setFiltersOpen(true)}
              className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full bg-white border border-argentina-navy/5 text-argentina-navy font-medium text-sm hover:bg-argentina-blue/5 transition-colors shadow-sm"
            >
              <span className="material-icons text-base font-material-icons">tune</span>
              {dict?.filters || 'Filters'}
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
