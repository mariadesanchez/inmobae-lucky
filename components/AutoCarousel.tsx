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
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return;
    const cardWidth = scrollRef.current.firstElementChild.clientWidth + 24; // 24px gap
    const index = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setActiveIndex(index);
  };

  useEffect(() => {
    if (isHovered) return; // Pause on hover

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // If we reached the end, scroll back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by roughly one card width (350px + 24px gap)
          scrollRef.current.scrollBy({ left: 374, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  if (!collections || collections.length === 0) return null;

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
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
