import { API_URL } from '../config';

export interface AgencyBookingView {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  commissionAmount: string;
  agencyPayoutAmount: string;
  status: string;
  createdAt: string;
  property: { id: string; title: string };
  tenant: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listAgencyBookings(
  token: string,
): Promise<AgencyBookingView[]> {
  const response = await fetch(`${API_URL}/agency/bookings`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error('Impossible de charger les réservations.');
  return response.json() as Promise<AgencyBookingView[]>;
}

export async function cancelAgencyBooking(
  token: string,
  id: string,
): Promise<AgencyBookingView> {
  const response = await fetch(`${API_URL}/agency/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Impossible d\'annuler cette réservation.');
  }
  return response.json() as Promise<AgencyBookingView>;
}
