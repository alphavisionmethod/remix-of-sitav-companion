// ═══════════════════════════════════════════════════════════════════
// SITA OS — <ExplainabilityPanel> (Phase 4)
// Drop-in component: pass an invocationId and it renders a complete
// "what did the AI use to answer this?" panel including the plan,
// authority decision, model, latency, cost, and per-source traces.
// ═══════════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Brain,
  FileText,
  MessageSquare,
  Database,
  Briefcase,
  Workflow,
  ScrollText,
  Cpu,
  Wrench,
  Activity,
  ShieldCheck,
} from "lucide-react";
import {
  useInvocationPlan,
  useExplainabilityTraces,
  type ExplainabilityTraceRow,
} from "./use-explainability";

const SOURCE_ICONS: Record<string, typeof Brain> = {
  memory: Brain,
  file: FileText,
  advisor: MessageSquare,
  policy: ShieldCheck,
  workspace: Briefcase,
  module: Workflow,
  tool: Wrench,
  prompt: ScrollText,
  prior_receipt: ScrollText,
  live_data: Activity,
  user_input: MessageSquare,
  system: Cpu,
};

const ROLE_COLOR: Record<string, string> = {
  context: "bg-muted text-muted-foreground",
  grounding: "bg-blue-500/15 text-blue-300",
  constraint: "bg-amber-500/15 text-amber-300",
  citation: "bg-emerald-500/15 text-emerald-300",
  tool_input: "bg-purple-500/15 text-purple-300",
  tool_output: "bg-purple-500/15 text-purple-300",
  signal: "bg-pink-500/15 text-pink-300",
};

interface ExplainabilityPanelProps {
  invocationId: string | null | undefined;
  className?: string;
  compact?: boolean;
}

export function ExplainabilityPanel({
  invocationId,
  className,
  compact = false,
}: ExplainabilityPanelProps) {
  const planQ = useInvocationPlan(invocationId);
  const tracesQ = useExplainabilityTraces(invocationId);

  const groupedTraces = useMemo(() => {
    const map = new Map<string, ExplainabilityTraceRow[]>();
    for (const t of tracesQ.data ?? []) {
      const arr = map.get(t.source_type) ?? [];
      arr.push(t);
      map.set(t.source_type, arr);
    }
    return Array.from(map.entries());
  }, [tracesQ.data]);

  if (!invocationId) {
    return (
      <Card className={cn("border-border/50 bg-background/40", className)}>
        <CardContent className="py-6 text-center text-xs text-muted-foreground">
          No invocation linked to this response yet.
        </CardContent>
      </Card>
    );
  }

  if (planQ.isLoading || tracesQ.isLoading) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="space-y-2 py-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  const plan = planQ.data;

  return (
    <Card className={cn("border-border/50 bg-background/40 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4 text-primary" />
          What was used to answer this
          {plan?.status && (
            <Badge variant="outline" className="ml-auto text-[10px] uppercase tracking-wider">
              {plan.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary line */}
        {plan && (
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
            <div>
              <span className="text-foreground/70">Mode</span>: {plan.mode}
            </div>
            <div>
              <span className="text-foreground/70">Model</span>:{" "}
              {plan.model_choice ?? "—"}
            </div>
            <div>
              <span className="text-foreground/70">Latency</span>:{" "}
              {plan.latency_ms ? `${plan.latency_ms} ms` : "—"}
            </div>
            <div>
              <span className="text-foreground/70">Tokens</span>:{" "}
              {plan.total_tokens ?? "—"}
            </div>
            <div className="col-span-2">
              <span className="text-foreground/70">Authority</span>:{" "}
              {(plan.authority_check?.effective as string) ?? "n/a"}
              {plan.blocked_reason && (
                <span className="ml-2 text-destructive">
                  ({plan.blocked_reason})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Trace groups */}
        {groupedTraces.length === 0 ? (
          <p className="text-xs text-muted-foreground">No trace records.</p>
        ) : (
          <ScrollArea className={compact ? "max-h-48" : "max-h-72"}>
            <div className="space-y-3 pr-2">
              {groupedTraces.map(([sourceType, rows]) => {
                const Icon = SOURCE_ICONS[sourceType] ?? Cpu;
                return (
                  <div key={sourceType} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      {sourceType.replace("_", " ")}
                      <Badge variant="outline" className="ml-auto h-4 px-1 text-[9px]">
                        {rows.length}
                      </Badge>
                    </div>
                    <ul className="space-y-1">
                      {rows.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-start gap-2 rounded border border-border/40 bg-muted/20 p-2 text-xs"
                        >
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-4 shrink-0 px-1 text-[9px] uppercase",
                              ROLE_COLOR[t.role] ?? "",
                            )}
                          >
                            {t.role}
                          </Badge>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground/80">
                              {t.source_label}
                            </p>
                            {t.excerpt && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                {t.excerpt}
                              </p>
                            )}
                          </div>
                          {t.weight !== 1 && (
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              w{t.weight}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}