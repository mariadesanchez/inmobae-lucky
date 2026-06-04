'use client';

import { useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import FiltersModal from './FiltersModal';

const CATEGORY_FILTERS = ['All', 'House', 'Apartment', 'Villa', 'Penthouse'];

const HeroInner = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic leading-tight">
          Find your{' '}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">sanctuary</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
          </span>
          .
        </h1>

        {/* Search Bar */}
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors font-material-icons">
              search
            </span>
          </div>
          <input
            type="text"
            id="hero-search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white text-nordic shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-lg outline-none"
            placeholder="Search by city, neighborhood, or address..."
          />
          <button
            id="hero-search-btn"
            onClick={handleSearch}
            className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20"
          >
            Search
          </button>
        </div>

        {/* Category pills + Filters button */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              id={`category-${cat.toLowerCase()}`}
              onClick={() => handleCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 ${
                activeCategory === cat
                  ? 'bg-nordic text-white shadow-lg shadow-nordic/10'
                  : 'bg-white border border-nordic/5 text-nordic-muted hover:text-nordic hover:border-mosque/50 hover:bg-mosque/5'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="w-px h-6 bg-nordic/10 mx-2" />

          <button
            id="filters-btn"
            onClick={() => setFiltersOpen(true)}
            className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic font-medium text-sm hover:bg-black/5 transition-colors"
          >
            <span className="material-icons text-base font-material-icons">tune</span>{' '}
            Filters
          </button>
        </div>
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setFiltersOpen(false)}
      />
    </section>
  );
};

const Hero = () => (
  <Suspense>
    <HeroInner />
  </Suspense>
);

export default Hero;
