export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Page introuvable</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-500">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <a
        href="/"
        className="mt-6 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Retour à l&apos;accueil
      </a>
    </div>
  );
}
