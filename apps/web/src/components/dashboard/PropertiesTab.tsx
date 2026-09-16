'use client';

import { useEffect, useState } from 'react';
import {
  AgencyPropertyView,
  listMyProperties,
  publishProperty,
  unpublishProperty,
} from '../../lib/properties/agency-api';
import { PropertyForm } from './PropertyForm';

interface PropertiesTabProps {
  token: string;
}

const STATUS_LABELS: Record<AgencyPropertyView['status'], string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  UNPUBLISHED: 'Dépublié',
};

type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; property: AgencyPropertyView };

export function PropertiesTab({ token }: PropertiesTabProps): React.JSX.Element {
  const [properties, setProperties] = useState<AgencyPropertyView[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [actionError, setActionError] = useState<string | null>(null);

  function refresh(): void {
    setLoading(true);
    listMyProperties(token)
      .then(setProperties)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [token]);

  async function handleTogglePublish(property: AgencyPropertyView): Promise<void> {
    setActionError(null);
    try {
      if (property.status === 'PUBLISHED') {
        await unpublishProperty(token, property.id);
      } else {
        await publishProperty(token, property.id);
      }
      refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Action impossible.',
      );
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">Mes biens</h2>
        <button
          type="button"
          onClick={() =>
            setFormState((s) => (s.mode === 'create' ? { mode: 'closed' } : { mode: 'create' }))
          }
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {formState.mode === 'create' ? 'Annuler' : '+ Ajouter un bien'}
        </button>
      </div>

      {formState.mode === 'create' ? (
        <PropertyForm
          token={token}
          onSaved={() => {
            setFormState({ mode: 'closed' });
            refresh();
          }}
          onCancel={() => setFormState({ mode: 'closed' })}
        />
      ) : null}

      {formState.mode === 'edit' ? (
        <PropertyForm
          token={token}
          existingProperty={formState.property}
          onSaved={() => {
            setFormState({ mode: 'closed' });
            refresh();
          }}
          onCancel={() => setFormState({ mode: 'closed' })}
        />
      ) : null}

      {actionError ? (
        <p className="mt-3 text-sm text-red-600">{actionError}</p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Chargement…</p>
      ) : properties.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Vous n&apos;avez pas encore ajouté de bien.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {properties.map((property) => (
            <li
              key={property.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="text-sm font-medium text-ink">{property.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {property.city} • {property.pricePerNight} XAF / nuit •{' '}
                  {STATUS_LABELS[property.status]}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormState({ mode: 'edit', property })}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(property)}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
                >
                  {property.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
