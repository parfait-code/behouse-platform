import { API_URL } from '../config';
import { AgencySummary } from './types';

export interface AgencyAdminDetail extends AgencySummary {
  bankDetails: unknown;
  updatedAt: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listAllAgencies(token: string): Promise<AgencySummary[]> {
  const response = await fetch(`${API_URL}/admin/agencies`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error('Impossible de charger les agences.');
  return response.json() as Promise<AgencySummary[]>;
}

async function patchAgency(
  token: string,
  id: string,
  action: 'approve' | 'reject' | 'suspend' | 'reactivate',
  body?: Record<string, unknown>,
): Promise<AgencySummary> {
  const response = await fetch(`${API_URL}/admin/agencies/${id}/${action}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const responseBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(responseBody?.message ?? 'Action impossible.');
  }
  return response.json() as Promise<AgencySummary>;
}

export const approveAgency = (token: string, id: string): Promise<AgencySummary> =>
  patchAgency(token, id, 'approve');

export const rejectAgency = (
  token: string,
  id: string,
  reason?: string,
): Promise<AgencySummary> => patchAgency(token, id, 'reject', { reason });

export const suspendAgency = (token: string, id: string): Promise<AgencySummary> =>
  patchAgency(token, id, 'suspend');

export const reactivateAgency = (token: string, id: string): Promise<AgencySummary> =>
  patchAgency(token, id, 'reactivate');
