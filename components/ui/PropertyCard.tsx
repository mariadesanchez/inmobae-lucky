'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import FavoriteButton from './FavoriteButton';


interface PropertyCardProps {
  property: Property;
  dict?: any;
}

const PropertyCard = ({ property, dict }: PropertyCardProps) => {
  const isNewThisMonth = () => {
    if (!property.date_entry) return false;
    const entryDate = new Date(property.date_entry);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  };

  const isNew = isNewThisMonth();

  return (
    <Link href={`/propiedades/${property.slug}`} className="block h-full group">
      <article className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-4/3 overflow-hidden">
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(max-w-7xl) 25vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Favorite Button */}
          <FavoriteButton propertyId={property.id} initialIsFavorite={property.isFavorite} />

          {/* New Badge */}
          {isNew && (
            <div className="absolute top-3 left-3 h-[34px] bg-gradient-to-r from-argentina-sun to-yellow-400 text-argentina-navy text-xs font-bold px-4 rounded-full shadow-[0_4px_12px_rgba(246,180,14,0.4)] z-10 uppercase tracking-widest flex items-center justify-center border border-yellow-300">
              {dict?.property?.new || 'Nueva'}
            </div>
          )}

          {/* Type Tag */}
          <div 
            className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${property.status === 'comprar' ? 'bg-argentina-navy/90' : 'bg-argentina-blue/90'}`}
          >
            {property.status === 'comprar' ? 'EN VENTA' : 'ALQUILER'}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col grow">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-2xl font-bold text-argentina-navy font-sf-pro">
              ${property.price.toLocaleString()}
              {property.status === 'alquilar' && (
                <span className="text-sm font-normal text-gray-500 font-sf-pro"> /mes</span>
              )}
            </p>
          </div>

          <h4 className="text-argentina-navy font-medium truncate mb-1">
            {property.title}
          </h4>
          <p className="text-argentina-navy-muted text-xs mb-4">{property.location}</p>

          {/* Footer Features */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-argentina-navy-muted text-xs">
              <span className="material-icons text-sm text-argentina-blue/80 font-material-icons">
                king_bed
              </span>{' '}
              {property.beds}
            </div>
            <div className="flex items-center gap-1 text-argentina-navy-muted text-xs">
              <span className="material-icons text-sm text-argentina-blue/80 font-material-icons">
                bathtub
              </span>{' '}
              {property.baths}
            </div>
            <div className="flex items-center gap-1 text-argentina-navy-muted text-xs">
              <span className="material-icons text-sm text-argentina-blue/80 font-material-icons">
                square_foot
              </span>{' '}
              {property.sqft}m²
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PropertyCard;

