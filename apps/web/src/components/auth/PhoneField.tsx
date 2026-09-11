'use client';

import PhoneInput, { Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id?: string;
}

/**
 * `defaultCountry="CM"` : le Cameroun est le marché de lancement de Behouse
 * (voir décision produit). L'utilisateur peut changer d'indicatif via le
 * sélecteur de drapeau si besoin.
 */
export function PhoneField({
  label,
  value,
  onChange,
  id = 'phone',
}: PhoneFieldProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <PhoneInput
        id={id}
        international
        defaultCountry="CM"
        countryCallingCodeEditable={false}
        value={value as Value | undefined}
        onChange={onChange}
        placeholder="Saisissez votre numéro"
        className="behouse-phone-input"
      />
    </div>
  );
}
