import PropertyForm from '@/components/admin/PropertyForm';

export default async function CreatePropertyPage({
  params
}: {
  params: Promise<{  }>;
}) {
  const resolvedParams = await params;
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-argentina-navy tracking-tight mb-2">Administrar propiedades</h1>
          </div>
        </div>
      </header>
      
      <PropertyForm />
    </main>
  );
}
