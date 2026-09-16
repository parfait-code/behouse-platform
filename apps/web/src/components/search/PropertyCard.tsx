'use client';

import { MouseEvent, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PublicPropertyListItem } from '../../lib/properties/types';

interface PropertyCardProps {
  property: PublicPropertyListItem;
}

export function PropertyCard({ property }: PropertyCardProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const photos = property.photos;

  function goTo(index: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((index + photos.length) % photos.length);
  }

  return (
    <a
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element -- photos hébergées sur un domaine dynamique (Neon Storage par agence)
          <img
            src={photos[activeIndex]}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Photo à venir
          </div>
        )}

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => goTo(activeIndex - 1, e)}
              aria-label="Photo précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => goTo(activeIndex + 1, e)}
              aria-label="Photo suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {photos.map((photo, index) => (
                <span
                  key={photo}
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === activeIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}

        <span className="absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-sm font-semibold text-ink shadow">
          {formatPrice(property.pricePerNight)}{' '}
          <span className="font-normal text-neutral-500">/ nuit</span>
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink">
          {property.title}
        </h3>
        <p className="mt-1 text-sm text-neutral-500">{property.city}</p>
        <p className="mt-2 text-xs text-neutral-500">
          {property.bedrooms} chambre{property.bedrooms > 1 ? 's' : ''} •{' '}
          {property.bathrooms} salle{property.bathrooms > 1 ? 's' : ''} de bain •
          Jusqu&apos;à {property.maxGuests} invité
          {property.maxGuests > 1 ? 's' : ''}
        </p>
      </div>
    </a>
  );
}

function formatPrice(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
}
