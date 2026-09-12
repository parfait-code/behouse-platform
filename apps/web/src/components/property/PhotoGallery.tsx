'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps): React.JSX.Element {
  const [showAll, setShowAll] = useState(false);

  if (photos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
        Aucune photo disponible pour ce bien.
      </div>
    );
  }

  const [main, ...rest] = photos;
  const smallPhotos = rest.slice(0, 4);

  return (
    <>
      <div className="relative grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2">
        <div className="relative md:col-span-2 md:row-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- domaine de stockage dynamique par agence, cf. PropertyCard.tsx */}
          <img
            src={main}
            alt={title}
            className="h-64 w-full rounded-lg object-cover md:h-full"
          />
        </div>
        {smallPhotos.map((photo, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo}
            src={photo}
            alt={`${title} - photo ${index + 2}`}
            className="hidden h-full w-full rounded-lg object-cover md:block"
          />
        ))}
        {photos.length > 5 ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="absolute bottom-3 right-3 hidden rounded-md bg-white px-3 py-1.5 text-xs font-medium text-ink shadow md:block"
          >
            Voir toutes les photos
          </button>
        ) : null}
      </div>

      {showAll ? (
        <Modal title="Toutes les photos" onClose={() => setShowAll(false)}>
          <div className="flex flex-col gap-3">
            {photos.map((photo, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo}
                src={photo}
                alt={`${title} - photo ${index + 1}`}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
