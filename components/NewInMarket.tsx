import PropertyCard from './ui/PropertyCard';
import Pagination from './Pagination';
import { Property } from '@/types/property';

interface NewInMarketProps {
  properties: Property[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  hasActiveFilters?: boolean;
  dict?: any;
}

const NewInMarket = ({
  properties,
  totalCount,
  currentPage,
  pageSize,
  hasActiveFilters,
  dict,
}: NewInMarketProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-icons font-material-icons text-6xl text-argentina-navy/20 mb-4">
            search_off
          </span>
          <h3 className="text-xl font-medium text-argentina-navy mb-2">{dict?.noResults || 'No properties found'}</h3>
          <p className="text-argentina-navy-muted text-sm max-w-xs">
            {dict?.tryAdjusting || 'Try adjusting your filters or search in a different location.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} dict={dict} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/"
        />
      )}
    </section>
  );
};

export default NewInMarket;
