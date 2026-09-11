'use client';

import { FormEvent, useState } from 'react';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { MethodTabs, AuthMethodTab } from '../../../components/auth/MethodTabs';
import { PhoneField } from '../../../components/auth/PhoneField';
import { TextField } from '../../../components/ui/TextField';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';

/**
 * ⚠️ UI seule pour l'instant : le backend n'expose pas encore de flux de
 * réinitialisation de mot de passe (pas d'endpoint /auth/forgot-password
 * ni de génération/vérification de code OTP par email ou SMS).
 * TODO (epic E1, suite) : construire ce flux côté API avant de brancher
 * réellement ce formulaire.
 */
export default function ResetPasswordPage(): React.JSX.Element {
  const [method, setMethod] = useState<AuthMethodTab>('phone');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    // Pas d'appel API : fonctionnalité pas encore disponible côté backend.
    setSubmitted(true);
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink">
        Réinitialiser votre mot de passe
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Saisissez l&apos;email ou le numéro utilisé lors de votre inscription.
        Nous vous enverrons un code pour définir un nouveau mot de passe.
      </p>

      {submitted ? (
        <p className="mt-8 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          Cette fonctionnalité arrive très bientôt. En attendant, contactez le
          support Behouse pour réinitialiser votre mot de passe.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <MethodTabs value={method} onChange={setMethod} />

          {method === 'phone' ? (
            <PhoneField label="Numéro de téléphone" value={phone} onChange={setPhone} />
          ) : (
            <TextField
              id="email"
              label="E-mail"
              type="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          <PrimaryButton type="submit">Envoyer le code</PrimaryButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-600">
        Vous vous souvenez de votre mot de passe ?{' '}
        <a href="/auth/login" className="font-medium text-primary underline">
          Se connecter
        </a>
      </p>
    </AuthLayout>
  );
}
