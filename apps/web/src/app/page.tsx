import { Suspense } from 'react';
import { SearchPageContent } from './SearchPageContent';

/**
 * Page d'accueil Behouse = page de recherche/listing (cahier des charges,
 * section 6.1) — il n'y a volontairement pas de page vitrine séparée.
 *
 * Ne couvre pas encore (TODO, section 4 non implémentée) :
 * - la carte interactive avec clustering (nécessite une clé Google Maps)
 * - le tri des résultats et la pagination/scroll infini
 */
export default function HomePage(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
