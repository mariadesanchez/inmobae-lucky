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
    beds?: string;
    baths?: string;
  }>;
}

export default async function BuscarPage({ params, searchParams }: HomePageProps) {
  
  const dict = await getDictionary();
  const { page, location, minPrice, maxPrice, type, beds, baths } = await searchParams;
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

  // Property type → maps to "category" column in DB (or status for buy/rent)
  if (type && type !== 'Any Type') {
    query = query.ilike('category', type);
  }

  // Beds & Baths — minimum count
  if (beds && Number(beds) > 0) query = query.gte('beds', Number(beds));
  if (baths && Number(baths) > 0) query = query.gte('baths', Number(baths));

  const { data: propertiesData, count } = await query.range(from, to);

  const mappedProperties = (propertiesData ?? []).map(row => {
    const prop = mapDbRowToProperty(row);
    prop.isFavorite = favoriteIds.has(String(prop.id));
    return prop;
  });

  // Check if any filter is active (for UI feedback)
  const hasActiveFilters = !!(location || minPrice || maxPrice || (type && type !== 'Any Type') || beds || baths);

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
        />
        </div>
      </main>
    </>
  );
}
