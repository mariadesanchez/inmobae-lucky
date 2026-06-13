'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  isNew?: boolean;
  category?: string;
}

const PropertyGallery = ({ images, title, isNew, category }: PropertyGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex] || '';

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Autoplay effect: transition image every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, images.length]);

  // Tag helper
  const isPremium = category?.toLowerCase() === 'featured' || category?.toLowerCase() === 'exclusive';

  return (
    <div className="space-y-4">
      {/* Main Image Banner */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-slate-100">
        {activeImage ? (
          <>
            <Image
              src={activeImage}
              alt={title}
              fill
              sizes="(max-w-7xl) 100vw, 768px"
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-101"
            />
            {/* Sliding navigation buttons */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
                  aria-label="Previous image"
                >
                  <span className="material-icons font-material-icons">chevron_left</span>
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
                  aria-label="Next image"
                >
                  <span className="material-icons font-material-icons">chevron_right</span>
                </button>
              </>
            )}
            
            {/* Camera count badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#84cc16] text-white px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md z-10 font-semibold text-xs">
              <span className="material-icons text-base font-material-icons">photo_camera</span>
              <span>{activeIndex + 1} / {images.length}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-argentina-navy/40 bg-slate-100">
            No image available
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {isPremium && (
            <span className="bg-argentina-blue text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              Premium
            </span>
          )}
          {isNew && (
            <span className="bg-white/90 backdrop-blur text-argentina-navy text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              New
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails Carousel */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
        {images.map((imgUrl, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all snap-start relative bg-slate-100 border ${
              activeIndex === idx
                ? 'ring-2 ring-argentina-blue ring-offset-2 ring-offset-argentina-light opacity-100 border-transparent'
                : 'opacity-70 hover:opacity-100 border-argentina-blue/10'
            }`}
          >
            <Image
              src={imgUrl}
              alt={`${title} view ${idx + 1}`}
              fill
              sizes="192px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PropertyGallery;
