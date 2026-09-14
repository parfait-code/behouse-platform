'use client';

import { useState } from 'react';
import { PublicHeader } from '../layout/PublicHeader';
import { PhotoGallery } from './PhotoGallery';
import { AmenitiesModal } from './AmenitiesModal';
import { BookingSidebar } from './BookingSidebar';
import { LocationMap } from '../maps/LocationMap';
import { PublicPropertyDetail } from '../../lib/properties/types';

interface PropertyDetailViewProps {
  property: PublicPropertyDetail;
}

const AMENITY_PREVIEW_COUNT = 8;

export function PropertyDetailView({
  property,
}: PropertyDetailViewProps): React.JSX.Element {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const previewAmenities = property.amenities.slice(0, AMENITY_PREVIEW_COUNT);
  const description = property.description;
  const isLongDescription = description.length > 220;
  const displayedDescription =
    descriptionExpanded || !isLongDescription
      ? description
      : `${description.slice(0, 220)}…`;

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-6 py-6">
        <PhotoGallery photos={property.photos} title={property.title} />

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-ink">{property.title}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {property.maxGuests} invités • {property.bedrooms} chambre
              {property.bedrooms > 1 ? 's' : ''} • {property.bathrooms} salle
              {property.bathrooms > 1 ? 's' : ''} de bain • {property.beds} lit
              {property.beds > 1 ? 's' : ''}
            </p>

            <a
              href={`/agences/${property.agency.id}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary"
            >
              {property.agency.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.agency.logoUrl}
                  alt={property.agency.name}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : null}
              Proposé par {property.agency.name}
            </a>

            <hr className="my-6 border-neutral-200" />

            <section>
              <h2 className="text-lg font-semibold text-ink">
                À propos de cette propriété
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {displayedDescription}
              </p>
              {isLongDescription ? (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((v) => !v)}
                  className="mt-1 text-sm font-medium text-primary underline"
                >
                  {descriptionExpanded ? 'Voir moins' : 'Lire plus'}
                </button>
              ) : null}
            </section>

            <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Équipements</h2>
                {property.amenities.length > AMENITY_PREVIEW_COUNT ? (
                  <button
                    type="button"
                    onClick={() => setShowAllAmenities(true)}
                    className="text-sm font-medium text-primary underline"
                  >
                    Voir tous les équipements →
                  </button>
                ) : null}
              </div>
              {property.amenities.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-500">
                  Aucun équipement renseigné pour ce bien.
                </p>
              ) : (
                <ul className="mt-3 grid grid-cols-2 gap-y-2 text-sm text-ink sm:grid-cols-3">
                  {previewAmenities.map((amenity) => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-ink">
                Politiques de séjour
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-4 rounded-md bg-neutral-50 p-4 text-sm">
                <div>
                  <p className="text-neutral-500">Heure d&apos;arrivée</p>
                  <p className="font-medium text-ink">
                    {property.checkInTime ?? 'Non précisée'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Heure de départ</p>
                  <p className="font-medium text-ink">
                    {property.checkOutTime ?? 'Non précisée'}
                  </p>
                </div>
              </div>

              {property.houseRules ? (
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(property.houseRules)
                    .filter(([, value]) => value)
                    .map(([rule]) => (
                      <div
                        key={rule}
                        className="rounded-md bg-neutral-50 px-3 py-2 text-neutral-700"
                      >
                        {rule}
                      </div>
                    ))}
                </div>
              ) : null}

              <div className="mt-4 rounded-md bg-neutral-50 p-4 text-sm text-neutral-600">
                <p className="font-medium text-ink">
                  Politique d&apos;annulation
                </p>
                {property.cancellationPolicyOverride ? (
                  <p className="mt-1">
                    Ce bien applique une politique d&apos;annulation
                    spécifique — les détails vous seront communiqués avant
                    confirmation.
                  </p>
                ) : (
                  <>
                    <p className="mt-1">
                      Séjours de moins de 28 jours : remboursement complet
                      jusqu&apos;à 14 jours avant l&apos;arrivée.
                    </p>
                    <p className="mt-1">
                      Séjours de 28 jours ou plus : remboursement complet
                      jusqu&apos;à 30 jours avant l&apos;arrivée.
                    </p>
                  </>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-lg font-semibold text-ink">Emplacement</h2>
              <p className="mt-2 text-sm text-neutral-500">{property.address}, {property.city}</p>
              <div className="mt-3">
                {property.latitude && property.longitude ? (
                  <LocationMap
                    latitude={Number(property.latitude)}
                    longitude={Number(property.longitude)}
                    label={property.title}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
                    Localisation non renseignée pour ce bien.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div>
            <BookingSidebar
              propertyId={property.id}
              pricePerNight={property.pricePerNight}
            />
          </div>
        </div>
      </div>

      {showAllAmenities ? (
        <AmenitiesModal
          amenities={property.amenities}
          onClose={() => setShowAllAmenities(false)}
        />
      ) : null}
    </div>
  );
}
