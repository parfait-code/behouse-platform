'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveToken } from '../../../lib/auth/token-storage';

export function CallbackHandler(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      saveToken(token);
      router.replace('/');
    } else {
      router.replace('/auth/login?error=google');
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <p className="text-sm text-neutral-600">Connexion en cours…</p>
    </div>
  );
}
