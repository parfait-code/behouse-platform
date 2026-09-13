'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from './api';
import { clearToken, getToken } from './token-storage';
import { PublicUser } from './types';

interface UseCurrentUserResult {
  user: PublicUser | null;
  loading: boolean;
  logout: () => void;
}

/**
 * Résout l'utilisateur connecté côté client, à partir du token stocké en
 * localStorage. Utilisé par les en-têtes du site public pour refléter
 * l'état de connexion (voir PublicHeader.tsx).
 */
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser(token)
      .then(setUser)
      .catch(() => {
        // Token invalide/expiré : on nettoie plutôt que de laisser un état
        // "connecté" trompeur dans l'interface.
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function logout(): void {
    clearToken();
    setUser(null);
    window.location.href = '/';
  }

  return { user, loading, logout };
}
