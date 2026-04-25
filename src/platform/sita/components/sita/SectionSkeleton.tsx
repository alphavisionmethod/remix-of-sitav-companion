import { Skeleton } from "@/components/ui/skeleton";

interface SectionSkeletonProps {
  cards?: number;
  columns?: number;
}

export const SectionSkeleton = ({ cards = 3, columns = 3 }: SectionSkeletonProps) => (
  <div className="space-y-3">
    <Skeleton className="h-5 w-48" />
    <Skeleton className="h-3 w-72" />
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-${columns}`}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface KPISkeletonProps {
  count?: number;
}

export const KPISkeleton = ({ count = 4 }: KPISkeletonProps) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-6 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);
