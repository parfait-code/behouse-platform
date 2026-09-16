'use client';

import { FormEvent, useState } from 'react';
import { FILTERABLE_AMENITIES, SearchFilters } from '../../lib/properties/types';

interface SearchControlsProps {
  initialFilters: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
}

const BEDROOM_OPTIONS = [1, 2, 3];
const BATHROOM_OPTIONS = [1, 2];

export function SearchControls({
  initialFilters,
  onSearch,
}: SearchControlsProps): React.JSX.Element {
  const [city, setCity] = useState(initialFilters.city ?? '');
  const [checkIn, setCheckIn] = useState(initialFilters.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initialFilters.checkOut ?? '');
  const [guests, setGuests] = useState(initialFilters.guests ?? 1);
  const todayISO = new Date().toISOString().split('T')[0] as string;

  const [bedrooms, setBedrooms] = useState<number | undefined>(
    initialFilters.bedrooms,
  );
  const [bathrooms, setBathrooms] = useState<number | undefined>(
    initialFilters.bathrooms,
  );
  const [amenities, setAmenities] = useState<string[]>(
    initialFilters.amenities ?? [],
  );
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [showBudget, setShowBudget] = useState(false);

  function emitSearch(overrides: Partial<SearchFilters> = {}): void {
    onSearch({
      city: city || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests,
      bedrooms,
      bathrooms,
      minPrice,
      maxPrice,
      amenities,
      ...overrides,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    emitSearch();
  }

  function toggleAmenity(amenity: string): void {
    const next = amenities.includes(amenity)
      ? amenities.filter((a) => a !== amenity)
      : [...amenities, amenity];
    setAmenities(next);
    emitSearch({ amenities: next });
  }

  function toggleBedrooms(value: number): void {
    const next = bedrooms === value ? undefined : value;
    setBedrooms(next);
    emitSearch({ bedrooms: next });
  }

  function toggleBathrooms(value: number): void {
    const next = bathrooms === value ? undefined : value;
    setBathrooms(next);
    emitSearch({ bathrooms: next });
  }

  function applyBudget(): void {
    setShowBudget(false);
    emitSearch({ minPrice, maxPrice });
  }

  return (
    <div className="border-b border-neutral-200 bg-white">
      {/* Barre principale : ville, dates, invités */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ville (ex : Yaoundé)"
          className="min-w-[160px] flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="date"
          value={checkIn}
          min={todayISO}
          onChange={(e) => setCheckIn(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="date"
          value={checkOut}
          min={checkIn || todayISO}
          onChange={(e) => setCheckOut(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="text-neutral-500 hover:text-ink"
            aria-label="Retirer un invité"
          >
            −
          </button>
          <span>
            {guests} invité{guests > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => setGuests((g) => g + 1)}
            className="text-neutral-500 hover:text-ink"
            aria-label="Ajouter un invité"
          >
            +
          </button>
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Rechercher
        </button>
      </form>

      {/* Filtres rapides : équipements, chambres, salles de bain, budget */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 pb-4 text-sm sm:px-6">
        {FILTERABLE_AMENITIES.map((amenity) => (
          <Chip
            key={amenity}
            active={amenities.includes(amenity)}
            onClick={() => toggleAmenity(amenity)}
          >
            {amenity}
          </Chip>
        ))}
        {BEDROOM_OPTIONS.map((value) => (
          <Chip
            key={`bed-${value}`}
            active={bedrooms === value}
            onClick={() => toggleBedrooms(value)}
          >
            {value}+ chambres
          </Chip>
        ))}
        {BATHROOM_OPTIONS.map((value) => (
          <Chip
            key={`bath-${value}`}
            active={bathrooms === value}
            onClick={() => toggleBathrooms(value)}
          >
            {value}+ salles de bain
          </Chip>
        ))}

        <div className="relative">
          <Chip active={showBudget} onClick={() => setShowBudget((v) => !v)}>
            Budget
          </Chip>
          {showBudget ? (
            <div className="absolute left-0 top-full z-10 mt-2 flex w-64 flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4 shadow-lg">
              <label className="flex flex-col gap-1 text-xs text-neutral-500">
                Prix min / nuit
                <input
                  type="number"
                  value={minPrice ?? ''}
                  onChange={(e) =>
                    setMinPrice(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-500">
                Prix max / nuit
                <input
                  type="number"
                  value={maxPrice ?? ''}
                  onChange={(e) =>
                    setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={applyBudget}
                className="rounded-md bg-primary py-1.5 text-sm font-medium text-white"
              >
                Appliquer
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 transition-colors ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-neutral-300 bg-white text-neutral-600 hover:border-primary'
      }`}
    >
      {children}
    </button>
  );
}
