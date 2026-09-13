'use client';

import { useState } from 'react';
import { ContactRequestModal } from './ContactRequestModal';
import { createBooking } from '../../lib/bookings/api';
import { getToken } from '../../lib/auth/token-storage';

interface BookingSidebarProps {
  propertyId: string;
  pricePerNight: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function BookingSidebar({
  propertyId,
  pricePerNight,
}: BookingSidebarProps): React.JSX.Element {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nights = computeNights(checkIn, checkOut);
  const totalPrice = nights ? nights * Number(pricePerNight) : null;

  async function handleCheckAvailability(): Promise<void> {
    setError(null);

    const token = getToken();
    if (!token) {
      // On perd la sélection de dates en redirigeant — acceptable pour le
      // MVP, à améliorer plus tard (retour post-connexion vers la fiche
      // bien avec les dates pré-remplies).
      window.location.href = '/auth/login';
      return;
    }

    setLoading(true);
    try {
      const result = await createBooking(token, {
        propertyId,
        startDate: checkIn,
        endDate: checkOut,
        guests,
      });

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        setError(
          "Votre réservation est enregistrée, mais le paiement n'a pas pu être initialisé. Contactez le support Behouse.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de vérifier la disponibilité pour le moment.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sticky top-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-ink">Réservez votre séjour</h3>
      <p className="mt-1 text-sm text-neutral-500">
        {totalPrice
          ? `${formatPrice(totalPrice)} XAF pour ${nights} nuit${nights && nights > 1 ? 's' : ''}`
          : 'Sélectionnez les dates pour voir les prix.'}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Arrivée
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Départ
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
        </div>

        <div className="flex items-center justify-between rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <span>
            {guests} invité{guests > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="text-neutral-500 hover:text-ink"
              aria-label="Retirer un invité"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setGuests((g) => g + 1)}
              className="text-neutral-500 hover:text-ink"
              aria-label="Ajouter un invité"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={!checkIn || !checkOut || loading}
          onClick={handleCheckAvailability}
          className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Redirection vers le paiement…' : 'Vérifier la disponibilité'}
        </button>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => setShowContactModal(true)}
          className="w-full rounded-md border border-neutral-300 py-3 text-sm font-medium text-ink hover:bg-neutral-50"
        >
          Envoyer une demande
        </button>

        <p className="text-center text-xs text-neutral-400">
          Confirmation de réservation instantanée
        </p>
      </div>

      {showContactModal ? (
        <ContactRequestModal
          propertyId={propertyId}
          onClose={() => setShowContactModal(false)}
        />
      ) : null}
    </div>
  );
}

function computeNights(checkIn: string, checkOut: string): number | null {
  if (!checkIn || !checkOut) return null;
  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / MS_PER_DAY,
  );
  return nights > 0 ? nights : null;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}
