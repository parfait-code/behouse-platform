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

export function ImageUploader({
  token,
  purpose,
  value,
  onChange,
  multiple = false,
  label,
}: ImageUploaderProps): React.JSX.Element {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    event.target.value = ''; // permet de re-sélectionner le même fichier

    setError(null);
    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map((file) => uploadFile(token, file, purpose)),
      );
      onChange(multiple ? [...value, ...uploadedUrls] : uploadedUrls.slice(0, 1));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'envoi de l'image.",
      );
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string): void {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>

      {value.length > 0 ? (
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
        </div>
      ) : null}

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-500 hover:border-primary hover:text-primary">
        {uploading ? 'Envoi en cours…' : multiple ? '+ Ajouter des photos' : '+ Choisir une image'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
