'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { PropertiesTab } from '../../../components/dashboard/PropertiesTab';
import { BookingsTab } from '../../../components/dashboard/BookingsTab';
import { ProfileTab } from '../../../components/dashboard/ProfileTab';
import { getCurrentUser } from '../../../lib/auth/api';
import { getToken } from '../../../lib/auth/token-storage';
import { PublicUser } from '../../../lib/auth/types';
import { getMyAgency } from '../../../lib/agencies/api';
import { AgencySummary } from '../../../lib/agencies/types';

type Tab = 'properties' | 'bookings' | 'profile';

export default function AgencyDashboardPage(): React.JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [agency, setAgency] = useState<AgencySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('properties');

  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken) {
      window.location.href = '/auth/login';
      return;
    }

    Promise.all([getCurrentUser(storedToken), getMyAgency(storedToken)])
      .then(([currentUser, currentAgency]) => {
        if (currentUser.role !== 'AGENCY_ADMIN' && currentUser.role !== 'AGENT') {
          // Un locataire ou un super admin n'a rien à faire ici.
          window.location.href = '/';
          return;
        }
        setToken(storedToken);
        setUser(currentUser);
        setAgency(currentAgency);
      })
      .catch(() => setError("Impossible de charger votre espace agence."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-neutral-500">
        Chargement…
      </div>
    );
  }

  if (error || !token || !user || !agency) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-red-600">
        {error ?? 'Une erreur est survenue.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <DashboardHeader
        agencyName={agency.name}
        adminName={`${user.firstName} ${user.lastName}`}
      />

      {agency.status !== 'APPROVED' ? (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          Votre agence est actuellement au statut «&nbsp;{agencyStatusLabel(agency.status)}&nbsp;».
          {agency.status === 'PENDING'
            ? " Vos biens ne seront visibles publiquement qu'une fois votre agence validée par l'équipe Behouse."
            : ''}
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl px-6 py-6">
        <nav className="flex gap-2 border-b border-neutral-200 pb-3 text-sm">
          <TabButton active={tab === 'properties'} onClick={() => setTab('properties')}>
            Biens
          </TabButton>
          <TabButton active={tab === 'bookings'} onClick={() => setTab('bookings')}>
            Réservations
          </TabButton>
          {user.role === 'AGENCY_ADMIN' ? (
            <TabButton active={tab === 'profile'} onClick={() => setTab('profile')}>
              Page à propos
            </TabButton>
          ) : null}
        </nav>

        <div className="mt-6">
          {tab === 'properties' ? <PropertiesTab token={token} /> : null}
          {tab === 'bookings' ? <BookingsTab token={token} /> : null}
          {tab === 'profile' && user.role === 'AGENCY_ADMIN' ? (
            <ProfileTab token={token} agency={agency} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-2 font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'text-neutral-500 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function agencyStatusLabel(status: AgencySummary['status']): string {
  switch (status) {
    case 'PENDING':
      return 'en attente de validation';
    case 'SUSPENDED':
      return 'suspendue';
    case 'REJECTED':
      return 'rejetée';
    default:
      return status;
  }
}
