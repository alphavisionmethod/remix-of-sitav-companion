// ═══════════════════════════════════════════════════════════════
// SITA OS — Data Freshness Badge
// Indicates how recent the displayed data is
// ═══════════════════════════════════════════════════════════════

import { useStaleData, type DataFreshness } from "@/hooks/use-stale-data";
import { Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const FRESHNESS_STYLES: Record<DataFreshness, { color: string; icon: typeof Clock }> = {
  fresh: { color: "text-trust-safe", icon: Clock },
  aging: { color: "text-muted-foreground", icon: Clock },
  stale: { color: "text-amber-400", icon: RefreshCw },
  expired: { color: "text-destructive", icon: AlertTriangle },
};

interface DataFreshnessBadgeProps {
  lastFetchedAt: Date | null | undefined;
  onRefresh?: () => void;
  className?: string;
}

export function DataFreshnessBadge({ lastFetchedAt, onRefresh, className }: DataFreshnessBadgeProps) {
  const { freshness, ageLabel, isFresh } = useStaleData(lastFetchedAt ?? null);
  const style = FRESHNESS_STYLES[freshness];
  const Icon = style.icon;

  if (isFresh) return null;

  return (
    <button
      onClick={onRefresh}
      disabled={!onRefresh}
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors",
        style.color,
        onRefresh && "hover:opacity-80 cursor-pointer",
        !onRefresh && "cursor-default",
        className
      )}
      title={`Data updated ${ageLabel}${onRefresh ? " — click to refresh" : ""}`}
    >
      <Icon className="h-3 w-3" />
      {ageLabel}
    </button>
  );
}
