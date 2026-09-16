import { API_URL } from '../config';

export interface AgencyPropertyView {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  pricePerNight: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
  photos: string[];
  amenities: string[];
  houseRules: Record<string, boolean> | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  pricePerNight: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  photos?: string[];
  amenities?: string[];
  houseRules?: Record<string, boolean>;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listMyProperties(
  token: string,
): Promise<AgencyPropertyView[]> {
  const response = await fetch(`${API_URL}/agency/properties`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error('Impossible de charger vos biens.');
  return response.json() as Promise<AgencyPropertyView[]>;
}

export async function createProperty(
  token: string,
  input: CreatePropertyInput,
): Promise<AgencyPropertyView> {
  const response = await fetch(`${API_URL}/agency/properties`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    throw new Error(
      Array.isArray(body?.message)
        ? body.message.join(' ')
        : (body?.message ?? 'Impossible de créer ce bien.'),
    );
  }
  return response.json() as Promise<AgencyPropertyView>;
}

export async function updateProperty(
  token: string,
  id: string,
  input: Partial<CreatePropertyInput>,
): Promise<AgencyPropertyView> {
  const response = await fetch(`${API_URL}/agency/properties/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Impossible de mettre à jour ce bien.');
  return response.json() as Promise<AgencyPropertyView>;
}

export async function publishProperty(
  token: string,
  id: string,
): Promise<AgencyPropertyView> {
  const response = await fetch(`${API_URL}/agency/properties/${id}/publish`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Impossible de publier ce bien.');
  }
  return response.json() as Promise<AgencyPropertyView>;
}

export async function unpublishProperty(
  token: string,
  id: string,
): Promise<AgencyPropertyView> {
  const response = await fetch(
    `${API_URL}/agency/properties/${id}/unpublish`,
    { method: 'PATCH', headers: authHeaders(token) },
  );
  if (!response.ok) throw new Error('Impossible de dépublier ce bien.');
  return response.json() as Promise<AgencyPropertyView>;
}
