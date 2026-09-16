'use client';

import { FormEvent, useState } from 'react';
import {
  AgencyPropertyView,
  createProperty,
  CreatePropertyInput,
  updateProperty,
} from '../../lib/properties/agency-api';
import { uploadFiles } from '../../lib/uploads/api';
import { geocodeAddress } from '../../lib/maps/geocode';
import { useGoogleMaps } from '../../lib/maps/useGoogleMaps';
import { AMENITIES_CATALOG, HOUSE_RULES_CATALOG } from '../../lib/properties/constants';
import { TextField } from '../ui/TextField';
import { PrimaryButton } from '../ui/PrimaryButton';
import { ImageUploader } from '../ui/ImageUploader';

interface PropertyFormProps {
  token: string;
  /** Présent = mode édition, absent = mode création. */
  existingProperty?: AgencyPropertyView;
  onSaved: () => void;
  onCancel: () => void;
}

export function PropertyForm({
  token,
  existingProperty,
  onSaved,
  onCancel,
}: PropertyFormProps): React.JSX.Element {
  const isEditing = Boolean(existingProperty);

  const [title, setTitle] = useState(existingProperty?.title ?? '');
  const [description, setDescription] = useState(existingProperty?.description ?? '');
  const [propertyType, setPropertyType] = useState(
    existingProperty?.propertyType ?? 'Appartement',
  );
  const [address, setAddress] = useState(existingProperty?.address ?? '');
  const [city, setCity] = useState(existingProperty?.city ?? '');
  const [pricePerNight, setPricePerNight] = useState(
    existingProperty?.pricePerNight ?? '',
  );
  const [maxGuests, setMaxGuests] = useState(String(existingProperty?.maxGuests ?? 2));
  const [bedrooms, setBedrooms] = useState(String(existingProperty?.bedrooms ?? 1));
  const [bathrooms, setBathrooms] = useState(String(existingProperty?.bathrooms ?? 1));
  const [beds, setBeds] = useState(String(existingProperty?.beds ?? 1));
  const [checkInTime, setCheckInTime] = useState(existingProperty?.checkInTime ?? '15:00');
  const [checkOutTime, setCheckOutTime] = useState(existingProperty?.checkOutTime ?? '10:00');

  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(
    existingProperty?.photos ?? [],
  );
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);

  const [amenities, setAmenities] = useState<string[]>(existingProperty?.amenities ?? []);
  const [houseRules, setHouseRules] = useState<Record<string, boolean>>(
    existingProperty?.houseRules ?? {},
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Charge le script Google Maps dès l'ouverture du formulaire pour que le
  // géocodage soit prêt (voir section géocodage arrière-plan ci-dessous).
  useGoogleMaps();

  function toggleAmenity(amenity: string): void {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
    );
  }

  function toggleHouseRule(rule: string): void {
    setHouseRules((prev) => ({ ...prev, [rule]: !prev[rule] }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Étape 1 : upload effectif des nouvelles photos, déclenché
      // uniquement maintenant (au clic sur "Enregistrer"), pas à la
      // sélection — voir ImageUploader.
      const uploadedUrls =
        newPhotoFiles.length > 0
          ? await uploadFiles(token, newPhotoFiles, 'PROPERTY_PHOTO')
          : [];

      // Étape 2 : payload complet avec les URLs finales.
      const payload: CreatePropertyInput = {
        title,
        description,
        propertyType,
        address,
        city,
        pricePerNight: Number(pricePerNight),
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        beds: Number(beds),
        photos: [...existingPhotoUrls, ...uploadedUrls],
        amenities,
        houseRules,
        checkInTime,
        checkOutTime,
      };

      const saved = isEditing
        ? await updateProperty(token, (existingProperty as AgencyPropertyView).id, payload)
        : await createProperty(token, payload);

      onSaved();

      // Géocodage en arrière-plan, best-effort — ne bloque jamais
      // l'enregistrement (voir lib/maps/geocode.ts).
      if (!isEditing || address !== existingProperty?.address || city !== existingProperty?.city) {
        geocodeAddress(`${address}, ${city}, Cameroun`)
          .then((geocoded) => {
            if (geocoded) {
              void updateProperty(token, saved.id, {
                latitude: geocoded.latitude,
                longitude: geocoded.longitude,
              });
            }
          })
          .catch(() => {
            // Silencieux : le bien reste publiable sans coordonnées.
          });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Impossible ${isEditing ? 'de mettre à jour' : 'de créer'} ce bien.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <TextField id="prop-title" label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />

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
        <TextField id="prop-type" label="Type de bien" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} required />
        <TextField id="prop-city" label="Ville" value={city} onChange={(e) => setCity(e.target.value)} required />
      </div>

      <TextField id="prop-address" label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} required />

      <div className="grid grid-cols-4 gap-3">
        <TextField id="prop-price" label="Prix / nuit (XAF)" type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required />
        <TextField id="prop-guests" label="Invités max" type="number" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} />
        <TextField id="prop-bedrooms" label="Chambres" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
        <TextField id="prop-bathrooms" label="Salles de bain" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
      </div>
      <TextField id="prop-beds" label="Nombre de lits" type="number" value={beds} onChange={(e) => setBeds(e.target.value)} />

      <ImageUploader
        label="Photos du bien"
        multiple
        existingUrls={existingPhotoUrls}
        onExistingUrlsChange={setExistingPhotoUrls}
        files={newPhotoFiles}
        onFilesChange={setNewPhotoFiles}
      />

      <div>
        <span className="text-sm font-medium text-ink">Équipements</span>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES_CATALOG.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-ink">Politique de séjour</span>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <TextField
            id="prop-checkin"
            label="Heure d'arrivée"
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
          />
          <TextField
            id="prop-checkout"
            label="Heure de départ"
            type="time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {HOUSE_RULES_CATALOG.map((rule) => (
            <label key={rule} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={Boolean(houseRules[rule])}
                onChange={() => toggleHouseRule(rule)}
              />
              {rule}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          La politique d&apos;annulation est définie globalement par Behouse et
          s&apos;applique automatiquement à tous les biens.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-3">
        <PrimaryButton type="submit" loading={loading}>
          {isEditing ? 'Enregistrer les modifications' : 'Créer le bien'}
        </PrimaryButton>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-ink hover:bg-neutral-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
