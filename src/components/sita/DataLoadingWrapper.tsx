import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";
import { LucideIcon } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

interface DataLoadingWrapperProps {
  isLoading: boolean;
  isEmpty: boolean;
  isDemoMode: boolean;
  children: ReactNode;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonCount?: number;
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

  if (!isDemoMode && isEmpty) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>;
}
