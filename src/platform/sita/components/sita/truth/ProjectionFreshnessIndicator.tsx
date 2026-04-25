import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  domain: string;
  lastMaterialized: string | null;
  thresholdMs: number;
  eventLag?: number;
  rebuildAvailable?: boolean;
  className?: string;
}

export function ProjectionFreshnessIndicator({ domain, lastMaterialized, thresholdMs, eventLag, rebuildAvailable, className }: Props) {
  const age = lastMaterialized ? Date.now() - new Date(lastMaterialized).getTime() : Infinity;
  const pct = Math.min(100, (age / thresholdMs) * 100);
  const status = pct < 50 ? "fresh" : pct < 100 ? "aging" : pct < 200 ? "stale" : "degraded";
  const colors = { fresh: "text-green-400", aging: "text-blue-400", stale: "text-amber-400", degraded: "text-red-400" };
  const barColors = { fresh: "[&>div]:bg-green-400", aging: "[&>div]:bg-blue-400", stale: "[&>div]:bg-amber-400", degraded: "[&>div]:bg-red-400" };

  return (
    <div className={cn("flex items-center gap-3 p-2 rounded-lg bg-muted/20", className)}>
      <Database className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-foreground capitalize">{domain}</span>
          <span className={cn("text-[9px] capitalize", colors[status])}>{status}</span>
        </div>
        <Progress value={Math.min(100, 100 - pct)} className={cn("h-1", barColors[status])} />
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
          {lastMaterialized && <span>{Math.round(age / 60000)}m ago</span>}
          {eventLag !== undefined && <span>• {eventLag} events behind</span>}
          {rebuildAvailable && (
            <button className="flex items-center gap-0.5 text-primary hover:underline">
              <RefreshCw className="w-2 h-2" />Rebuild
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
