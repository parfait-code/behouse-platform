export type AuthMethodTab = 'phone' | 'email';

interface MethodTabsProps {
  value: AuthMethodTab;
  onChange: (value: AuthMethodTab) => void;
}

/**
 * "Téléphone" est volontairement le premier onglet et la valeur par défaut :
 * le marché de lancement (Cameroun) est très majoritairement mobile,
 * l'email restant surtout utilisé par les professionnels de grandes
 * structures (voir décision produit).
 */
export function MethodTabs({
  value,
  onChange,
}: MethodTabsProps): React.JSX.Element {
  return (
    <div className="flex rounded-md border border-neutral-300 bg-white p-1 text-sm">
      <TabButton
        active={value === 'phone'}
        onClick={() => onChange('phone')}
      >
        Téléphone
      </TabButton>
      <TabButton
        active={value === 'email'}
        onClick={() => onChange('email')}
      >
        Email
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-[5px] py-2 font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'text-neutral-500 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
