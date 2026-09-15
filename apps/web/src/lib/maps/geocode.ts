export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

const GEOCODE_TIMEOUT_MS = 6000;

/**
 * Nécessite que le script Google Maps soit déjà chargé (voir
 * useGoogleMaps) — utilise `window.google.maps.Geocoder`, qui fait partie
 * du coeur de l'API (pas besoin de charger la librairie "places").
 * Renvoie `null` en cas d'échec plutôt que de lever une exception : le
 * géocodage est une amélioration, pas un pré-requis bloquant à la
 * création d'un bien (l'agence peut toujours publier sans coordonnées).
 *
 * ⚠️ Protégé par un timeout : si le callback du Geocoder ne se déclenche
 * jamais (clé sans facturation activée, API Geocoding non activée,
 * restriction de referrer...), on ne doit JAMAIS bloquer indéfiniment
 * l'appelant — bug corrigé où la création de bien restait bloquée en
 * "chargement" sans qu'aucune requête ne parte.
 */
export function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const geocodePromise = new Promise<GeocodeResult | null>((resolve) => {
    if (typeof window === 'undefined' || !window.google?.maps) {
      resolve(null);
      return;
    }

    try {
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
    } catch {
      resolve(null);
    }
  });

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), GEOCODE_TIMEOUT_MS);
  });

  return Promise.race([geocodePromise, timeoutPromise]);
}
