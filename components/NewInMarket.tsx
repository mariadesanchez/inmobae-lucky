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
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic">
            {hasActiveFilters ? (dict?.searchResults || 'Search Results') : (dict?.newInMarket || 'New in Market')}
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            {hasActiveFilters
              ? (dict?.found ? dict.found.replace('{count}', totalCount.toString()) : `${totalCount} properties found`)
              : (dict?.fresh || 'Fresh opportunities added this week.')}
          </p>
        </div>
        <div className="hidden md:flex bg-white p-1 rounded-lg">
          <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic text-white shadow-sm">
            All
          </button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic">
            Buy
          </button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic">
            Rent
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-icons font-material-icons text-6xl text-nordic/20 mb-4">
            search_off
          </span>
          <h3 className="text-xl font-medium text-nordic mb-2">{dict?.noResults || 'No properties found'}</h3>
          <p className="text-nordic-muted text-sm max-w-xs">
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
