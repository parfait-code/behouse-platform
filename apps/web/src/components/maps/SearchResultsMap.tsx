'use client';

import { useMemo, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF } from '@react-google-maps/api';
import { useGoogleMaps } from '../../lib/maps/useGoogleMaps';
import { PublicPropertyListItem } from '../../lib/properties/types';

interface SearchResultsMapProps {
  properties: PublicPropertyListItem[];
}

const containerStyle = { width: '100%', height: '100%', minHeight: '400px' };
const DEFAULT_CENTER = { lat: 3.848, lng: 11.5021 }; // Yaoundé — marché de lancement

export function SearchResultsMap({
  properties,
}: SearchResultsMapProps): React.JSX.Element {
  const { isLoaded, loadError } = useGoogleMaps();
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  const located = useMemo(
    () =>
      properties
        .filter((p) => p.latitude && p.longitude)
        .map((p) => ({
          ...p,
          lat: Number(p.latitude),
          lng: Number(p.longitude),
        })),
    [properties],
  );

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
        Carte indisponible pour le moment.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
        Chargement de la carte…
      </div>
    );
  }

  const center = located.length > 0 ? located[0] : DEFAULT_CENTER;
  const activeProperty = located.find((p) => p.id === activePropertyId);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={located.length > 0 ? 12 : 6}
    >
      {located.map((property) => (
        <MarkerF
          key={property.id}
          position={{ lat: property.lat, lng: property.lng }}
          onClick={() => setActivePropertyId(property.id)}
        />
      ))}

      {activeProperty ? (
        <InfoWindowF
          position={{ lat: activeProperty.lat, lng: activeProperty.lng }}
          onCloseClick={() => setActivePropertyId(null)}
        >
          <a href={`/properties/${activeProperty.id}`} className="block w-40 text-sm">
            <p className="font-medium text-ink">{activeProperty.title}</p>
            <p className="mt-1 text-neutral-500">
              {formatPrice(activeProperty.pricePerNight)} XAF / nuit
            </p>
          </a>
        </InfoWindowF>
      ) : null}
    </GoogleMap>
  );
}

function formatPrice(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat('fr-FR').format(amount);
}
