import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  artifact: string;
  sourceHash: string;
  runtimeHash: string;
  lastChecked: string;
  className?: string;
}

export function ManifestDriftIndicator({ artifact, sourceHash, runtimeHash, lastChecked, className }: Props) {
  const drifted = sourceHash !== runtimeHash;
  return (
    <div className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded bg-muted/20 border border-border/30", className)}>
      <GitCompare className={cn("w-3.5 h-3.5 shrink-0", drifted ? "text-amber-400" : "text-green-400")} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-foreground truncate">{artifact}</p>
        <p className="text-[9px] text-muted-foreground font-mono">{sourceHash.slice(0, 8)} → {runtimeHash.slice(0, 8)}</p>
      </div>
      {drifted ? (
        <Badge variant="destructive" className="text-[8px] gap-0.5"><AlertTriangle className="w-2 h-2" />Drifted</Badge>
      ) : (
        <Badge variant="outline" className="text-[8px] gap-0.5 text-green-400 border-green-500/30"><CheckCircle className="w-2 h-2" />Synced</Badge>
      )}
    </div>
  );
}
