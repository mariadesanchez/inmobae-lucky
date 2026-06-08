import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import TogglePropertyButton from '@/components/admin/TogglePropertyButton';
import EditPropertyButton from '@/components/admin/EditPropertyButton';

export default async function AdminPropertiesPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  
  
  const page = parseInt(resolvedSearchParams.page as string || '1', 10);
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  
  // Fetch paginated properties — admin sees ALL (active and inactive)
  const { data: properties, error, count } = await supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false })
    .range(from, to);

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  if (error) {
    console.error('Error fetching properties:', error);
  }

  return (
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-argentina-navy dark:text-white tracking-tight">Mis Propiedades</h1>
        </div>
        <div className="flex items-center gap-3">
            <Link 
              href={`/admin/properties/create`}
              className="bg-argentina-blue hover:bg-argentina-blue/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-argentina-blue/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <span className="material-icons text-base">add</span> Agregar Propiedad
            </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-argentina-blue/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-argentina-navy-muted dark:text-gray-400">Total de Propiedades</p>
            <p className="text-2xl font-bold text-argentina-navy dark:text-white mt-1">{totalItems}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-argentina-blue/10 flex items-center justify-center text-argentina-blue">
            <span className="material-icons">apartment</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-argentina-blue/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-argentina-navy-muted dark:text-gray-400">Activas</p>
            <p className="text-2xl font-bold text-argentina-navy dark:text-white mt-1">{properties?.filter(p => p.is_active !== false).length || 0}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-argentina-sun flex items-center justify-center text-argentina-blue">
            <span className="material-icons">check_circle</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-argentina-blue/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-argentina-navy-muted dark:text-gray-400">Desactivadas</p>
            <p className="text-2xl font-bold text-argentina-navy dark:text-white mt-1">{properties?.filter(p => p.is_active === false).length || 0}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
            <span className="material-icons">visibility_off</span>
          </div>
        </div>
      </div>

      {/* Property List Container */}
      <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-argentina-navy/10 dark:border-argentina-blue/20 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-argentina-light/50 dark:bg-argentina-blue/5 border-b border-argentina-navy/5 dark:border-argentina-blue/10 text-xs font-semibold text-argentina-navy-muted dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-6">Detalles de Propiedad</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* List Items */}
        {properties?.map((prop) => (
          <div key={prop.id} className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-argentina-navy/5 dark:border-argentina-blue/10 hover:bg-argentina-light dark:hover:bg-argentina-blue/5 transition-colors items-center ${
            prop.is_active === false ? 'opacity-60' : ''
          }`}>
            {/* Property Details */}
            <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
              <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                {prop.images?.[0] ? (
                  <Image 
                    src={prop.images[0]} 
                    alt={prop.title_en || 'Property'} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-icons text-gray-400">image</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-argentina-navy dark:text-white group-hover:text-argentina-blue transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-sm">
                  {prop.title_en}
                </h3>
                <p className="text-sm text-argentina-navy-muted dark:text-gray-400">{prop.location}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-argentina-navy-muted dark:text-gray-500">
                  <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bed</span> {prop.beds} Dormitorios</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bathtub</span> {prop.baths} Baños</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{prop.area} m²</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-6 md:col-span-2">
              <div className="text-base font-semibold text-argentina-navy dark:text-gray-200">${prop.price?.toLocaleString()}</div>
              <div className="text-xs text-argentina-navy-muted dark:text-gray-400">Tipo: {prop.type}</div>
            </div>

            {/* Status */}
            <div className="col-span-6 md:col-span-2 flex flex-col gap-1.5">
              {prop.is_active === false ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600 border border-orange-200 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
                  Inactiva
                </span>
              ) : prop.status === 'sale' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-argentina-sun text-argentina-blue border border-argentina-blue/10 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-argentina-blue mr-1.5"></span>
                  En Venta
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                  En Alquiler
                </span>
              )}
            </div>

                  {/* Actions */}
                  <div className="col-span-12 md:col-span-2 flex justify-end gap-2">
                    <EditPropertyButton id={prop.id} isActive={prop.is_active !== false} />
                    <TogglePropertyButton id={prop.id} isActive={prop.is_active !== false} />
                  </div>
          </div>
        ))}
        
        {(!properties || properties.length === 0) && (
          <div className="px-6 py-12 text-center text-argentina-navy-muted">
            No se encontraron propiedades.
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-argentina-navy/5 dark:border-argentina-blue/20 flex items-center justify-between bg-argentina-light/50 dark:bg-argentina-blue/5">
          <div className="text-sm text-argentina-navy-muted dark:text-gray-400">
            Mostrando <span className="font-medium text-argentina-navy dark:text-white">{Math.min(from + 1, totalItems)}</span> a <span className="font-medium text-argentina-navy dark:text-white">{Math.min(to + 1, totalItems)}</span> de <span className="font-medium text-argentina-navy dark:text-white">{totalItems}</span> resultados
          </div>
          <div className="flex gap-2">
            <Link 
              href={`/admin/properties?page=${page - 1}`}
              className={`px-3 py-1 text-sm border border-argentina-navy/10 dark:border-argentina-blue/30 rounded-md text-argentina-navy-muted dark:text-gray-300 hover:bg-white dark:hover:bg-argentina-blue/20 transition-colors ${isFirstPage ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={isFirstPage}
            >
              Anterior
            </Link>
            <Link 
              href={`/admin/properties?page=${page + 1}`}
              className={`px-3 py-1 text-sm border border-argentina-navy/10 dark:border-argentina-blue/30 rounded-md text-argentina-navy-muted dark:text-gray-300 hover:bg-white dark:hover:bg-argentina-blue/20 transition-colors ${isLastPage ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={isLastPage}
            >
              Siguiente
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
