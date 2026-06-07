import Link from 'next/link';
import { Collection } from '@/data/mockData';
import CollectionCard from './ui/CollectionCard';
import AutoCarousel from './AutoCarousel';
import { createClient } from '@/lib/supabase/server';
import { mapDbRowToProperty } from '@/lib/property-mapper';

import { Locale } from '@/i18n-config';

const FeaturedCollection = async ({ dict, locale = 'en' }: { dict?: any; locale?: string }) => {
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
      date_entry: prop.date_entry,
      isFavorite: favoriteIds.has(String(prop.id)),
    };
  });



  return (
    <section className="mb-8">
      <AutoCarousel collections={collections} dict={dict} />
    </section>
  );
};

export default FeaturedCollection;

