'use client';

import { ChangeEvent, useState } from 'react';
import { X } from 'lucide-react';
import { uploadFile, UploadPurpose } from '../../lib/uploads/api';

interface ImageUploaderProps {
  token: string;
  purpose: UploadPurpose;
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label: string;
}

interface PendingImage {
  id: string;
  previewUrl: string; // URL locale (blob:), le temps que l'upload se termine
  file: File;
  status: 'uploading' | 'error';
}

/**
 * Affiche un aperçu LOCAL (URL.createObjectURL) dès la sélection du
 * fichier, avant même que l'upload ne parte — l'utilisateur voit
 * immédiatement l'image choisie plutôt que d'attendre l'aller-retour
 * réseau. La miniature définitive (URL Neon Storage) prend le relai une
 * fois l'upload terminé.
 */
export function ImageUploader({
  token,
  purpose,
  value,
  onChange,
  multiple = false,
  label,
}: ImageUploaderProps): React.JSX.Element {
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // ⚠️ Extraire le tableau AVANT de réinitialiser event.target.value :
    // FileList est une référence live liée à l'input — la vider clearerait
    // aussi les fichiers déjà "capturés" ici si on le fait avant (bug
    // corrigé : le fichier sélectionné disparaissait silencieusement).
    setError(null);
    const selectedFiles = multiple ? Array.from(files) : [files[0] as File];
    event.target.value = ''; // permet de re-sélectionner le même fichier

    const newPending: PendingImage[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      file,
      status: 'uploading',
    }));

    setPending((prev) => (multiple ? [...prev, ...newPending] : newPending));
    newPending.forEach(startUpload);
  }

  function startUpload(item: PendingImage): void {
    uploadFile(token, item.file, purpose)
      .then((remoteUrl) => {
        URL.revokeObjectURL(item.previewUrl);
        setPending((prev) => prev.filter((p) => p.id !== item.id));
        onChange(multiple ? [...value, remoteUrl] : [remoteUrl]);
      })
      .catch(() => {
        setError(`Échec de l'envoi de "${item.file.name}".`);
        setPending((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: 'error' } : p)),
        );
      });
  }

  function removeImage(url: string): void {
    onChange(value.filter((u) => u !== url));
  }

  function dismissPending(id: string): void {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  const hasImages = value.length > 0 || pending.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>

      {hasImages ? (
        <div className="flex flex-wrap gap-3">
          {value.map((url) => (
            <div key={url} className="relative h-20 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element -- domaine de stockage dynamique */}
              <img
                src={url}
                alt=""
                className="h-full w-full rounded-md border border-neutral-200 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="Retirer cette image"
                className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-0.5 text-neutral-500 shadow hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {pending.map((item) => (
            <div key={item.id} className="relative h-20 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) */}
              <img
                src={item.previewUrl}
                alt=""
                className={`h-full w-full rounded-md border object-cover ${
                  item.status === 'error'
                    ? 'border-red-300 opacity-60'
                    : 'border-neutral-200 opacity-70'
                }`}
              />
              {item.status === 'uploading' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-primary" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => dismissPending(item.id)}
                  aria-label="Retirer cette image"
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-0.5 text-red-600 shadow"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-500 hover:border-primary hover:text-primary">
        {multiple ? '+ Ajouter des photos' : '+ Choisir une image'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
