import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Database, Cloud, HardDrive, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type DurabilityState = "persisted" | "transient" | "cached" | "fallback" | "unknown";

interface DurabilityStateBadgeProps {
  state: DurabilityState;
  lastWrite?: string | null;
  replayable?: boolean;
  auditVisible?: boolean;
  proofStatus?: "verified" | "pending" | "missing";
  compact?: boolean;
  className?: string;
}

const config: Record<DurabilityState, { icon: any; color: string; bg: string; label: string }> = {
  persisted: { icon: HardDrive, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", label: "Persisted" },
  transient: { icon: Cloud, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Transient" },
  cached: { icon: Database, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Cached" },
  fallback: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", label: "Fallback" },
  unknown: { icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-muted/20 border-border/40", label: "Unknown" },
};

function timeSince(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function DurabilityStateBadge({ state, lastWrite, replayable, auditVisible, proofStatus, compact, className }: DurabilityStateBadgeProps) {
  const c = config[state];
  const Icon = c.icon;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px]", c.bg, className)}>
            <Icon className={cn("w-2.5 h-2.5", c.color)} />
            <span className={c.color}>{c.label}</span>
            {!compact && proofStatus && (
              <span className={cn("text-[8px]", proofStatus === "verified" ? "text-green-400" : proofStatus === "pending" ? "text-amber-400" : "text-red-400")}>
                • {proofStatus}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-[10px] max-w-52 space-y-0.5">
          <p className="font-semibold">{c.label} State</p>
          {lastWrite && <p>Last write: {timeSince(lastWrite)}</p>}
          {replayable !== undefined && <p>Replayable: {replayable ? "Yes" : "No"}</p>}
          {auditVisible !== undefined && <p>Audit visible: {auditVisible ? "Yes" : "No"}</p>}
          {proofStatus && <p>Proof: {proofStatus}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
