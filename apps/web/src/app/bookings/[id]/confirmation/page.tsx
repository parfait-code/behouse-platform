'use client';

import { useEffect, useState } from 'react';
import { PublicHeader } from '../../../../components/layout/PublicHeader';
import { getBooking } from '../../../../lib/bookings/api';
import { BookingView } from '../../../../lib/bookings/types';
import { getToken } from '../../../../lib/auth/token-storage';

interface ConfirmationPageProps {
  params: { id: string };
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

/**
 * Cible de la redirection navigateur après paiement CinetPay
 * (return_url, voir apps/api/src/bookings/bookings.controller.ts).
 * La confirmation réelle vient du webhook, généralement déjà traité au
 * moment où l'utilisateur atterrit ici — on interroge brièvement au cas
 * où le webhook serait encore en cours de traitement.
 */
export default function BookingConfirmationPage({
  params,
}: ConfirmationPageProps): React.JSX.Element {
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    let pollCount = 0;
    let cancelled = false;

    async function poll(): Promise<void> {
      try {
        const result = await getBooking(token as string, params.id);
        if (cancelled) return;
        setBooking(result);

        if (result.status === 'PENDING' && pollCount < MAX_POLLS) {
          pollCount += 1;
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setError('Impossible de retrouver cette réservation.');
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !booking ? (
          <p className="text-sm text-neutral-500">Vérification de votre paiement…</p>
        ) : (
          <StatusMessage booking={booking} />
        )}
      </main>
    </div>
  );
}

function StatusMessage({ booking }: { booking: BookingView }): React.JSX.Element {
  switch (booking.status) {
    case 'CONFIRMED':
      return (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
            ✓
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink">Réservation confirmée !</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Votre paiement a été accepté. Vous retrouverez cette réservation dans{' '}
            <a href="/bookings/mine" className="text-primary underline">
              Mes réservations
            </a>
            .
          </p>
        </>
      );
    case 'FAILED':
      return (
        <>
          <h1 className="text-xl font-bold text-ink">Paiement refusé</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Votre paiement n&apos;a pas pu être validé. Aucune somme n&apos;a été
            débitée durablement — vous pouvez retenter votre réservation.
          </p>
        </>
      );
    default:
      return (
        <>
          <h1 className="text-xl font-bold text-ink">Paiement en cours de traitement</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Cela peut prendre quelques instants. Vous pouvez suivre le statut
            depuis{' '}
            <a href="/bookings/mine" className="text-primary underline">
              Mes réservations
            </a>
            .
          </p>
        </>
      );
  }
}
