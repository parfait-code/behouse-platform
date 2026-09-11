/**
 * Page d'accueil Behouse.
 *
 * Rappel fonctionnel (Behouse_Cahier_Des_Charges_Fonctionnel.md, section 6.1) :
 * cette page EST la page de recherche/listing — il n'y a pas de page vitrine
 * séparée. La barre de recherche + la liste/carte des biens seront implémentées
 * dans l'epic E4 (voir Behouse_Documentation_Technique_et_Planning.md, 7.1).
 *
 * Ce fichier est un point de départ volontairement minimal pour valider que
 * le projet démarre correctement (build, déploiement Vercel).
 */
export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold">Behouse</h1>
      <p className="mt-2 text-neutral-600">
        Plateforme de location de biens meublés — multi-agences.
      </p>
      <p className="mt-8 text-sm text-neutral-400">
        Page de recherche à implémenter (epic E4).
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <a href="/auth/login" className="underline">
          Se connecter
        </a>
        <a href="/auth/register" className="underline">
          S&apos;inscrire
        </a>
      </div>
    </main>
  );
}
