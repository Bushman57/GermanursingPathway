export function ScholarshipsGridSkeleton() {
  return (
    <>
      <div className="h-5 w-36 rounded bg-muted animate-pulse mb-6" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-5 space-y-4 animate-pulse"
          >
            <div className="h-5 w-4/5 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-5 w-20 rounded-full bg-muted" />
              <div className="h-5 w-24 rounded-full bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
            <div className="pt-4 border-t border-border flex justify-between gap-3">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
