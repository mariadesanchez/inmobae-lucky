import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapDbRowToProperty } from '@/lib/property-mapper';
import { getDictionary } from '@/lib/dictionaries';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/ui/PropertyCard';

export default async function FavoritosPage({
  params
}: {
  params: Promise<{  }>
}) {
  
  const dict = await getDictionary();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect(`/login`);
  }

  // Fetch user favorites along with property details
  const { data: favoritesData } = await supabase
    .from('user_favorites')
    .select('*, properties(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Map database rows to our frontend Property format
  const favoriteProperties = (favoritesData || [])
    .filter(fav => fav.properties) // Ensure the property still exists
    .map(fav => {
      // @ts-ignore - The join returns properties as an object but TypeScript might complain
      const propDbRow = fav.properties;
      const mappedProp = mapDbRowToProperty(propDbRow);
      mappedProp.isFavorite = true; // By definition, these are favorites
      return mappedProp;
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar dict={dict.navbar} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold text-argentina-navy font-sf-pro flex items-center gap-3">
            <span className="material-icons text-argentina-blue">favorite</span>
            {dict.navbar?.saved || 'Favoritos'}
          </h1>
          <p className="mt-2 text-gray-500 font-sf-pro text-sm">
            Tus propiedades guardadas para ver más tarde.
          </p>
        </div>

        {favoriteProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-12">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons text-gray-300 text-4xl">favorite_border</span>
            </div>
            <h2 className="text-xl font-bold text-argentina-navy mb-3 font-sf-pro">
              Aún no tienes favoritos
            </h2>
            <p className="text-gray-500 mb-8 font-sf-pro">
              Explora nuestro catálogo y marca con un corazón las propiedades que más te gusten para guardarlas aquí.
            </p>
            <Link 
              href={``}
              className="inline-flex items-center gap-2 bg-argentina-blue hover:bg-argentina-blue/90 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md font-sf-pro"
            >
              Explorar Propiedades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                dict={{ property: dict.property }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
