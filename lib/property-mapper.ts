import { Property } from '@/types/property';

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const parsePrice = (priceVal: any): number => {
  if (typeof priceVal === 'number') return priceVal;
  if (typeof priceVal === 'string') {
    const cleaned = priceVal.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const mapDbRowToProperty = (row: any): Property => {
  const id = String(row.id || '');
  const title = row.title || '';
  const generatedSlug = `${slugify(title)}-${id}`;
  const slug = row.slug || generatedSlug;

  let images: string[] = [];
  if (row.images) {
    if (Array.isArray(row.images)) {
      images = row.images.filter(Boolean);
    } else if (typeof row.images === 'string') {
      try {
        const parsed = JSON.parse(row.images);
        if (Array.isArray(parsed)) images = parsed.filter(Boolean);
      } catch {
        // Handle comma separated values if any
        images = row.images.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
  }

  // Fallback to row.image if images collection is empty
  if (images.length === 0 && row.image) {
    images.push(row.image);
  }

  // Specific fallback for Glass Pavilion (ID 1)
  if (id === '1' && images.length <= 1) {
    const mainImg = images[0] || row.image || '';
    images = [
      mainImg,
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvpJBMaiXUL25hHYwLa_0R6dPhLLM1EuhEt-AVtOy8qSnEi9IcA_RzD5s5ThawY3XG2qw8h4kPqvfP18EY1E5vgA8fs6v7RefCMJ1gY8Gt4uyXGJ85-lcIvL18v8Nlc-U-VOwn1h54yjjg4-KXHt1N5DfuTkQUBdldSELRZeJ6zuZ087NCJ7dDIDaXKJpPgulmd6JC6zD1-Kq00Sb4VXIhVR3IQ1Hd8S6xZkd17QvMHSNqbtKG849PRqHZX3nKLHEWYWWPvbL5_Gs",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbloTFAmeq6ugmfkwyqn3NMGn11PMk4FU0EIHRHvfYB8nw_-iH5TLps5ig3zipLPoKVZZKO8fOvEVJIwp3MQ9wrS4Dzhgw6ypUDhsycDc-YsboVBbRrXxKOYl-77zNHX9E4hynYyJfVVzXn7ldtURk3Ij3pHIMwqzfDdUxyhYaIJe5dRYa0JN5RpHbPNaV33TcM-IoYW11wNUCKkivtfgC3tk7hkKa3gue7ZTjLhR1ZOE_A1MvMZ3rgBxGDg-HFASH4YP6jI3rwMM",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRCEooMTK0GZV_7SdAorgeIN1pNz3R9YsLv-2pv39FOje7BUWCWPnKOSA1f6rlYcw7IoJ8NxUp4OU-MAk5_ucnykEtps56-kR6DtQ9JgLlCNyiuazO87fy-xCtXVNROT9kquBZ2JUvUtNGRwWiBaK1DnXOHSxp3ELHbLK8MNS-Ht3Gw8dXgNbya4bZiHZ7C-YnCJfwPjX25zrrQypfbiJsS8jjxFq3--uC264Zbhxp8XCsqDid3BIaJ8RdNMRze6lVvpg49N7Z0tI",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBk_c2n3UBtDQJ-NNLPp9wHCUtPuJTKQi4jnndp2ZNKTRfxtmV85MELPvVecn7Ef74j23fC3l08ZwEbHr70k5C1eHlVG8Pj-K0GWve-DoShWQNa5VGFhBad_Vtlxlu_u22wpBT3475EVHpmhcfwY2FekfCxqUrc_fGSBlHLcKIZ8XsNyHpAPUqUD2n10H86tm9E1nexgYeFUXpLsgB-FRTtya2tTZZ8kTJ-i0Mv6kWLi-LJgvYuYsN2lB0jZi0Q7xxJe6O1M-vA9eg"
    ];
  }

  // Ensure every property has at least 3 additional images (total of 4)
  const fallbackPool = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c15293036e3?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
  ];
  let fallbackIndex = 0;
  while (images.length < 4) {
    const nextImg = fallbackPool[fallbackIndex % fallbackPool.length];
    if (!images.includes(nextImg)) {
      images.push(nextImg);
    }
    fallbackIndex++;
  }

  return {
    id,
    title,
    location: row.location || '',
    price: parsePrice(row.price),
    image: images[0] || row.image || '',
    beds: typeof row.beds === 'number' ? row.beds : parseFloat(row.beds) || 0,
    baths: typeof row.baths === 'number' ? row.baths : parseFloat(row.baths) || 0,
    sqft: typeof row.area === 'number' ? row.area : parseFloat(row.area) || 0,
    type: row.status === 'rent' ? 'rent' : 'sale',
    is_new: row.category === 'new',
    created_at: '',
    is_featured: !!row.is_featured,
    slug,
    images
  };
};

