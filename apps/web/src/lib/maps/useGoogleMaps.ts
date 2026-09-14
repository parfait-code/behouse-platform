'use client';

import { useLoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from './config';

/**
 * `useLoadScript` de @react-google-maps/api dédoublonne déjà le
 * chargement du script si plusieurs composants l'appellent sur la même
 * page — ce hook centralise juste la clé API et la liste des librairies
 * pour rester cohérent partout où une carte est utilisée.
 */
export function useGoogleMaps(): { isLoaded: boolean; loadError: Error | undefined } {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  return { isLoaded, loadError };
}
