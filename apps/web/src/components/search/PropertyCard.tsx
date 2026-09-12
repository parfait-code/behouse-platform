import { PublicPropertyListItem } from '../../lib/properties/types';

interface PropertyCardProps {
  property: PublicPropertyListItem;
}

export function PropertyCard({ property }: PropertyCardProps): React.JSX.Element {
  const firstPhoto = property.photos[0];

  return (
    <a
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        {firstPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- photos hébergées sur un domaine dynamique (Neon Storage par agence), next/image sera reconfiguré une fois le domaine de stockage définitif connu.
          <img
            src={firstPhoto}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Photo à venir
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-sm font-semibold text-ink shadow">
          {formatPrice(property.pricePerNight)}{' '}
          <span className="font-normal text-neutral-500">/ nuit</span>
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-ink">
            {property.title}
          </h3>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{property.city}</p>
        <p className="mt-2 text-xs text-neutral-500">
          {property.bedrooms} chambre{property.bedrooms > 1 ? 's' : ''} •{' '}
          {property.bathrooms} salle{property.bathrooms > 1 ? 's' : ''} de bain •
          Jusqu&apos;à {property.maxGuests} invité
          {property.maxGuests > 1 ? 's' : ''}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
          {property.agency.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.agency.logoUrl}
              alt={property.agency.name}
              className="h-4 w-4 rounded-full object-cover"
            />
          ) : null}
          Proposé par {property.agency.name}
        </div>
      </div>
    </a>
  );
}

function formatPrice(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
}
