'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { MethodTabs, AuthMethodTab } from '../../../components/auth/MethodTabs';
import { PhoneField } from '../../../components/auth/PhoneField';
import { GoogleButton } from '../../../components/auth/GoogleButton';
import { TextField } from '../../../components/ui/TextField';
import { PasswordField } from '../../../components/ui/PasswordField';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { loginWithEmail, loginWithPhone, ApiError } from '../../../lib/auth/api';
import { saveToken } from '../../../lib/auth/token-storage';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();

  const [method, setMethod] = useState<AuthMethodTab>('phone');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);

    if (method === 'phone' && !phone) {
      setErrorMessage('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    if (method === 'email' && !email) {
      setErrorMessage('Veuillez saisir votre adresse email.');
      return;
    }

    setLoading(true);
    try {
      const result =
        method === 'phone'
          ? await loginWithPhone({ phone: phone as string, password })
          : await loginWithEmail({ email, password });

      saveToken(result.accessToken);
      router.push('/');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink">Bon retour sur Behouse !</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Veuillez saisir vos informations ci-dessous.
      </p>

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

        <PasswordField
          id="password"
          label="Mot de passe"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-neutral-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Se souvenir de moi
          </label>
          <a href="/auth/reset-password" className="font-medium text-primary underline">
            Mot de passe oublié ?
          </a>
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <PrimaryButton type="submit" loading={loading}>
          Se connecter
        </PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        Ou continuer avec
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-sm text-neutral-600">
        Vous n&apos;avez pas de compte ?{' '}
        <a href="/auth/register" className="font-medium text-primary underline">
          S&apos;inscrire
        </a>
      </p>
    </AuthLayout>
  );
}
