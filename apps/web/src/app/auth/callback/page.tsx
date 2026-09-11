import { Suspense } from 'react';
import { CallbackHandler } from './CallbackHandler';

export default function AuthCallbackPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cream">
          <p className="text-sm text-neutral-600">Connexion en cours…</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
