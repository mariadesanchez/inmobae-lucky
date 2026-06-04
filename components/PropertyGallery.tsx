'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  isNew?: boolean;
  category?: string;
}

const PropertyGallery = ({ images, title, isNew, category }: PropertyGalleryProps) => {
  const [activeImage, setActiveImage] = useState(images[0] || '');

  // Tag helper
  const isPremium = category?.toLowerCase() === 'featured' || category?.toLowerCase() === 'exclusive';

  return (
    <div className="space-y-4">
      {/* Main Image Banner */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-slate-100">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            sizes="(max-w-7xl) 100vw, 768px"
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-nordic/40 bg-slate-100">
            No image available
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {isPremium && (
            <span className="bg-mosque text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              Premium
            </span>
          )}
          {isNew && (
            <span className="bg-white/90 backdrop-blur text-nordic text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
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
            onClick={() => setActiveImage(imgUrl)}
            className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all snap-start relative bg-slate-100 border ${
              activeImage === imgUrl
                ? 'ring-2 ring-mosque ring-offset-2 ring-offset-clear-day opacity-100 border-transparent'
                : 'opacity-70 hover:opacity-100 border-mosque/10'
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
