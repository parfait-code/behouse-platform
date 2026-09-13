import { API_URL } from '../config';
import { AgencyBookingView } from './agency-api';

export interface AdminBookingView extends AgencyBookingView {
  agency: { id: string; name: string };
}

export interface CommissionSummary {
  totalCommission: string;
  totalRevenue: string;
  bookingsCount: number;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function listAllBookings(token: string): Promise<AdminBookingView[]> {
  const response = await fetch(`${API_URL}/admin/bookings`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error('Impossible de charger les réservations.');
  return response.json() as Promise<AdminBookingView[]>;
}

export async function getCommissionSummary(
  token: string,
): Promise<CommissionSummary> {
  const response = await fetch(`${API_URL}/admin/bookings/commissions/summary`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error('Impossible de charger le résumé des commissions.');
  return response.json() as Promise<CommissionSummary>;
}
