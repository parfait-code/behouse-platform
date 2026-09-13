'use client';

import { useEffect, useState } from 'react';
import { AdminAgenciesTab } from '../../../components/admin/AdminAgenciesTab';
import { AdminBookingsTab } from '../../../components/admin/AdminBookingsTab';
import { getCurrentUser } from '../../../lib/auth/api';
import { clearToken, getToken } from '../../../lib/auth/token-storage';
import { PublicUser } from '../../../lib/auth/types';

type Tab = 'agencies' | 'bookings';

export default function AdminDashboardPage(): React.JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('agencies');

  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken) {
      window.location.href = '/auth/login';
      return;
    }

    getCurrentUser(storedToken)
      .then((currentUser) => {
        if (currentUser.role !== 'SUPER_ADMIN') {
          window.location.href = '/';
          return;
        }
        setToken(storedToken);
        setUser(currentUser);
      })
      .catch(() => setError('Impossible de charger le dashboard Behouse.'))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout(): void {
    clearToken();
    window.location.href = '/';
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-neutral-500">
        Chargement…
      </div>
    );
  }

  if (error || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-red-600">
        {error ?? 'Une erreur est survenue.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-lg text-ink">
          <span>behouse</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Dashboard Behouse
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-600">
          <span>{user.firstName}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-neutral-300 px-4 py-1.5 hover:border-primary hover:text-primary"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-6">
        <nav className="flex gap-2 border-b border-neutral-200 pb-3 text-sm">
          <TabButton active={tab === 'agencies'} onClick={() => setTab('agencies')}>
            Agences
          </TabButton>
          <TabButton active={tab === 'bookings'} onClick={() => setTab('bookings')}>
            Réservations &amp; commissions
          </TabButton>
        </nav>

        <div className="mt-6">
          {tab === 'agencies' ? <AdminAgenciesTab token={token} /> : null}
          {tab === 'bookings' ? <AdminBookingsTab token={token} /> : null}
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
