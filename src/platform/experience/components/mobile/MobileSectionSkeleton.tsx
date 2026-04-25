// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Section Loading Skeletons
// Per-section shimmer skeletons for MobileHome, MobileMoney, MobileConcierge.
// ═══════════════════════════════════════════════════════════════

import { Skeleton } from "@/components/ui/skeleton";

/** 2x3 grid of pulse metric cards */
export function PulseGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4 animate-in fade-in-50 duration-200">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl border border-border/20 bg-card/50 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-2 w-10" />
        </div>
      ))}
    </div>
  );
}

/** Quick-action list skeleton */
export function QuickActionsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-1.5 animate-in fade-in-50 duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-card">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Activity feed skeleton */
export function ActivityFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2 animate-in fade-in-50 duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/20 bg-card/50">
          <Skeleton className="h-1.5 w-1.5 rounded-full mt-1.5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Safe-to-spend hero card skeleton */
export function SafeToSpendSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-4 flex flex-col items-center gap-2 animate-in fade-in-50 duration-200">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-2 w-40" />
    </div>
  );
}

/** Account list skeleton */
export function AccountListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1.5 mb-4 animate-in fade-in-50 duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-3 rounded-xl border border-border/40 bg-card">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-2 w-28" />
          </div>
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Transaction list skeleton */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 animate-in fade-in-50 duration-200">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/20 bg-card/50">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2 w-1/4" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

/** Concierge section skeleton */
export function ConciergeSectionSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {Array.from({ length: sections }).map((_, s) => (
        <div key={s}>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border/20 bg-card/50">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2 w-1/2" />
                </div>
                <Skeleton className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}