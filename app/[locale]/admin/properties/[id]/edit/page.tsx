import PropertyForm from '@/components/admin/PropertyForm';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditPropertyPage({
  params
}: {
  params: Promise<{ locale: string, id: string }>;
}) {
  const resolvedParams = await params;
  const propertyId = parseInt(resolvedParams.id);
  
  if (isNaN(propertyId)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (error || !property) {
    notFound();
  }
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium font-sf-pro">
              <li><a href={`/${resolvedParams.locale}/admin/properties`} className="hover:text-argentina-blue transition-colors">Properties</a></li>
              <li><span className="material-icons text-xs text-gray-400">chevron_right</span></li>
              <li aria-current="page" className="text-argentina-navy">Edit Property</li>
            </ol>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-argentina-navy tracking-tight mb-2">Edit Property</h1>
            <p className="text-base text-gray-500 max-w-2xl font-normal font-sf-pro">
              Update the details below. Fields marked with * are mandatory.
            </p>
          </div>
        </div>
      </header>
      
      <PropertyForm locale={resolvedParams.locale} initialData={property} />
    </main>
  );
}
