export default function PropertyLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-cream">
      <div className="h-14 border-b border-neutral-200 bg-white" />
      <div className="mx-auto max-w-6xl animate-pulse px-6 py-6">
        <div className="h-80 rounded-lg bg-neutral-200" />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-7 w-2/3 rounded bg-neutral-200" />
            <div className="mt-3 h-4 w-1/2 rounded bg-neutral-200" />
            <div className="mt-8 h-24 rounded bg-neutral-200" />
          </div>
          <div className="h-64 rounded-lg bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
