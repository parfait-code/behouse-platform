'use client';

import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useGoogleMaps } from '../../lib/maps/useGoogleMaps';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  label: string;
}

const containerStyle = { width: '100%', height: '192px', borderRadius: '0.5rem' };

export function LocationMap({
  latitude,
  longitude,
  label,
}: LocationMapProps): React.JSX.Element {
  const { isLoaded, loadError } = useGoogleMaps();

  if (loadError) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
        Carte indisponible pour le moment.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
        Chargement de la carte…
      </div>
    );
  }

  const center = { lat: latitude, lng: longitude };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
      <MarkerF position={center} title={label} />
    </GoogleMap>
  );
}
