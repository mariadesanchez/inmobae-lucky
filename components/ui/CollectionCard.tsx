'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/data/mockData';


interface CollectionCardProps {
  collection: Collection;
  dict?: any;
}

const CollectionCard = ({ collection, dict }: CollectionCardProps) => {
  const isNewThisMonth = () => {
    if (!collection.date_entry) return false;
    const entryDate = new Date(collection.date_entry);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  };

  const isNew = isNewThisMonth();

  return (
    <Link href={`/propiedades/${collection.slug || ''}`} className="block group relative rounded-xl overflow-hidden shadow-soft bg-white cursor-pointer">
      {/* Image Container */}
      <div className="aspect-4/3 w-full overflow-hidden relative">
        <Image
          src={collection.image}
          alt={collection.title}
          fill
          sizes="(max-w-7xl) 50vw, 600px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* New Badge */}
        {isNew && (
          <div className="absolute top-4 left-4 h-10 bg-gradient-to-r from-argentina-sun to-yellow-400 text-argentina-navy text-xs font-bold px-5 rounded-full shadow-[0_4px_12px_rgba(246,180,14,0.4)] z-10 uppercase tracking-widest flex items-center justify-center border border-yellow-300">
            {dict?.property?.new || 'Nueva'}
          </div>
        )}

        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-argentina-navy hover:bg-argentina-blue hover:text-white transition-all z-10"
        >
          <span className="material-icons text-xl font-material-icons">
            favorite_border
          </span>
        </button>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t from-black/60 to-transparent opacity-60"></div>
      </div>

      {/* Content */}
      <div className="p-6 relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium text-argentina-navy group-hover:text-argentina-blue transition-colors">
              {collection.title}
            </h3>
            <p className="text-argentina-navy-muted text-sm flex items-center gap-1 mt-1">
              <span className="material-icons text-sm font-material-icons">
                place
              </span>{' '}
              {collection.location}
            </p>
          </div>
          <span className="text-xl font-semibold text-argentina-blue">
            ${collection.price.toLocaleString('en-US')}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-argentina-navy/5">
          <div className="flex items-center gap-2 text-argentina-navy-muted text-sm">
            <span className="material-icons text-lg font-material-icons">
              king_bed
            </span>{' '}
            {collection.beds} {dict?.property?.beds || 'Beds'}
          </div>
          <div className="flex items-center gap-2 text-argentina-navy-muted text-sm">
            <span className="material-icons text-lg font-material-icons">
              bathtub
            </span>{' '}
            {collection.baths} {dict?.property?.baths || 'Baths'}
          </div>
          <div className="flex items-center gap-2 text-argentina-navy-muted text-sm">
            <span className="material-icons text-lg font-material-icons">
              square_foot
            </span>{' '}
            {collection.sqft.toLocaleString('en-US')} m²
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;

