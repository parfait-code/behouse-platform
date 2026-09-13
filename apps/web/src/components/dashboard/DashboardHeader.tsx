import { clearToken } from '../../lib/auth/token-storage';

interface DashboardHeaderProps {
  agencyAdminName: string;
}

export function DashboardHeader({
  agencyAdminName,
}: DashboardHeaderProps): React.JSX.Element {
  function handleLogout(): void {
    clearToken();
    window.location.href = '/';
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
      <div className="flex items-center gap-2 text-lg text-ink">
        <span>behouse</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Dashboard agence
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-neutral-600">
        <span>{agencyAdminName}</span>
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
