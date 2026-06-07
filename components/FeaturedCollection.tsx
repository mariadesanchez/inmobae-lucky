import Link from 'next/link';
import { Collection } from '@/data/mockData';
import CollectionCard from './ui/CollectionCard';
import AutoCarousel from './AutoCarousel';
import { createClient } from '@/lib/supabase/server';
import { mapDbRowToProperty } from '@/lib/property-mapper';

import { Locale } from '@/i18n-config';

const FeaturedCollection = async ({ dict, locale = 'en' }: { dict?: any; locale?: string }) => {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(15);

  const collections: Collection[] = (properties || []).map((p) => {
    const prop = mapDbRowToProperty(p, locale);
    return {
      id: prop.id,
      title: prop.title,
      location: prop.location,
      price: prop.price,
      image: prop.images[0] || prop.image,
      images: prop.images,
      beds: prop.beds,
      baths: prop.baths,
      sqft: prop.sqft,
      tag: p.category === 'new' ? 'New Arrival' : 'Exclusive',
      slug: prop.slug,
    };
  });



  return (
    <section className="mb-8">
      <div className="flex items-end justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-light text-argentina-navy">
            {dict?.title || 'Featured Collections'}
          </h2>
          <p className="text-argentina-navy-muted mt-1 text-sm">
            {dict?.subtitle || 'Curated properties for the discerning eye.'}
          </p>
        </div>
        <Link
          href="#"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-argentina-blue hover:opacity-70 transition-opacity"
        >
          {dict?.viewAll || 'View all'}{' '}
          <span className="material-icons text-sm font-material-icons">
            arrow_forward
          </span>
        </Link>
      </div>

      <AutoCarousel collections={collections} dict={dict} />
    </section>
  );
};

export default FeaturedCollection;

