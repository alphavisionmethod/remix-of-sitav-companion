import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, CheckCircle, AlertTriangle, XCircle, HelpCircle, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type FreshnessStatus = "fresh" | "stale" | "degraded" | "unknown" | "offline";
export type SourceType = "database" | "connector" | "calculation" | "llm" | "cache" | "fallback";

interface TruthBadgeProps {
  status: FreshnessStatus;
  source?: SourceType;
  confidence?: number;
  lastUpdated?: string;
  stalenessThresholdSeconds?: number;
  degradedReason?: string;
  compact?: boolean;
  className?: string;
}

const statusConfig: Record<FreshnessStatus, { icon: any; color: string; label: string; bg: string }> = {
  fresh: { icon: CheckCircle, color: "text-green-400", label: "Fresh", bg: "bg-green-500/10 border-green-500/20" },
  stale: { icon: Clock, color: "text-amber-400", label: "Stale", bg: "bg-amber-500/10 border-amber-500/20" },
  degraded: { icon: AlertTriangle, color: "text-orange-400", label: "Degraded", bg: "bg-orange-500/10 border-orange-500/20" },
  unknown: { icon: HelpCircle, color: "text-muted-foreground", label: "Unknown", bg: "bg-muted/20 border-border/40" },
  offline: { icon: XCircle, color: "text-red-400", label: "Offline", bg: "bg-red-500/10 border-red-500/20" },
};

const sourceLabels: Record<SourceType, string> = {
  database: "Database",
  connector: "External Sync",
  calculation: "Sovereign Calculation",
  llm: "AI Generated",
  cache: "Cached",
  fallback: "Fallback",
};

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TruthBadge({ status, source, confidence, lastUpdated, stalenessThresholdSeconds, degradedReason, compact = false, className }: TruthBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Auto-calculate staleness from lastUpdated + threshold
  let effectiveStatus = status;
  if (lastUpdated && stalenessThresholdSeconds && status === "fresh") {
    const age = (Date.now() - new Date(lastUpdated).getTime()) / 1000;
    if (age > stalenessThresholdSeconds * 2) effectiveStatus = "degraded";
    else if (age > stalenessThresholdSeconds) effectiveStatus = "stale";
  }
  const effectiveConfig = statusConfig[effectiveStatus];
  const EffectiveIcon = effectiveConfig.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("inline-flex items-center gap-0.5", className)}>
              <EffectiveIcon className={cn("w-3 h-3", effectiveConfig.color)} />
            </span>
          </TooltipTrigger>
          <TooltipContent className="text-[10px] max-w-48 space-y-0.5">
            <p className="font-semibold">{effectiveConfig.label}</p>
            {source && <p>Source: {sourceLabels[source]}</p>}
            {confidence !== undefined && <p>Confidence: {Math.round(confidence * 100)}%</p>}
            {lastUpdated && <p>Updated: {timeSince(lastUpdated)}</p>}
            {degradedReason && <p className="text-amber-400">{degradedReason}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px]", effectiveConfig.bg, className)}>
            <EffectiveIcon className={cn("w-2.5 h-2.5", effectiveConfig.color)} />
            <span className={effectiveConfig.color}>{effectiveConfig.label}</span>
            {source && <span className="text-muted-foreground">• {sourceLabels[source]}</span>}
            {confidence !== undefined && confidence < 0.9 && <span className="text-muted-foreground">• {Math.round(confidence * 100)}%</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-[10px] max-w-52 space-y-0.5">
          {lastUpdated && <p>Last updated: {timeSince(lastUpdated)}</p>}
          {stalenessThresholdSeconds && <p>Threshold: {stalenessThresholdSeconds < 3600 ? `${Math.round(stalenessThresholdSeconds / 60)}m` : `${Math.round(stalenessThresholdSeconds / 3600)}h`}</p>}
          {degradedReason && <p className="text-amber-400">{degradedReason}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
