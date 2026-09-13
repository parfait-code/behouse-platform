'use client';

import { useEffect, useState } from 'react';
import {
  AgencyBookingView,
  cancelAgencyBooking,
  listAgencyBookings,
} from '../../lib/bookings/agency-api';

interface BookingsTabProps {
  token: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  IN_PROGRESS: 'Séjour en cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  FAILED: 'Paiement échoué',
  REFUNDED: 'Remboursée',
};

export function BookingsTab({ token }: BookingsTabProps): React.JSX.Element {
  const [bookings, setBookings] = useState<AgencyBookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh(): void {
    setLoading(true);
    listAgencyBookings(token)
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [token]);

  async function handleCancel(id: string): Promise<void> {
    setError(null);
    try {
      await cancelAgencyBooking(token, id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.');
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Réservations</h2>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Chargement…</p>
      ) : bookings.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Aucune réservation pour le moment.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {booking.property.title}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {booking.tenant.firstName} {booking.tenant.lastName} •{' '}
                    {booking.tenant.phone ?? booking.tenant.email}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Du {formatDate(booking.startDate)} au{' '}
                    {formatDate(booking.endDate)} — reversement :{' '}
                    {booking.agencyPayoutAmount} XAF
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </span>
              </div>
              {booking.status === 'CONFIRMED' ? (
                <button
                  type="button"
                  onClick={() => handleCancel(booking.id)}
                  className="mt-3 text-xs font-medium text-red-600 underline"
                >
                  Annuler cette réservation
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
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
