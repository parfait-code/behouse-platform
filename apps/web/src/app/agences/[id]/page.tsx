import { notFound } from 'next/navigation';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PropertyCard } from '../../../components/search/PropertyCard';
import { getAgencyPublicProfile } from '../../../lib/agencies/api';

interface AgencyPageProps {
  params: { id: string };
}

export default async function AgencyPage({
  params,
}: AgencyPageProps): Promise<React.JSX.Element> {
  let agency;
  try {
    agency = await getAgencyPublicProfile(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center gap-4">
          {agency.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agency.logoUrl}
              alt={agency.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {agency.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-ink">{agency.name}</h1>
            {agency.description ? (
              <p className="mt-1 text-sm text-neutral-500">
                {agency.description}
              </p>
            ) : null}
          </div>
        </div>

        {agency.aboutPageContent ? (
          <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-neutral-600">
            {agency.aboutPageContent}
          </p>
        ) : null}

        <h2 className="mt-10 text-lg font-semibold text-ink">
          Biens proposés par {agency.name}
        </h2>

        {agency.properties.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            Cette agence n&apos;a pas encore de bien publié.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agency.properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={{
                  ...property,
                  agency: {
                    id: agency.id,
                    name: agency.name,
                    logoUrl: agency.logoUrl,
                  },
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
