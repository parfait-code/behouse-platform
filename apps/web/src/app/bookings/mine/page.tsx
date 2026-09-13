'use client';

import { useEffect, useState } from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { getMyBookings } from '../../../lib/bookings/api';
import { BookingView } from '../../../lib/bookings/types';
import { getToken } from '../../../lib/auth/token-storage';

const STATUS_LABELS: Record<BookingView['status'], string> = {
  PENDING: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  IN_PROGRESS: 'Séjour en cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  FAILED: 'Paiement échoué',
  REFUNDED: 'Remboursée',
};

export default function MyBookingsPage(): React.JSX.Element {
  const [bookings, setBookings] = useState<BookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    getMyBookings(token)
      .then(setBookings)
      .catch(() => setError('Impossible de charger vos réservations.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-bold text-ink">Mes réservations</h1>

        {loading ? (
          <p className="mt-6 text-sm text-neutral-500">Chargement…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">
            Vous n&apos;avez pas encore de réservation.{' '}
            <a href="/" className="font-medium text-primary underline">
              Trouver un logement
            </a>
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    Du {formatDate(booking.startDate)} au{' '}
                    {formatDate(booking.endDate)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatPrice(booking.totalAmount)} XAF
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(booking.status)}`}
                >
                  {STATUS_LABELS[booking.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatPrice(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat('fr-FR').format(amount);
}

function statusColor(status: BookingView['status']): string {
  switch (status) {
    case 'CONFIRMED':
    case 'IN_PROGRESS':
    case 'COMPLETED':
      return 'bg-green-50 text-green-700';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700';
    default:
      return 'bg-red-50 text-red-700';
  }
}
