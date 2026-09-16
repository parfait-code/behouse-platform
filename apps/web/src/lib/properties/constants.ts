/**
 * Catalogue d'équipements pré-catégorisé — TODO (cahier des charges,
 * 6.2.5) : à terme, ce catalogue devrait être partagé/versionné avec le
 * backend pour garantir la cohérence saisie agence <-> filtre recherche.
 * En attendant, ces libellés exacts sont utilisés à la fois dans les
 * filtres de recherche (FILTERABLE_AMENITIES) et dans le formulaire de
 * création/édition d'un bien.
 */
export const AMENITIES_CATALOG = [
  'Wifi',
  'Cuisine',
  'Chauffage',
  'Climatisation',
  'Ascenseur',
  'Parking',
  'Buanderie',
  'TV',
  'Smart TV',
  'Cable TV',
  'Fer à repasser',
] as const;

/**
 * Règles de la maison (cahier des charges, 6.2.7). Les libellés servent
 * directement de clé dans `Property.houseRules` (Record<string, boolean>)
 * — voir PropertyDetailView qui affiche les clés à vrai directement.
 */
export const HOUSE_RULES_CATALOG = [
  'Interdiction de fumer',
  'Animaux interdits',
  "Pas de fêtes ou d'événements",
  'Caution requise',
] as const;
