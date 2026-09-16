export function PropertyCardSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="aspect-[4/3] w-full bg-neutral-200" />
      <div className="p-4">
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200" />
        <div className="mt-3 h-3 w-2/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
