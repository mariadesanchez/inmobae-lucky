'use client';

import { useState, useEffect } from 'react';
import { getClosedProperties } from '@/app/actions/transactions';
import { Property } from '@/types/property';
import PropertyCard from '@/components/ui/PropertyCard';

export default function ClosedPropertiesModal({ onClose }: { onClose: () => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const data = await getClosedProperties();
        setProperties(data as Property[]);
      } catch (error) {
        console.error("Failed to fetch closed properties", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-argentina-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#152e2a] w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex-shrink-0 flex items-center justify-between bg-gray-50/50 dark:bg-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-argentina-sun/20 flex items-center justify-center text-argentina-navy dark:text-argentina-sun">
              <span className="material-icons text-xl">real_estate_agent</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-argentina-navy dark:text-white">Propiedades Cerradas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Historial de alquileres y ventas registradas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#152e2a]/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <div className="w-8 h-8 border-4 border-argentina-blue/20 border-t-argentina-blue rounded-full animate-spin"></div>
              <p className="font-medium text-sm">Cargando propiedades...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <span className="material-icons text-4xl opacity-50">search_off</span>
              <p className="font-medium">No se encontraron propiedades cerradas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, idx) => (
                <div key={property.id || idx} className="h-full">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
