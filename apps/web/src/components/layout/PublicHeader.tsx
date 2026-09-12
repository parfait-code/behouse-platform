export function PublicHeader(): React.JSX.Element {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
      <a href="/" className="flex items-center gap-2 text-lg text-ink">
        <HouseIcon />
        <span>behouse</span>
      </a>
      <nav className="flex items-center gap-4 text-sm text-neutral-600">
        <a href="/auth/register" className="hover:text-ink">
          Rejoindre en tant qu&apos;agence
        </a>
        <a
          href="/auth/login"
          className="rounded-md border border-neutral-300 px-4 py-1.5 hover:border-primary hover:text-primary"
        >
          Connexion
        </a>
      </nav>
    </header>
  );
}

function HouseIcon(): React.JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
