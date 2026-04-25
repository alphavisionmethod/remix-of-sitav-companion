/**
 * Premium page-level skeleton loader.
 * Use instead of plain spinners for a polished loading state.
 */
export const PageSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading page content">
    {/* Header skeleton */}
    <div className="space-y-2">
      <div className="skeleton-premium h-8 w-48 rounded" />
      <div className="skeleton-premium h-4 w-72 rounded" />
    </div>
    {/* KPI row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-premium h-24 rounded-xl" />
      ))}
    </div>
    {/* Content rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton-premium h-32 rounded-xl" />
    ))}
  </div>
);

/**
 * Section-level skeleton for cards or panels.
 */
export const SectionSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`skeleton-premium h-4 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);
