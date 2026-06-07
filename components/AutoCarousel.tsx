'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/data/mockData';

interface AutoCarouselProps {
  collections: Collection[];
  dict?: any;
}

export default function AutoCarousel({ collections, dict }: AutoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === collections.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    timeoutRef.current = setInterval(nextSlide, 4000); // Auto slide every 4s
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [collections.length]);

  if (!collections || collections.length === 0) return null;

  return (
    <div className="relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden bg-black mb-16 h-[60vh] md:h-[70vh]">
      <div 
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {collections.map((collection) => (
          <div key={collection.id} className="w-screen h-full shrink-0 relative group">
            <Link href={`/propiedades/${collection.slug || ''}`} className="block w-full h-full relative cursor-pointer">
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                priority
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end">
                <div className="mb-4 md:mb-0">
                  <div className="bg-argentina-blue text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4">
                    {collection.tag}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    {collection.title}
                  </h3>
                  <p className="text-gray-200 text-lg flex items-center gap-2 drop-shadow-md">
                    <span className="material-icons text-xl font-material-icons">place</span>
                    {collection.location}
                  </p>
                  
                  {/* Features */}
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2 text-white font-medium drop-shadow-md">
                      <span className="material-icons">king_bed</span> {collection.beds}
                    </div>
                    <div className="flex items-center gap-2 text-white font-medium drop-shadow-md">
                      <span className="material-icons">bathtub</span> {collection.baths}
                    </div>
                    <div className="flex items-center gap-2 text-white font-medium drop-shadow-md">
                      <span className="material-icons">square_foot</span> {collection.sqft.toLocaleString('en-US')} m²
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-xl">
                    ${collection.price.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {collections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              if (timeoutRef.current) clearInterval(timeoutRef.current);
              timeoutRef.current = setInterval(nextSlide, 4000);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
