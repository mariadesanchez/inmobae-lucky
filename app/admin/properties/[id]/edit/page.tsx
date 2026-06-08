import PropertyForm from '@/components/admin/PropertyForm';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditPropertyPage({
  params
}: {
  params: Promise<{  id: string }>;
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
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-argentina-navy tracking-tight mb-2">Editar Propiedades</h1>
          </div>
        </div>
      </header>
      
      <PropertyForm initialData={property} />
    </main>
  );
}
