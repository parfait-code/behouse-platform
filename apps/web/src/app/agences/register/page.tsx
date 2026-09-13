'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { PhoneField } from '../../../components/auth/PhoneField';
import { TextField } from '../../../components/ui/TextField';
import { PasswordField } from '../../../components/ui/PasswordField';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { registerAgency } from '../../../lib/agencies/api';
import { ApiError } from '../../../lib/auth/api';
import { saveToken } from '../../../lib/auth/token-storage';

export default function RegisterAgencyPage(): React.JSX.Element {
  const router = useRouter();

  const [agencyName, setAgencyName] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!adminPhone) {
      setErrorMessage('Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerAgency({
        agencyName,
        adminFirstName,
        adminLastName,
        adminEmail,
        adminPhone,
        password,
      });
      saveToken(result.accessToken);
      router.push('/dashboard/agency');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Une erreur est survenue. Veuillez réessayer.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink">
        Rejoignez Behouse en tant qu&apos;agence
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Publiez vos biens meublés et gérez vos réservations depuis votre
        propre espace.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <TextField
          id="agencyName"
          label="Nom de l'agence"
          placeholder="Agence Dupont Immo"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="adminFirstName"
            label="Votre prénom"
            placeholder="Jean"
            value={adminFirstName}
            onChange={(e) => setAdminFirstName(e.target.value)}
            required
          />
          <TextField
            id="adminLastName"
            label="Votre nom"
            placeholder="Dupont"
            value={adminLastName}
            onChange={(e) => setAdminLastName(e.target.value)}
            required
          />
        </div>

        <TextField
          id="adminEmail"
          label="E-mail professionnel"
          type="email"
          placeholder="contact@agence-dupont.com"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          required
        />

        <PhoneField
          label="Numéro de téléphone"
          value={adminPhone}
          onChange={setAdminPhone}
        />

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

        {errorMessage ? (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <p className="text-xs text-neutral-500">
          Votre agence sera examinée par l&apos;équipe Behouse avant de
          pouvoir publier des biens. Vous pouvez dès maintenant accéder à
          votre espace pour préparer vos annonces.
        </p>

        <PrimaryButton type="submit" loading={loading}>
          Créer mon agence
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Vous êtes un locataire ?{' '}
        <a href="/auth/register" className="font-medium text-primary underline">
          Inscrivez-vous ici
        </a>
      </p>
    </AuthLayout>
  );
}
