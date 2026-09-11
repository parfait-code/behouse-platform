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
import { registerWithEmail, registerWithPhone, ApiError } from '../../../lib/auth/api';
import { saveToken } from '../../../lib/auth/token-storage';

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();

  const [method, setMethod] = useState<AuthMethodTab>('phone');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage(
        "Veuillez accepter les conditions générales et la politique de confidentialité.",
      );
      return;
    }
    if (method === 'phone' && !phone) {
      setErrorMessage('Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    if (method === 'email' && !email) {
      setErrorMessage('Veuillez saisir une adresse email.');
      return;
    }

    setLoading(true);
    try {
      const result =
        method === 'phone'
          ? await registerWithPhone({ phone: phone as string, password, firstName, lastName })
          : await registerWithEmail({ email, password, firstName, lastName });

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
      <h1 className="text-2xl font-bold text-ink">Rejoignez Behouse</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Trouvez et réservez un logement meublé en quelques minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="firstName"
            label="Prénom"
            placeholder="Jean"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <TextField
            id="lastName"
            label="Nom"
            placeholder="Dupont"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">
            Méthode d&apos;inscription
          </span>
          <MethodTabs value={method} onChange={setMethod} />
        </div>

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
          label="Créer un mot de passe"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <PasswordField
          id="confirmPassword"
          label="Confirmer le mot de passe"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />

        <label className="flex items-start gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <span>
            J&apos;accepte les{' '}
            <a href="/legal/cgu" className="underline">
              Conditions générales
            </a>{' '}
            et la{' '}
            <a href="/legal/confidentialite" className="underline">
              Politique de confidentialité
            </a>
            .
          </span>
        </label>

        {errorMessage ? (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <PrimaryButton type="submit" loading={loading}>
          S&apos;inscrire
        </PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        Ou rejoindre avec
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-sm text-neutral-600">
        Vous avez déjà un compte ?{' '}
        <a href="/auth/login" className="font-medium text-primary underline">
          Se connecter
        </a>
      </p>
    </AuthLayout>
  );
}
