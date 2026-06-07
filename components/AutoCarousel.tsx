'use client';

import { useState, useEffect, useRef } from 'react';
import { Collection } from '@/data/mockData';
import CollectionCard from './ui/CollectionCard';

interface AutoCarouselProps {
  collections: Collection[];
  dict?: any;
}

export default function AutoCarousel({ collections, dict }: AutoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return;
    const cardWidth = scrollRef.current.firstElementChild.clientWidth + 24; // 24px gap
    const index = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setActiveIndex(index);
  };

  const scrollPrev = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return;
    const cardWidth = scrollRef.current.firstElementChild.clientWidth + 24;
    scrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return;
    const cardWidth = scrollRef.current.firstElementChild.clientWidth + 24;
    scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };

  if (!collections || collections.length === 0) return null;

  return (
    <div className="relative w-full group">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scroll" 
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {collections.map((collection) => (
          <div key={collection.id} className="w-[85vw] sm:w-[350px] shrink-0 snap-center sm:snap-start">
            <CollectionCard collection={collection} dict={dict} />
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows (Visible on Desktop Hover) */}
      <button 
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-argentina-navy hover:bg-argentina-light opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 z-10"
        aria-label="Previous property"
      >
        <span className="material-icons font-material-icons">chevron_left</span>
      </button>
      
      <button 
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-argentina-navy hover:bg-argentina-light opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 z-10"
        aria-label="Next property"
      >
        <span className="material-icons font-material-icons">chevron_right</span>
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-2 pb-4">
        {collections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (scrollRef.current && scrollRef.current.firstElementChild) {
                const cardWidth = scrollRef.current.firstElementChild.clientWidth + 24;
                scrollRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
              }
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === idx ? 'w-6 bg-argentina-navy' : 'w-2 bg-argentina-navy/20 hover:bg-argentina-navy/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
