'use client';

import { useEffect, useState } from 'react';
import {
  approveAgency,
  listAllAgencies,
  reactivateAgency,
  rejectAgency,
  suspendAgency,
} from '../../lib/agencies/admin-api';
import { AgencySummary } from '../../lib/agencies/types';

interface AdminAgenciesTabProps {
  token: string;
}

const STATUS_LABELS: Record<AgencySummary['status'], string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  SUSPENDED: 'Suspendue',
  REJECTED: 'Rejetée',
};

const STATUS_COLORS: Record<AgencySummary['status'], string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-green-50 text-green-700',
  SUSPENDED: 'bg-red-50 text-red-700',
  REJECTED: 'bg-neutral-100 text-neutral-500',
};

export function AdminAgenciesTab({ token }: AdminAgenciesTabProps): React.JSX.Element {
  const [agencies, setAgencies] = useState<AgencySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh(): void {
    setLoading(true);
    listAllAgencies(token)
      .then(setAgencies)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [token]);

  async function handleAction(
    action: (token: string, id: string) => Promise<AgencySummary>,
    id: string,
  ): Promise<void> {
    setError(null);
    try {
      await action(token, id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.');
    }
  }

  async function handleReject(id: string): Promise<void> {
    const reason = window.prompt('Motif du rejet (optionnel) :') ?? undefined;
    setError(null);
    try {
      await rejectAgency(token, id, reason);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.');
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Agences</h2>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Chargement…</p>
      ) : agencies.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Aucune agence inscrite.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {agencies.map((agency) => (
            <li
              key={agency.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="text-sm font-medium text-ink">{agency.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Commission : {Number(agency.commissionRate) * 100}% • Inscrite
                  le {formatDate(agency.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[agency.status]}`}
                >
                  {STATUS_LABELS[agency.status]}
                </span>

                {agency.status === 'PENDING' ? (
                  <>
                    <ActionButton onClick={() => handleAction(approveAgency, agency.id)}>
                      Approuver
                    </ActionButton>
                    <ActionButton danger onClick={() => handleReject(agency.id)}>
                      Rejeter
                    </ActionButton>
                  </>
                ) : null}
                {agency.status === 'APPROVED' ? (
                  <ActionButton danger onClick={() => handleAction(suspendAgency, agency.id)}>
                    Suspendre
                  </ActionButton>
                ) : null}
                {agency.status === 'SUSPENDED' ? (
                  <ActionButton onClick={() => handleAction(reactivateAgency, agency.id)}>
                    Réactiver
                  </ActionButton>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  danger = false,
  children,
}: {
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
        danger
          ? 'border-red-200 text-red-600 hover:bg-red-50'
          : 'border-neutral-300 text-ink hover:border-primary hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
