'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicHeader } from '../components/layout/PublicHeader';
import { SearchControls } from '../components/search/SearchControls';
import { PropertyCard } from '../components/search/PropertyCard';
import { PropertyGridSkeleton } from '../components/search/PropertyCardSkeleton';
import { SearchResultsMap } from '../components/maps/SearchResultsMap';
import { searchProperties } from '../lib/properties/api';
import { PublicPropertyListItem, SearchFilters } from '../lib/properties/types';

function parseFiltersFromParams(
  params: URLSearchParams,
): SearchFilters {
  const amenities = params.get('amenities');
  return {
    city: params.get('city') ?? undefined,
    checkIn: params.get('checkIn') ?? undefined,
    checkOut: params.get('checkOut') ?? undefined,
    guests: params.get('guests') ? Number(params.get('guests')) : undefined,
    bedrooms: params.get('bedrooms') ? Number(params.get('bedrooms')) : undefined,
    bathrooms: params.get('bathrooms') ? Number(params.get('bathrooms')) : undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    amenities: amenities ? amenities.split(',') : undefined,
  };
}

function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.city) params.set('city', filters.city);
  if (filters.checkIn) params.set('checkIn', filters.checkIn);
  if (filters.checkOut) params.set('checkOut', filters.checkOut);
  if (filters.guests) params.set('guests', String(filters.guests));
  if (filters.bedrooms) params.set('bedrooms', String(filters.bedrooms));
  if (filters.bathrooms) params.set('bathrooms', String(filters.bathrooms));
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.amenities && filters.amenities.length > 0) {
    params.set('amenities', filters.amenities.join(','));
  }
  return params;
}

export function SearchPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilters = useMemo(
    () => parseFiltersFromParams(searchParams),
    // Volontairement lu une seule fois au montage : les recherches
    // suivantes sont pilotées par handleSearch, pas par les changements
    // d'URL externes (pas de "retour navigateur" géré pour le MVP).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [properties, setProperties] = useState<PublicPropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async (nextFilters: SearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchProperties(nextFilters);
      setProperties(results);
    } catch {
      setError('Impossible de charger les biens pour le moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProperties(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(nextFilters: SearchFilters): void {
    setFilters(nextFilters);
    const params = filtersToSearchParams(nextFilters);
    router.replace(`/?${params.toString()}`);
    void fetchProperties(nextFilters);
  }

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />
      <SearchControls initialFilters={filters} onSearch={handleSearch} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <PropertyGridSkeleton />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : properties.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aucun bien ne correspond à votre recherche pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
            <div>
              <p className="mb-4 text-sm text-neutral-500">
                {properties.length} propriété{properties.length > 1 ? 's' : ''}{' '}
                trouvée{properties.length > 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-6 h-[calc(100vh-140px)] overflow-hidden rounded-lg">
                <SearchResultsMap properties={properties} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
