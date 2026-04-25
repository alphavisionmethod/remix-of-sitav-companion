// ═══════════════════════════════════════════════════════════════
// SITA OS — ActionQueuePanel (Jarvis Bridge)
// Unified follow-through queue across advisor_action_queue,
// sita_agent_plans, and advisor_board_recommendations.
// ═══════════════════════════════════════════════════════════════

import { ListChecks, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { useUnifiedActionQueue } from "@/lib/sita-jarvis";
import type { JarvisActionItem } from "@/lib/sita-jarvis";
import { cn } from "@/lib/utils";

interface Props {
  selectedKey: string | null;
  onSelect: (item: JarvisActionItem) => void;
}

const SOURCE_LABEL: Record<string, string> = {
  advisor_action_queue: "Advisor action",
  sita_agent_plans: "Agent plan",
  advisor_board_recommendations: "Recommendation",
};

export function ActionQueuePanel({ selectedKey, onSelect }: Props) {
  const { items, loading, refresh } = useUnifiedActionQueue();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" /> Action queue
          <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={() => void refresh()} aria-label="Refresh action queue">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
        {loading ? (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        ) : items.length === 0 ? (
          <PremiumEmptyState
            variant="no-data"
            title="Nothing pending"
            description="No advisor actions, agent plans, or recommendations are waiting on you. Sita will surface items here as they arrive."
          />
        ) : (
          items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "w-full text-left rounded-md border bg-card/40 p-2.5 transition-colors hover:bg-card/70",
                selectedKey === item.key ? "border-primary/60 bg-primary/5" : "border-border/30",
              )}
              aria-pressed={selectedKey === item.key}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-sm leading-tight line-clamp-1">{item.title}</div>
                <Badge variant="outline" className="text-[10px] shrink-0">{SOURCE_LABEL[item.source] ?? item.source}</Badge>
              </div>
              {item.summary && (
                <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.summary}</div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">{item.domain}</Badge>
                {item.confidence != null && (
                  <Badge variant="outline" className="text-[10px]">conf {(item.confidence * 100).toFixed(0)}%</Badge>
                )}
                {item.risk && (
                  <Badge variant={item.risk === "high" ? "destructive" : "outline"} className="text-[10px] gap-1">
                    {item.risk === "high" && <AlertTriangle className="h-3 w-3" />}
                    risk {item.risk}
                  </Badge>
                )}
                {item.reversible && (
                  <Badge variant="outline" className="text-[10px] gap-1"><ShieldCheck className="h-3 w-3" /> reversible</Badge>
                )}
                {item.requiresApproval && (
                  <Badge variant="outline" className="text-[10px]">approval</Badge>
                )}
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}