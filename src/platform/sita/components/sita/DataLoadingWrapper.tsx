import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";
import { PageErrorState } from "./PageErrorState";
import { LucideIcon } from "lucide-react";

interface DataLoadingWrapperProps {
  isLoading: boolean;
  isEmpty: boolean;
  isDemoMode: boolean;
  children: ReactNode;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonCount?: number;
  /** Pass `true` when the underlying query errored */
  isError?: boolean;
  /** Called when user clicks "Retry" in the error state */
  onRetry?: () => void;
  /** Context label shown in error state (e.g. "connectors") */
  errorContext?: string;
}

export function DataLoadingWrapper({
  isLoading,
  isEmpty,
  isDemoMode,
  children,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  skeletonCount = 3,
  isError = false,
  onRetry,
  errorContext,
}: DataLoadingWrapperProps) {
  if (!isDemoMode && isLoading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!isDemoMode && isError) {
    return <PageErrorState onRetry={onRetry} context={errorContext} />;
  }

  if (!isDemoMode && isEmpty) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>;
}
