// ═══════════════════════════════════════════════════════════════
// SITA OS — PageDataShell
// Canonical shell for pages backed by usePageData.
// Handles loading → error (with retry) → empty → ready.
// ═══════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { type LucideIcon, Database } from "lucide-react";
import { PageShell, type PageWidth } from "@/components/sita/PageShell";
import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { PageErrorState } from "@/components/sita/PageErrorState";
import { EmptyState } from "@/components/sita/EmptyState";
import type { PageDataResult } from "@/hooks/usePageData";

interface PageDataShellProps<T> {
  /** Result from usePageData hook */
  query: PageDataResult<T>;
  /** Page width override */
  width?: PageWidth;
  /** Render when data is ready */
  children: (data: T) => ReactNode;

  // ── Empty state overrides ──
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;

  // ── Error state overrides ──
  errorContext?: string;

  // ── Loading state overrides ──
  skeletonRows?: number;

  /** Extra content rendered above the state shell (e.g. page header) */
  header?: ReactNode;

  className?: string;
}

export function PageDataShell<T>({
  query,
  width = "wide",
  children,
  emptyIcon = Database,
  emptyTitle = "No data yet",
  emptyDescription = "Data will appear here once available.",
  errorContext,
  skeletonRows = 3,
  header,
  className,
}: PageDataShellProps<T>) {
  return (
    <PageShell width={width} className={className}>
      {header}

      {query.state === "loading" && <PageSkeleton rows={skeletonRows} />}

      {query.state === "error" && (
        <PageErrorState
          onRetry={query.refetch}
          context={errorContext}
          variant={
            query.error?.message?.toLowerCase().includes("network") ||
            query.error?.message?.toLowerCase().includes("fetch")
              ? "network"
              : "generic"
          }
        />
      )}

      {query.state === "empty" && (
        <EmptyState
          variant="contextual"
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}

      {query.state === "ready" && children(query.data)}
    </PageShell>
  );
}