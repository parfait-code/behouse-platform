import { ButtonHTMLAttributes } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function PrimaryButton({
  children,
  loading = false,
  disabled,
  ...buttonProps
}: PrimaryButtonProps): React.JSX.Element {
  return (
    <button
      className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled ?? loading}
      {...buttonProps}
    >
      {loading ? 'Chargement…' : children}
    </button>
  );
}
