'use client';

import { useEffect, useState } from 'react';
import {
  ContactRequestStatus,
  ContactRequestView,
  listContactRequests,
  updateContactRequestStatus,
} from '../../lib/contact-requests/api';

interface ContactRequestsTabProps {
  token: string;
}

const STATUS_LABELS: Record<ContactRequestStatus, string> = {
  NEW: 'Nouvelle',
  IN_PROGRESS: 'En cours',
  CLOSED: 'Traitée',
};

const STATUS_COLORS: Record<ContactRequestStatus, string> = {
  NEW: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  CLOSED: 'bg-neutral-100 text-neutral-500',
};

export function ContactRequestsTab({ token }: ContactRequestsTabProps): React.JSX.Element {
  const [requests, setRequests] = useState<ContactRequestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh(): void {
    setLoading(true);
    listContactRequests(token)
      .then(setRequests)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [token]);

  async function handleStatusChange(id: string, status: ContactRequestStatus): Promise<void> {
    setError(null);
    try {
      await updateContactRequestStatus(token, id, status);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.');
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Demandes de contact</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Envoyées depuis le bouton &quot;Envoyer une demande&quot; des fiches biens —
        distinctes des réservations payées.
      </p>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Chargement…</p>
      ) : requests.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Aucune demande pour le moment.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {requests.map((request) => (
            <li
              key={request.id}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">{request.propertyTitle}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {request.firstName} {request.lastName} • {request.phone} •{' '}
                    {request.email}
                  </p>
                  {request.requestedStartDate ? (
                    <p className="mt-1 text-xs text-neutral-500">
                      Du {formatDate(request.requestedStartDate)}
                      {request.requestedEndDate
                        ? ` au ${formatDate(request.requestedEndDate)}`
                        : ''}
                    </p>
                  ) : null}
                  {request.specialRequests ? (
                    <p className="mt-2 text-xs italic text-neutral-500">
                      &quot;{request.specialRequests}&quot;
                    </p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[request.status]}`}
                >
                  {STATUS_LABELS[request.status]}
                </span>
              </div>

              {request.status !== 'CLOSED' ? (
                <div className="mt-3 flex gap-2">
                  {request.status === 'NEW' ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(request.id, 'IN_PROGRESS')}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
                    >
                      Marquer en cours
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(request.id, 'CLOSED')}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
                  >
                    Marquer traitée
                  </button>
                </div>
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
