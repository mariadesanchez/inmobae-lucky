export type PropertyType = 'comprar' | 'alquilar';

export interface Property {
  id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  status: PropertyType;
  is_new: boolean;
  created_at: string;
  date_entry?: string;
  is_featured?: boolean;
  isFavorite?: boolean;
  slug: string;
  images: string[];
}

