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
  'Piscine',
  'Jardin',
  'Balcon',
  'Terrasse',
  'Groupe électrogène',
  'Eau chaude',
  'Réfrigérateur',
  'Four',
  'Micro-ondes',
  'Lave-linge',
  'Sèche-linge',
  'Espace de travail',
  'Sécurité 24h/24',
  'Caméras de surveillance',
  'Interphone',
  'Salle de sport',
  'Vue sur mer',
  'Animaux acceptés',
  'Accès handicapé',
] as const;

/**
 * Types de logement (formulaire de création/édition, cahier des charges
 * 7.3) — sélection unique dans une liste plutôt qu'un champ libre, pour
 * garder des valeurs cohérentes exploitables plus tard en filtre.
 */
export const PROPERTY_TYPES = [
  'Appartement',
  'Studio',
  'Villa',
  'Maison',
  'Chambre',
  'Duplex',
  'Penthouse',
  'Loft',
  'Résidence meublée',
  'Bungalow',
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
