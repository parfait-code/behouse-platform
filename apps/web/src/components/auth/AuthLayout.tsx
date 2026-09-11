import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Reprend la structure "écran scindé" des maquettes de référence (The Flex) :
 * visuel + témoignage à gauche (masqué sur mobile), formulaire à droite.
 *
 * Le panneau gauche utilise un dégradé de substitution plutôt qu'une photo —
 * à remplacer par une vraie photo de bien meublé Behouse une fois disponible
 * (ne pas réutiliser de photo issue des maquettes The Flex, protégée).
 */
export function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary via-primary-dark to-neutral-900 p-10 text-white md:flex">
        <a href="/" className="flex items-center gap-2 text-lg tracking-wide">
          <HouseIcon />
          <span>behouse</span>
        </a>
        <blockquote className="max-w-md">
          <p className="text-lg leading-relaxed">
            « Nous avons trouvé notre appartement meublé à Yaoundé en
            quelques minutes, réservé et payé directement en Mobile Money.
            Simple et rassurant. »
          </p>
          <footer className="mt-4 text-sm text-white/70">— Aïcha</footer>
        </blockquote>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-cream px-6 py-12 md:w-1/2">
        <div className="w-full max-w-md">
          <a
            href="/"
            className="mb-8 flex items-center gap-2 text-lg text-ink md:hidden"
          >
            <HouseIcon />
            <span>behouse</span>
          </a>
          {children}
        </div>
      </div>
    </div>
  );
}

function HouseIcon(): React.JSX.Element {
  return (
    <svg
      width="22"
      height="22"
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
