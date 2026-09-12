'use client';

import { useState } from 'react';
import { ContactRequestModal } from './ContactRequestModal';

interface BookingSidebarProps {
  propertyId: string;
}

/**
 * "Vérifier la disponibilité" ne mène pas encore à un vrai tunnel de
 * réservation : le module Réservation + Paiement (CinetPay, epic E6)
 * n'est pas construit. On l'annonce honnêtement plutôt que de faire
 * semblant — voir /auth/reset-password pour le même principe appliqué
 * ailleurs dans le projet.
 */
export function BookingSidebar({ propertyId }: BookingSidebarProps): React.JSX.Element {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);
  const [bookingNotice, setBookingNotice] = useState(false);

  return (
    <div className="sticky top-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-ink">Réservez votre séjour</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Sélectionnez les dates pour voir les prix.
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
          disabled={!checkIn || !checkOut}
          onClick={() => setBookingNotice(true)}
          className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Vérifier la disponibilité
        </button>

        {bookingNotice ? (
          <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
            La réservation et le paiement en ligne arrivent très bientôt.
            En attendant, envoyez une demande à l&apos;agence ci-dessous.
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
