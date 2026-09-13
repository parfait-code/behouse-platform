'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  AgencyPropertyView,
  createProperty,
  listMyProperties,
  publishProperty,
  unpublishProperty,
} from '../../lib/properties/agency-api';
import { TextField } from '../ui/TextField';
import { PrimaryButton } from '../ui/PrimaryButton';

interface PropertiesTabProps {
  token: string;
}

const STATUS_LABELS: Record<AgencyPropertyView['status'], string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  UNPUBLISHED: 'Dépublié',
};

export function PropertiesTab({ token }: PropertiesTabProps): React.JSX.Element {
  const [properties, setProperties] = useState<AgencyPropertyView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Mes biens</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {showForm ? 'Annuler' : '+ Ajouter un bien'}
        </button>
      </div>

      {showForm ? (
        <CreatePropertyForm
          token={token}
          onCreated={() => {
            setShowForm(false);
            refresh();
          }}
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
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="text-sm font-medium text-ink">{property.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {property.city} • {property.pricePerNight} XAF / nuit •{' '}
                  {STATUS_LABELS[property.status]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePublish(property)}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
              >
                {property.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CreatePropertyForm({
  token,
  onCreated,
}: {
  token: string;
  onCreated: () => void;
}): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('Appartement');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [maxGuests, setMaxGuests] = useState('2');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [photosInput, setPhotosInput] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createProperty(token, {
        title,
        description,
        propertyType,
        address,
        city,
        pricePerNight: Number(pricePerNight),
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        photos: photosInput
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
        amenities: amenitiesInput
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de créer ce bien.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <TextField
        id="prop-title"
        label="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="prop-type"
          label="Type de bien"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          required
        />
        <TextField
          id="prop-city"
          label="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </div>
      <TextField
        id="prop-address"
        label="Adresse"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <div className="grid grid-cols-4 gap-3">
        <TextField
          id="prop-price"
          label="Prix / nuit (XAF)"
          type="number"
          value={pricePerNight}
          onChange={(e) => setPricePerNight(e.target.value)}
          required
        />
        <TextField
          id="prop-guests"
          label="Invités max"
          type="number"
          value={maxGuests}
          onChange={(e) => setMaxGuests(e.target.value)}
        />
        <TextField
          id="prop-bedrooms"
          label="Chambres"
          type="number"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
        />
        <TextField
          id="prop-bathrooms"
          label="Salles de bain"
          type="number"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
        />
      </div>
      <TextField
        id="prop-photos"
        label="Photos (URLs séparées par une virgule)"
        placeholder="https://.../photo1.jpg, https://.../photo2.jpg"
        value={photosInput}
        onChange={(e) => setPhotosInput(e.target.value)}
      />
      <TextField
        id="prop-amenities"
        label="Équipements (séparés par une virgule)"
        placeholder="Wifi, Parking, Climatisation"
        value={amenitiesInput}
        onChange={(e) => setAmenitiesInput(e.target.value)}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <PrimaryButton type="submit" loading={loading}>
        Créer le bien
      </PrimaryButton>
    </form>
  );
}
