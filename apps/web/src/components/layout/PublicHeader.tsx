'use client';

import { useCurrentUser } from '../../lib/auth/useCurrentUser';

export function PublicHeader(): React.JSX.Element {
  const { user, loading, logout } = useCurrentUser();

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
      <a href="/" className="flex items-center gap-2 text-lg text-ink">
        <HouseIcon />
        <span>behouse</span>
      </a>

      <nav className="flex items-center gap-4 text-sm text-neutral-600">
        {loading ? (
          // Évite un flash "Connexion" avant de savoir si l'utilisateur
          // est réellement authentifié.
          <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-100" />
        ) : user ? (
          <>
            <a href="/bookings/mine" className="hover:text-ink">
              Mes réservations
            </a>
            <span className="text-neutral-400">
              Bonjour, {user.firstName}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-neutral-300 px-4 py-1.5 hover:border-primary hover:text-primary"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <a href="/auth/register" className="hover:text-ink">
              Rejoindre en tant qu&apos;agence
            </a>
            <a
              href="/auth/login"
              className="rounded-md border border-neutral-300 px-4 py-1.5 hover:border-primary hover:text-primary"
            >
              Connexion
            </a>
          </>
        )}
      </nav>
    </header>
  );
}

function HouseIcon(): React.JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
