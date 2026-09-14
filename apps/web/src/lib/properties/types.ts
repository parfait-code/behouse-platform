/**
 * Types miroir de l'API backend (apps/api/src/properties/public-property.types.ts).
 */

export interface AgencyBadge {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface PublicPropertyListItem {
  id: string;
  title: string;
  city: string;
  pricePerNight: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  photos: string[];
  latitude: string | null;
  longitude: string | null;
  agency: AgencyBadge;
}

export interface PublicPropertyDetail extends PublicPropertyListItem {
  description: string;
  propertyType: string;
  address: string;
  beds: number;
  amenities: string[];
  houseRules: Record<string, boolean> | null;
  cancellationPolicyOverride: Record<string, unknown> | null;
  checkInTime: string | null;
  checkOutTime: string | null;
}

export interface ContactRequestInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  requestedStartDate?: string;
  requestedEndDate?: string;
  specialRequests?: string;
}

export interface SearchFilters {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

/**
 * Équipements filtrables en chips sur la page de recherche (cahier des
 * charges, section 6.1). Liste ad-hoc en attendant le catalogue
 * d'équipements pré-catégorisé (section 6.2.5, pas encore construit) —
 * les agences doivent utiliser ces libellés exacts pour que le filtre
 * fonctionne, voir TODO côté backend (search-properties-query.dto.ts).
 */
export const FILTERABLE_AMENITIES = [
  'Wifi',
  'Ascenseur',
  'Parking',
  'Climatisation',
] as const;
