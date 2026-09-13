import { API_URL } from '../config';
import { BookingView } from './types';

export async function getMyBookings(token: string): Promise<BookingView[]> {
  const response = await fetch(`${API_URL}/bookings/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Impossible de charger vos réservations.');
  }
  return response.json() as Promise<BookingView[]>;
}
