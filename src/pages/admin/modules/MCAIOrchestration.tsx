// ═══════════════════════════════════════════════════════════════════
// SITA OS — Admin: AI Orchestration Observability (Phase 4)
// Lists recent ai_invocation_plans for the current admin's tenant
// and renders an inline ExplainabilityPanel for the selected one.
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Cpu, Zap } from "lucide-react";
import {
  useRecentInvocations,
  ExplainabilityPanel,
} from "@/platform/ai";

const STATUS_COLOR: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-300",
  executing: "bg-blue-500/15 text-blue-300",
  planning: "bg-blue-500/15 text-blue-300",
  pending: "bg-muted text-muted-foreground",
  blocked: "bg-amber-500/15 text-amber-300",
  failed: "bg-destructive/15 text-destructive",
};

export default function MCAIOrchestration() {
  const recentQ = useRecentInvocations(40);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center gap-2">
        <Cpu className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">AI Orchestration</h1>
        <Badge variant="outline" className="ml-2 text-[10px]">
          Phase 4
        </Badge>
      </header>
      <p className="text-xs text-muted-foreground">
        Every in-app AI call routes through <code>ai-orchestrator</code>. Each
        invocation creates a plan + explainability traces — visible below.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: list */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-amber-400" />
              Recent invocations
              {recentQ.data && (
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {recentQ.data.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentQ.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !recentQ.data || recentQ.data.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No invocations yet. Trigger any AI call in the app to populate this view.
              </p>
            ) : (
              <ScrollArea className="max-h-[60vh]">
                <ul className="space-y-1 pr-2">
                  {recentQ.data.map((p) => {
                    const isSelected = p.id === selectedId;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(p.id)}
                          className={cn(
                            "w-full rounded border border-border/40 bg-muted/20 p-2 text-left transition hover:border-primary/40",
                            isSelected && "border-primary/60 bg-primary/10",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-4 px-1 text-[9px] uppercase",
                                STATUS_COLOR[p.status] ?? "",
                              )}
                            >
                              {p.status}
                            </Badge>
                            <span className="text-xs font-medium">
                              {p.capability_key ?? "general"}
                            </span>
                            <span className="ml-auto text-[10px] text-muted-foreground">
                              {new Date(p.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                            <span>mode: {p.mode}</span>
                            <span>{p.latency_ms ? `${p.latency_ms}ms` : "—"}</span>
                            <span>{p.total_tokens ? `${p.total_tokens} tok` : "—"}</span>
                          </div>
                          {p.module_id && (
                            <p className="mt-0.5 truncate text-[10px] text-foreground/60">
                              module: {p.module_id}
                            </p>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Right: explainability detail */}
        <ExplainabilityPanel invocationId={selectedId} />
      </div>
    </div>
  );
}