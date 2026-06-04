import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedCollection from '@/components/FeaturedCollection';
import NewInMarket from '@/components/NewInMarket';
import { createClient } from '@/lib/supabase/server';
import { mapDbRowToProperty } from '@/lib/property-mapper';

const PAGE_SIZE = 8;

interface HomePageProps {
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

export default async function Home({ searchParams }: HomePageProps) {
  const { page, location, minPrice, maxPrice, type, beds, baths } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? '1', 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Build query with filters
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false });

  // Location filter — search in title or location columns
  if (location && location.trim()) {
    query = query.or(`location.ilike.%${location.trim()}%,title.ilike.%${location.trim()}%`);
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

  const mappedProperties = (propertiesData ?? []).map(mapDbRowToProperty);

  // Check if any filter is active (for UI feedback)
  const hasActiveFilters = !!(location || minPrice || maxPrice || (type && type !== 'Any Type') || beds || baths);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero />
        <FeaturedCollection />
        <NewInMarket
          properties={mappedProperties}
          totalCount={count ?? 0}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          hasActiveFilters={hasActiveFilters}
        />
      </main>
    </>
  );
}
