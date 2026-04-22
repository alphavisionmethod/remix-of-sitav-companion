// ═══════════════════════════════════════════════════════════════
// SITA OS — Frontend Polish Closure
// BoardSection — canonical state-handling wrapper for every
// Admin AI Engineer hub board (loading / empty / error / content).
//
// Composes ONLY existing primitives:
//   - shadcn Card / CardHeader / CardTitle / CardContent
//   - canonical EmptyState  (src/components/primitives/feedback/EmptyState)
//   - canonical Skeleton    (src/components/primitives/feedback/Skeleton)
//
// Replaces every raw `<p className="text-xs text-muted-foreground">No …</p>`
// pattern with trust-grade, operator-facing state communication.
// ═══════════════════════════════════════════════════════════════
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/sita/EmptyState";
import { Skeleton } from "@/components/primitives/feedback/Skeleton";
import { AlertTriangle, RefreshCw } from "lucide-react";

export interface BoardSectionProps {
  /** Card title (required for trust polish — no title-less sections). */
  title: ReactNode;
  /** Optional inline icon shown to the left of the title. */
  icon?: ReactNode;
  /** Optional right-aligned header slot (e.g. Refresh button). */
  headerAction?: ReactNode;
  /** True while initial data is loading. Renders 3-row Skeleton. */
  loading?: boolean;
  /** Truthy when the data fetch failed — renders inline error + retry. */
  error?: { message: string } | string | null;
  /** Optional retry callback rendered inside the error state. */
  onRetry?: () => void;
  /** True when the fetch succeeded but returned zero rows. */
  isEmpty?: boolean;
  /** Empty-state title (operator-grade, not "No data"). */
  emptyTitle?: string;
  /** Empty-state description with the truthful reason + next step. */
  emptyDescription?: string;
  /** Optional EmptyState icon. */
  emptyIcon?: ReactNode;
  /** Optional CTA inside the EmptyState (e.g. drilldown link). */
  emptyAction?: ReactNode;
  /** Optional className passthrough for the outer Card. */
  className?: string;
  /** Body content rendered when not loading / error / empty. */
  children: ReactNode;
}

export function BoardSection({
  title,
  icon,
  headerAction,
  loading,
  error,
  onRetry,
  isEmpty,
  emptyTitle = "Nothing to show yet",
  emptyDescription,
  emptyIcon,
  emptyAction,
  className,
  children,
}: BoardSectionProps) {
  const errorMessage =
    typeof error === "string" ? error : error?.message ?? null;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs"
          >
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-destructive">
                Could not load this section
              </div>
              <div className="mt-0.5 text-muted-foreground break-words">
                {errorMessage}
              </div>
            </div>
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="h-7 px-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            )}
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export default BoardSection;
