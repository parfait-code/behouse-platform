import { API_URL } from '../config';
import { BookingView } from './types';

export interface CreateBookingInput {
  propertyId: string;
  startDate: string;
  endDate: string;
  guests?: number;
}

export interface CreateBookingResult {
  booking: BookingView;
  paymentUrl: string | null;
}

export async function createBooking(
  token: string,
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : (body?.message ?? 'Impossible de créer la réservation.');
    throw new Error(message);
  }

  return response.json() as Promise<CreateBookingResult>;
}

export async function getBooking(token: string, id: string): Promise<BookingView> {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Réservation introuvable.');
  }
  return response.json() as Promise<BookingView>;
}

export async function getMyBookings(token: string): Promise<BookingView[]> {
  const response = await fetch(`${API_URL}/bookings/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Impossible de charger vos réservations.');
  }
  return response.json() as Promise<BookingView[]>;
}
