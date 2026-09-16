'use client';

import { FormEvent, useState } from 'react';
import { updateAgencyProfile } from '../../lib/agencies/api';
import { AgencySummary } from '../../lib/agencies/types';
import { uploadFiles } from '../../lib/uploads/api';
import { PrimaryButton } from '../ui/PrimaryButton';
import { TextField } from '../ui/TextField';
import { ImageUploader } from '../ui/ImageUploader';

interface ProfileTabProps {
  token: string;
  agency: AgencySummary;
}

export function ProfileTab({ token, agency }: ProfileTabProps): React.JSX.Element {
  const [description, setDescription] = useState(agency.description ?? '');
  const [existingLogo, setExistingLogo] = useState<string[]>(
    agency.logoUrl ? [agency.logoUrl] : [],
  );
  const [newLogoFile, setNewLogoFile] = useState<File[]>([]);
  const [aboutPageContent, setAboutPageContent] = useState(agency.aboutPageContent ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      // Upload différé au clic sur "Enregistrer" (voir ImageUploader).
      const uploadedLogo =
        newLogoFile.length > 0
          ? (await uploadFiles(token, newLogoFile, 'AGENCY_LOGO'))[0]
          : undefined;

      await updateAgencyProfile(token, {
        description: description || undefined,
        logoUrl: uploadedLogo ?? existingLogo[0] ?? undefined,
        aboutPageContent: aboutPageContent || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de mettre à jour le profil.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Page à propos</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Ce contenu est visible publiquement sur{' '}
        <a href={`/agences/${agency.id}`} className="underline">
          votre page Behouse
        </a>
        .
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex max-w-xl flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5"
      >
        <TextField
          id="agency-description"
          label="Description courte"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Agence spécialisée dans la location meublée à Yaoundé"
        />

        <ImageUploader
          label="Logo de l'agence"
          existingUrls={existingLogo}
          onExistingUrlsChange={setExistingLogo}
          files={newLogoFile}
          onFilesChange={setNewLogoFile}
        />

        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Présentation complète
          <textarea
            value={aboutPageContent}
            onChange={(e) => setAboutPageContent(e.target.value)}
            rows={6}
            className="resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Présentez votre agence, votre zone de couverture, votre histoire…"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {saved ? (
          <p className="text-sm text-green-700">Profil mis à jour.</p>
        ) : null}

        <PrimaryButton type="submit" loading={loading}>
          Enregistrer
        </PrimaryButton>
      </form>
    </div>
  );
}
