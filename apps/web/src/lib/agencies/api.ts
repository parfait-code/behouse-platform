import { API_URL } from '../config';
import { ApiError } from '../auth/api';
import { AuthResult } from '../auth/types';
import {
  AgencyPublicProfile,
  AgencySummary,
  RegisterAgencyInput,
  UpdateAgencyProfileInput,
} from './types';

interface RegisterAgencyResponse extends AuthResult {
  agency: AgencySummary;
}

export async function registerAgency(
  input: RegisterAgencyInput,
): Promise<RegisterAgencyResponse> {
  const response = await fetch(`${API_URL}/agencies/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : (body?.message ?? "Impossible de créer l'agence pour le moment.");
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<RegisterAgencyResponse>;
}

export async function getAgencyPublicProfile(
  id: string,
): Promise<AgencyPublicProfile> {
  const response = await fetch(`${API_URL}/agencies/${id}`);
  if (!response.ok) {
    throw new Error('Agence introuvable.');
  }
  return response.json() as Promise<AgencyPublicProfile>;
}

export async function getMyAgency(token: string): Promise<AgencySummary> {
  const response = await fetch(`${API_URL}/agencies/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Impossible de charger le profil agence.');
  }
  return response.json() as Promise<AgencySummary>;
}

export async function updateAgencyProfile(
  token: string,
  input: UpdateAgencyProfileInput,
): Promise<AgencySummary> {
  const response = await fetch(`${API_URL}/agencies/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Impossible de mettre à jour le profil agence.');
  }
  return response.json() as Promise<AgencySummary>;
}
