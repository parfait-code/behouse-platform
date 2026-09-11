import { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({
  label,
  id,
  ...inputProps
}: TextFieldProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        {...inputProps}
      />
    </div>
  );
}
