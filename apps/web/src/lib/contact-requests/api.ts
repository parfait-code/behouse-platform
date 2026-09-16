import { API_URL } from '../config';

export type ContactRequestStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED';

export interface ContactRequestView {
  id: string;
  propertyId: string;
  propertyTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  requestedStartDate: string | null;
  requestedEndDate: string | null;
  specialRequests: string | null;
  status: ContactRequestStatus;
  createdAt: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listContactRequests(token: string): Promise<ContactRequestView[]> {
  const response = await fetch(`${API_URL}/agency/contact-requests`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error('Impossible de charger les demandes.');
  return response.json() as Promise<ContactRequestView[]>;
}

export async function updateContactRequestStatus(
  token: string,
  id: string,
  status: ContactRequestStatus,
): Promise<ContactRequestView> {
  const response = await fetch(`${API_URL}/agency/contact-requests/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Impossible de mettre à jour cette demande.');
  return response.json() as Promise<ContactRequestView>;
}
