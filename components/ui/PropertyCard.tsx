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

  // Servicios esenciales (siempre se muestran)
  const features = property.features ?? [];
  const hasAgua = features.includes('Agua Corriente');
  const hasLuz  = features.includes('Luz');
  const hasGas  = features.includes('Gas natural');
  // missingEssentials ya no se usa (las propiedades sin agua/luz se descartan en DB)

  const formattedPrice = property.status === 'comprar' 
    ? `U$S ${property.price.toLocaleString('es-AR')}`
    : `$ ${property.price.toLocaleString('es-AR')}`;

  return (
    <Link href={`/propiedades/${property.slug}`} className="block h-full group">
      <article className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer h-full flex flex-col overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(max-w-7xl) 25vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Favorite Button */}
          <FavoriteButton propertyId={property.id} initialIsFavorite={property.isFavorite} />

          {/* Slide dots overlay representing image pagination */}
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10 bg-black/10 backdrop-blur-[1px] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full border border-white opacity-60"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="w-1.5 h-1.5 rounded-full border border-white opacity-60"></span>
          </div>

          {/* Sleek Type/Status Tag */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-[2px] text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm tracking-wider uppercase">
            {property.status === 'comprar' ? 'Venta' : 'Alquiler'}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col grow">
          <div className="mb-1">
            <p className="font-serif text-[26px] font-semibold text-gray-900 leading-tight">
              {formattedPrice}
              {property.status === 'alquilar' && (
                <span className="text-sm font-normal text-gray-500 font-sans"> /mes</span>
              )}
            </p>
          </div>

          <h4 className="text-gray-900 font-bold text-lg leading-snug mt-1 group-hover:text-argentina-blue transition-colors truncate">
            {property.title}
          </h4>
          
          <p className="text-gray-400 text-sm mt-1 font-normal truncate">
            {property.location}
          </p>

          {/* Divider line */}
          <hr className="border-gray-100 my-4" />

          {/* Features container */}
          <div className="flex items-center gap-3.5 text-gray-900 text-sm mt-auto">
            <div className="font-bold text-sm tracking-tight text-gray-900">
              {property.sqft} M2
            </div>

            <div className="h-4 w-[1px] bg-gray-200"></div>

            <div className="flex items-center gap-1.5">
              <span className="material-icons text-argentina-blue text-[20px]">bed</span>
              <span className="font-semibold text-gray-900">{property.beds}</span>
            </div>

            <div className="h-4 w-[1px] bg-gray-200"></div>

            <div className="flex items-center gap-1.5">
              <span className="material-icons text-argentina-blue text-[20px]">bathtub</span>
              <span className="font-semibold text-gray-900">{property.baths}</span>
            </div>

            {(property.parking !== undefined && property.parking > 0) && (
              <>
                <div className="h-4 w-[1px] bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <span className="material-icons text-argentina-blue text-[20px]">directions_car</span>
                  <span className="font-semibold text-gray-900">{property.parking}</span>
                </div>
              </>
            )}
          </div>

          {/* Missing amenities feedback */}
          {missingAmenities.length > 0 && (
            <div className="mt-3 text-xs font-medium text-red-500 bg-red-50/50 rounded-md px-2 py-1.5 flex items-start gap-1">
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

