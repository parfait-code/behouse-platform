'use client';

import { useEffect, useState } from 'react';
import {
  AdminBookingView,
  CommissionSummary,
  getCommissionSummary,
  listAllBookings,
} from '../../lib/bookings/admin-api';

interface AdminBookingsTabProps {
  token: string;
}

export function AdminBookingsTab({ token }: AdminBookingsTabProps): React.JSX.Element {
  const [bookings, setBookings] = useState<AdminBookingView[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAllBookings(token), getCommissionSummary(token)])
      .then(([bookingsData, summaryData]) => {
        setBookings(bookingsData);
        setSummary(summaryData);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Chargement…</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">
        Réservations &amp; commissions
      </h2>

      {summary ? (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <SummaryCard label="Réservations confirmées" value={String(summary.bookingsCount)} />
          <SummaryCard label="Chiffre d'affaires" value={`${formatAmount(summary.totalRevenue)} XAF`} />
          <SummaryCard label="Commission Behouse (10%)" value={`${formatAmount(summary.totalCommission)} XAF`} />
        </div>
      ) : null}

      <h3 className="mt-8 text-sm font-semibold text-ink">Toutes les réservations</h3>
      {bookings.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">Aucune réservation pour le moment.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{booking.property.title}</p>
                <p className="text-xs text-neutral-500">
                  Agence : {booking.agency.name} • Locataire :{' '}
                  {booking.tenant.firstName} {booking.tenant.lastName}
                </p>
              </div>
              <div className="text-right text-xs text-neutral-500">
                <p>{formatAmount(booking.totalAmount)} XAF</p>
                <p>{booking.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function formatAmount(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat('fr-FR').format(amount);
}
