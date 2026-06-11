import Navbar from '@/components/Navbar';
import FeaturedCollection from '@/components/FeaturedCollection';
import NewInMarket from '@/components/NewInMarket';
import { createClient } from '@/lib/supabase/server';
import { mapDbRowToProperty } from '@/lib/property-mapper';

import { getDictionary } from '@/lib/dictionaries';

const PAGE_SIZE = 8;

interface HomePageProps {
  params: Promise<{  }>;
  searchParams: Promise<{
    page?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    type?: string;
    status?: string;
    beds?: string;
    baths?: string;
    parking?: string;
    minArea?: string;
    maxArea?: string;
    age?: string;
    disposition?: string;
    featuredStatus?: string;
    datePublished?: string;
    amenities?: string;
  }>;
}

export default async function BuscarPage({ params, searchParams }: HomePageProps) {
  
  const dict = await getDictionary();
  const { page, location, minPrice, maxPrice, type, status, beds, baths, parking, minArea, maxArea, age, disposition, featuredStatus, datePublished, amenities } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? '1', 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let favoriteIds = new Set<string>();
  if (user) {
    const { data: favs } = await supabase
      .from('user_favorites')
      .select('property_id')
      .eq('user_id', user.id);
    if (favs) {
      favs.forEach(f => favoriteIds.add(String(f.property_id)));
    }
  }

  // Build query with filters — only show active properties publicly
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .contains('features', ['Agua Corriente', 'Luz']) // Servicios esenciales obligatorios
    .order('id', { ascending: false });

  // Search filter — case-insensitive partial match across title and location in all languages
  if (location && location.trim()) {
    const term = location.trim();
    query = query.or(
      [
        `title.ilike.%${term}%`,
        `location.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ].join(',')
    );
  }

  // Price range
  if (minPrice) query = query.gte('price', Number(minPrice));
  if (maxPrice) query = query.lte('price', Number(maxPrice));

  // Property type
  if (type && type !== 'Todos' && type !== 'Any Type') {
    query = query.ilike('type', type);
  }

  // Status (comprar / alquilar)
  if (status) {
    query = query.eq('status', status);
  }

  // Beds & Baths & Parking — exact match
  if (beds && Number(beds) > 0) query = query.eq('beds', Number(beds));
  if (baths && Number(baths) > 0) query = query.eq('baths', Number(baths));
  if (parking && Number(parking) > 0) query = query.eq('parking', Number(parking));

  // Area
  if (minArea && Number(minArea) > 0) query = query.gte('area', Number(minArea));
  if (maxArea && Number(maxArea) < 10000) query = query.lte('area', Number(maxArea));

  // Exact Matches / Custom Age logic
  if (age && age !== 'Cualquiera') {
    if (age === 'En construcción') query = query.eq('age', 'En construcción');
    else if (age === 'A estrenar') query = query.in('age', ['En construcción', 'A estrenar']);
    else if (age === 'Hasta 5 años') query = query.in('age', ['En construcción', 'A estrenar', 'Hasta 5 años']);
    else if (age === 'Hasta 10 años') query = query.in('age', ['En construcción', 'A estrenar', 'Hasta 5 años', 'Hasta 10 años']);
    else if (age === 'Hasta 20 años') query = query.in('age', ['En construcción', 'A estrenar', 'Hasta 5 años', 'Hasta 10 años', 'Hasta 20 años']);
    // 'Más de 30 años' would include anything, so no filter needed
  }
  if (disposition && disposition !== 'Cualquiera') query = query.eq('disposition', disposition);

  // Featured Status
  if (featuredStatus === 'Destacadas') query = query.eq('is_featured', true);
  if (featuredStatus === 'Comunes') query = query.eq('is_featured', false);

  // Date Published
  if (datePublished && datePublished !== 'Cualquiera') {
    const date = new Date();
    if (datePublished === 'Hoy') date.setDate(date.getDate() - 1);
    if (datePublished === 'Última semana') date.setDate(date.getDate() - 7);
    if (datePublished === 'Últimos 15 días') date.setDate(date.getDate() - 15);
    if (datePublished === 'Últimos 30 días') date.setDate(date.getDate() - 30);
    if (datePublished === 'Últimos 45 días') date.setDate(date.getDate() - 45);
    query = query.gte('created_at', date.toISOString());
  }

  // Amenities: We do NOT filter the Supabase query strictly anymore.
  // Instead, we pass it down to display missing amenities in the card.
  const amenitiesArray = amenities ? amenities.split(',').filter(Boolean) : [];

  const { data: propertiesData, count } = await query.range(from, to);

  const mappedProperties = (propertiesData ?? []).map(row => {
    const prop = mapDbRowToProperty(row);
    prop.isFavorite = favoriteIds.has(String(prop.id));
    return prop;
  });

  // Check if any filter is active (for UI feedback)
  const hasActiveFilters = !!(location || minPrice || maxPrice || (type && type !== 'Todos' && type !== 'Any Type') || beds || baths || parking || minArea || (maxArea && Number(maxArea) < 10000) || (age && age !== 'Cualquiera') || (disposition && disposition !== 'Cualquiera') || (featuredStatus && featuredStatus !== 'Todas') || (datePublished && datePublished !== 'Cualquiera') || amenities);

  return (
    <>
      <Navbar dict={dict.navbar} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div id="propiedades" className="pt-24 pb-8">
          {!hasActiveFilters && <FeaturedCollection dict={{ ...dict.featured, property: dict.property }} />}
          <NewInMarket
            properties={mappedProperties}
            totalCount={count ?? 0}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            hasActiveFilters={hasActiveFilters}
            dict={{ ...dict.newInMarket, property: dict.property }}
            requestedAmenities={amenitiesArray}
          />
        </div>
      </main>
    </>
  );
}
