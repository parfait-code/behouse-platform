'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps): React.JSX.Element {
  useEffect(() => {
    // Log console pour le diagnostic — un vrai outil de suivi d'erreurs
    // (Sentry ou équivalent) pourra être branché ici plus tard.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-sm font-medium text-red-600">Erreur</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">
        Une erreur inattendue s&apos;est produite
      </h1>
      <p className="mt-2 max-w-md text-sm text-neutral-500">
        Nos équipes ont été notifiées. Vous pouvez réessayer ou revenir à
        l&apos;accueil.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Réessayer
        </button>
        <a
          href="/"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50"
        >
          Accueil
        </a>
      </div>
    </div>
  );
}
