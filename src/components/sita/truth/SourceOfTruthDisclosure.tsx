import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  source: string;
  freshness: "real-time" | "near-real-time" | "periodic" | "on-demand" | "stale";
  lastSync?: string | null;
  degraded?: boolean;
  degradedReason?: string;
  className?: string;
}

const freshnessColors: Record<string, string> = {
  "real-time": "text-green-400",
  "near-real-time": "text-green-400",
  periodic: "text-blue-400",
  "on-demand": "text-amber-400",
  stale: "text-red-400",
};

export function SourceOfTruthDisclosure({ source, freshness, lastSync, degraded, degradedReason, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded bg-muted/20 border border-border/30 text-[10px]", className)}>
      <Info className="w-3 h-3 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">Source:</span>
      <span className="text-foreground font-medium">{source}</span>
      <span className="text-muted-foreground">•</span>
      <span className={freshnessColors[freshness]}>{freshness}</span>
      {lastSync && <span className="text-muted-foreground">• synced {new Date(lastSync).toLocaleTimeString()}</span>}
      {degraded && <span className="text-orange-400">• Degraded{degradedReason ? `: ${degradedReason}` : ""}</span>}
    </div>
  );
}
