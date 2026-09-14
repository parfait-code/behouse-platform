export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

/**
 * Nécessite que le script Google Maps soit déjà chargé (voir
 * useGoogleMaps) — utilise `window.google.maps.Geocoder`, qui fait partie
 * du coeur de l'API (pas besoin de charger la librairie "places").
 * Renvoie `null` en cas d'échec plutôt que de lever une exception : le
 * géocodage est une amélioration, pas un pré-requis bloquant à la
 * création d'un bien (l'agence peut toujours publier sans coordonnées).
 */
export function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.google?.maps) {
      resolve(null);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status !== 'OK' || !results || results.length === 0) {
        resolve(null);
        return;
      }
      const location = results[0]?.geometry.location;
      if (!location) {
        resolve(null);
        return;
      }
      resolve({ latitude: location.lat(), longitude: location.lng() });
    });
  });
}
