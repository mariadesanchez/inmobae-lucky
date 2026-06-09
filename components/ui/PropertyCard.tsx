'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import FavoriteButton from './FavoriteButton';


interface PropertyCardProps {
  property: Property;
  dict?: any;
  requestedAmenities?: string[];
}

const PropertyCard = ({ property, dict, requestedAmenities }: PropertyCardProps) => {
  const isNewThisMonth = () => {
    if (!property.date_entry) return false;
    const entryDate = new Date(property.date_entry);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  };

  const isNew = isNewThisMonth();

  // Find missing amenities based on requested
  const missingAmenities = requestedAmenities
    ? requestedAmenities.filter((amenity) => !property.features?.includes(amenity))
    : [];

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
              ${property.price.toLocaleString('es-AR')}
              {property.status === 'alquilar' && (
                <span className="text-sm font-normal text-gray-500 font-sf-pro"> /mes</span>
              )}
            </p>
          </div>

          <h4 className="text-argentina-navy font-medium truncate mb-1">
            {property.title}
          </h4>
          <p className="text-argentina-navy-muted text-xs mb-4">{property.location}</p>

        </div>

        {/* Property Features */}
        <div className="p-4 pt-0">
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
            <div className="flex items-center gap-1.5">
              <span className="material-icons text-[18px]">bed</span>
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-icons text-[18px]">bathtub</span>
              <span>{property.baths}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-icons text-[18px]">square_foot</span>
              <span>{property.sqft} m²</span>
            </div>
          </div>
          
          {missingAmenities.length > 0 && (
            <div className="mt-2 text-xs font-medium text-red-500 bg-red-50 rounded-md px-2 py-1.5 flex items-start gap-1">
              <span className="material-icons text-[14px]">warning</span>
              <span>No incluye: {missingAmenities.join(', ')}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default PropertyCard;

