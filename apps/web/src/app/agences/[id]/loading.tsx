export default function AgencyLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-cream">
      <div className="h-14 border-b border-neutral-200 bg-white" />
      <div className="mx-auto max-w-6xl animate-pulse px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-neutral-200" />
          <div className="h-6 w-48 rounded bg-neutral-200" />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
