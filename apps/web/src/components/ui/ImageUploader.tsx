'use client';

import { ChangeEvent, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

interface ImageUploaderProps {
  existingUrls: string[];
  onExistingUrlsChange: (urls: string[]) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  label: string;
}

/**
 * Composant de SÉLECTION uniquement — aucun appel réseau ici. Les
 * fichiers choisis restent de simples `File` en mémoire (avec aperçu
 * local via URL.createObjectURL) jusqu'à ce que le formulaire parent les
 * envoie explicitement au clic sur son bouton de soumission (voir
 * PropertyForm / ProfileTab) : ça permet à l'utilisateur de changer
 * d'avis sur sa sélection sans avoir déjà consommé de bande passante ni
 * pollué le stockage de fichiers orphelins.
 */
export function ImageUploader({
  existingUrls,
  onExistingUrlsChange,
  files,
  onFilesChange,
  multiple = false,
  label,
}: ImageUploaderProps): React.JSX.Element {
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  // Libère les URLs objet quand elles ne sont plus affichées (changement
  // de sélection ou démontage du composant).
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>): void {
    const selected = event.target.files;
    if (!selected || selected.length === 0) return;

    // Extraire AVANT de réinitialiser l'input (FileList est une
    // référence live — la vider avant lecture effacerait la sélection).
    const newFiles = Array.from(selected);
    event.target.value = '';

    onFilesChange(multiple ? [...files, ...newFiles] : newFiles.slice(0, 1));
  }

  function removeExisting(url: string): void {
    onExistingUrlsChange(existingUrls.filter((u) => u !== url));
  }

  function removeStaged(file: File): void {
    onFilesChange(files.filter((f) => f !== file));
  }

  const hasImages = existingUrls.length > 0 || previews.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>

      {hasImages ? (
        <div className="flex flex-wrap gap-3">
          {existingUrls.map((url) => (
            <Thumbnail key={url} src={url} onRemove={() => removeExisting(url)} />
          ))}
          {previews.map(({ file, url }) => (
            <Thumbnail
              key={url}
              src={url}
              pending
              onRemove={() => removeStaged(file)}
            />
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

      {previews.length > 0 ? (
        <p className="text-xs text-neutral-400">
          {previews.length} image{previews.length > 1 ? 's' : ''} sera
          {previews.length > 1 ? 'ont' : ''} envoyée
          {previews.length > 1 ? 's' : ''} à l&apos;enregistrement.
        </p>
      ) : null}
    </div>
  );
}

function Thumbnail({
  src,
  onRemove,
  pending = false,
}: {
  src: string;
  onRemove: () => void;
  pending?: boolean;
}): React.JSX.Element {
  return (
    <div className="relative h-20 w-20">
      {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local ou domaine de stockage dynamique */}
      <img
        src={src}
        alt=""
        className={`h-full w-full rounded-md border object-cover ${
          pending ? 'border-primary/40' : 'border-neutral-200'
        }`}
      />
      {pending ? (
        <span className="absolute bottom-0.5 left-0.5 rounded bg-primary/90 px-1 text-[10px] font-medium text-white">
          nouveau
        </span>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer cette image"
        className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-0.5 text-neutral-500 shadow hover:text-red-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}
