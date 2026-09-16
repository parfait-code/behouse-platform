import { clearToken } from '../../lib/auth/token-storage';

interface DashboardHeaderProps {
  agencyName: string;
  adminName: string;
}

export function DashboardHeader({
  agencyName,
  adminName,
}: DashboardHeaderProps): React.JSX.Element {
  function handleLogout(): void {
    clearToken();
    window.location.href = '/';
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2 text-lg text-ink">
        <span className="font-semibold">{agencyName}</span>
        <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary sm:inline">
          Dashboard agence
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-neutral-600">
        <span className="hidden sm:inline">{adminName}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-neutral-300 px-4 py-1.5 hover:border-primary hover:text-primary"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
