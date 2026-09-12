'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../ui/Modal';
import { TextField } from '../ui/TextField';
import { PrimaryButton } from '../ui/PrimaryButton';
import { PhoneField } from '../auth/PhoneField';
import { submitContactRequest } from '../../lib/properties/api';

interface ContactRequestModalProps {
  propertyId: string;
  onClose: () => void;
}

export function ContactRequestModal({
  propertyId,
  onClose,
}: ContactRequestModalProps): React.JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!phone) {
      setError('Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    setLoading(true);
    try {
      await submitContactRequest(propertyId, {
        firstName,
        lastName,
        email,
        phone,
        requestedStartDate: startDate || undefined,
        requestedEndDate: endDate || undefined,
        specialRequests: specialRequests || undefined,
      });
      setSubmitted(true);
    } catch {
      setError("Impossible d'envoyer votre demande pour le moment. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Envoyer une demande" onClose={onClose}>
      {submitted ? (
        <p className="text-sm text-ink">
          Votre demande a bien été envoyée. L&apos;agence vous répondra
          directement par email ou téléphone.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-neutral-600">
            Remplissez le formulaire ci-dessous et nous vous répondrons sous
            peu.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              id="contact-firstName"
              label="Prénom"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <TextField
              id="contact-lastName"
              label="Nom"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <TextField
            id="contact-email"
            label="E-mail"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PhoneField label="Téléphone" value={phone} onChange={setPhone} />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              Arrivée <span className="font-normal text-neutral-400">(optionnel)</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              Départ <span className="font-normal text-neutral-400">(optionnel)</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Exigences particulières{' '}
            <span className="font-normal text-neutral-400">(optionnel)</span>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
              className="resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Toute demande ou exigence particulière…"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <PrimaryButton type="submit" loading={loading}>
            Envoyer la demande
          </PrimaryButton>
        </form>
      )}
    </Modal>
  );
}
