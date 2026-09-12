import { API_URL } from '../config';
import {
  ContactRequestInput,
  PublicPropertyDetail,
  PublicPropertyListItem,
  SearchFilters,
} from './types';

function buildQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();

  if (filters.city) params.set('city', filters.city);
  if (filters.checkIn) params.set('checkIn', filters.checkIn);
  if (filters.checkOut) params.set('checkOut', filters.checkOut);
  if (filters.guests) params.set('guests', String(filters.guests));
  if (filters.bedrooms) params.set('bedrooms', String(filters.bedrooms));
  if (filters.bathrooms) params.set('bathrooms', String(filters.bathrooms));
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.amenities && filters.amenities.length > 0) {
    params.set('amenities', filters.amenities.join(','));
  }

  return params.toString();
}

export async function searchProperties(
  filters: SearchFilters,
): Promise<PublicPropertyListItem[]> {
  const queryString = buildQueryString(filters);
  const response = await fetch(
    `${API_URL}/properties${queryString ? `?${queryString}` : ''}`,
  );
  if (!response.ok) {
    throw new Error('Impossible de charger les biens pour le moment.');
  }
  return response.json() as Promise<PublicPropertyListItem[]>;
}

export async function getPropertyDetail(
  id: string,
): Promise<PublicPropertyDetail> {
  const response = await fetch(`${API_URL}/properties/${id}`);
  if (!response.ok) {
    throw new Error('Ce bien est introuvable ou n\'est plus disponible.');
  }
  return response.json() as Promise<PublicPropertyDetail>;
}

export async function getBlockedDates(
  propertyId: string,
  from: string,
  to: string,
): Promise<string[]> {
  const params = new URLSearchParams({ from, to });
  const response = await fetch(
    `${API_URL}/properties/${propertyId}/availability?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error('Impossible de charger le calendrier.');
  }
  const data = (await response.json()) as { blockedDates: string[] };
  return data.blockedDates;
}

export async function submitContactRequest(
  propertyId: string,
  input: ContactRequestInput,
): Promise<{ id: string }> {
  const response = await fetch(
    `${API_URL}/properties/${propertyId}/contact-requests`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    throw new Error("Impossible d'envoyer votre demande pour le moment.");
  }
  return response.json() as Promise<{ id: string }>;
}
