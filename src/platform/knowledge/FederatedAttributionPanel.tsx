// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10 <FederatedAttributionPanel>
// Drop-in panel that, given an invocationId, surfaces "where did
// this answer's evidence come from?" — broken down by own
// workspace vs each federated peer workspace, with hit counts and
// average / max similarity. Class: COMPOSITE.
// ═══════════════════════════════════════════════════════════════
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Network, Home, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAttributionSummary } from "./use-cross-workspace-approvals";

interface FederatedAttributionPanelProps {
  invocationId: string | null | undefined;
  className?: string;
  /** When true, render compact single-row inline summary. */
  compact?: boolean;
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

export function FederatedAttributionPanel({
  invocationId,
  className,
  compact = false,
}: FederatedAttributionPanelProps) {
  const q = useAttributionSummary(invocationId);

  if (!invocationId) {
    return (
      <Card className={cn("border-border/50 bg-background/40", className)}>
        <CardContent className="py-4 text-center text-xs text-muted-foreground">
          No invocation linked — attribution unavailable.
        </CardContent>
      </Card>
    );
  }

  if (q.isLoading) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="space-y-2 py-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  const groups = q.data?.groups ?? [];
  if (groups.length === 0) {
    return (
      <Card className={cn("border-border/50 bg-background/40", className)}>
        <CardContent className="py-4 text-center text-xs text-muted-foreground">
          No attribution traces recorded for this invocation.
        </CardContent>
      </Card>
    );
  }

  const totalHits = groups.reduce((s, g) => s + g.totalHits, 0);
  const federatedCount = groups
    .filter((g) => !g.isOwn)
    .reduce((s, g) => s + g.totalHits, 0);
  const federatedPct = totalHits === 0 ? 0 : Math.round((federatedCount / totalHits) * 100);

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "gap-1 px-1.5 py-0 text-[10px] font-medium",
                federatedPct > 0 ? "border-primary/50 text-primary" : "",
                className,
              )}
            >
              <Network className="h-3 w-3" />
              {federatedPct}% federated · {totalHits} sources
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px]">
            <p className="text-xs">
              {groups.length} workspace{groups.length === 1 ? "" : "s"} contributed
              evidence ({federatedCount} of {totalHits} from federated peers).
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={cn("border-border/50 bg-background/40 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Network className="h-4 w-4 text-primary" />
          Federated attribution
          <Badge variant="outline" className="ml-auto text-[10px]">
            {totalHits} sources · {federatedPct}% federated
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {groups.map((g) => {
          const pct = totalHits === 0 ? 0 : Math.round((g.totalHits / totalHits) * 100);
          const sim = typeof g.maxSimilarity === "number" && g.maxSimilarity > 0
            ? `${Math.round(g.maxSimilarity * 100)}%`
            : null;
          return (
            <div
              key={g.peerWorkspaceId}
              className="space-y-1 rounded border border-border/40 bg-muted/20 p-2"
            >
              <div className="flex items-center gap-2 text-xs">
                {g.isOwn ? (
                  <Home className="h-3 w-3 text-primary" />
                ) : (
                  <Network className="h-3 w-3 text-primary" />
                )}
                <span className="font-medium">
                  {g.isOwn ? "Own workspace" : `Peer workspace ${shortId(g.peerWorkspaceId)}`}
                </span>
                {!g.isOwn && g.federationIds.length > 0 && (
                  <Badge variant="outline" className="h-4 px-1 text-[9px]">
                    fed {shortId(g.federationIds[0])}
                  </Badge>
                )}
                {!g.isOwn && (
                  <Tooltip>
                    <TooltipTrigger>
                      <ShieldAlert className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[220px]">
                        Cross-workspace evidence — actions derived from this
                        source may require explicit operator approval.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {g.totalHits} hit{g.totalHits === 1 ? "" : "s"}
                  {sim && <> · max {sim}</>}
                </span>
              </div>
              <Progress value={pct} className="h-1" />
              <div className="flex flex-wrap gap-1">
                {g.retrievalKinds.map((k) => (
                  <Badge
                    key={k}
                    variant="outline"
                    className="h-4 px-1 text-[9px] uppercase tracking-wider"
                  >
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}