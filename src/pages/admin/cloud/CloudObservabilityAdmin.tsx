// ═══════════════════════════════════════════════════════════════
// SITA OS — CloudObservabilityAdmin (Phase 31.B — Live Telemetry)
// Pulls real metrics from useObservability + runtime probes.
// Falls back to a "no data yet" banner during cold-start instead
// of hardcoded demo numbers.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Clock, AlertTriangle, CheckCircle, XCircle, Activity, RefreshCw, Database, ShieldCheck, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useObservability } from "@/lib/observability/use-observability";

interface MetricCard {
  key: string;
  label: string;
  value: number | string;
  unit: string;
  health: "good" | "warning" | "critical" | "unknown";
  icon: typeof Activity;
  description: string;
  source: string;
}

const HEALTH_STYLES: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  good: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle },
  warning: { bg: "bg-amber-500/10", text: "text-amber-400", icon: AlertTriangle },
  critical: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
  unknown: { bg: "bg-muted", text: "text-muted-foreground", icon: Activity },
};

function classifyLatency(ms: number, warn: number, crit: number): MetricCard["health"] {
  if (ms >= crit) return "critical";
  if (ms >= warn) return "warning";
  return "good";
}

function classifyScore(score: number): MetricCard["health"] {
  if (score >= 90) return "good";
  if (score >= 70) return "warning";
  return "critical";
}

export function CloudObservabilityAdmin() {
  const { healthIndex, recentEvents, sloStatuses, isLoading, refresh } = useObservability();

  const metrics: MetricCard[] = useMemo(() => {
    const cards: MetricCard[] = [];

    if (healthIndex) {
      cards.push({
        key: "composite_health",
        label: "Composite Health",
        value: healthIndex.overallScore,
        unit: "/100",
        health: classifyScore(healthIndex.overallScore),
        icon: ShieldCheck,
        description: `Subsystems weighted health (grade ${healthIndex.grade})`,
        source: "computeHealthIndex",
      });

      for (const sub of healthIndex.subsystems) {
        cards.push({
          key: `subsystem_${sub.name}`,
          label: sub.name,
          value: sub.score,
          unit: "/100",
          health: classifyScore(sub.score),
          icon: sub.name === "database" ? Database : sub.name === "ai-gateway" ? Zap : Activity,
          description: sub.details ?? `Live probe — ${sub.status}`,
          source: "runtime-probes",
        });
      }
    }

    for (const slo of sloStatuses.slice(0, 4)) {
      cards.push({
        key: `slo_${slo.slo.id}`,
        label: `SLO ${slo.slo.id}`,
        value: (slo.actualSLI * 100).toFixed(2),
        unit: "%",
        health: slo.compliant ? "good" : "warning",
        icon: BarChart3,
        description: `Target ${(slo.slo.targetSLO * 100).toFixed(2)}% — ${slo.compliant ? "within" : "breaching"} budget`,
        source: "slo-tracking",
      });
    }

    return cards;
  }, [healthIndex, sloStatuses]);

  const healthCounts = useMemo(() => {
    const counts = { good: 0, warning: 0, critical: 0, unknown: 0 };
    for (const m of metrics) counts[m.health]++;
    return counts;
  }, [metrics]);

  const hasData = metrics.length > 0;
  const recentTraces = recentEvents.slice(-5).reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cloud Observability</h2>
          <p className="text-xs text-muted-foreground">
            Live telemetry from runtime probes, SLO tracker, and structured log buffer.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {!hasData && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">No telemetry yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Probes have not produced samples in this session. Click Refresh or wait for the
              60s auto-poll. We do not display fabricated numbers.
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {(["good", "warning", "critical"] as const).map((h) => {
              const style = HEALTH_STYLES[h];
              const Icon = style.icon;
              return (
                <Card key={h}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", style.bg)}>
                      <Icon className={cn("h-5 w-5", style.text)} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{healthCounts[h]}</p>
                      <p className="text-xs text-muted-foreground capitalize">{h}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.map((m) => {
              const style = HEALTH_STYLES[m.health];
              const Icon = m.icon;
              const numeric = typeof m.value === "number" ? m.value : Number(m.value);
              return (
                <Card key={m.key}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", style.bg)}>
                          <Icon className={cn("h-4 w-4", style.text)} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-xl font-bold">{m.value}</p>
                            <span className="text-sm text-muted-foreground">{m.unit}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-xs capitalize", style.text)}>{m.health}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{m.description}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">source: {m.source}</p>
                    {!Number.isNaN(numeric) && (
                      <div className="mt-2">
                        <Progress
                          value={m.unit === "%" || m.unit === "/100" ? numeric : Math.min(numeric / 20, 100)}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Recent Telemetry Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentTraces.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No telemetry events recorded in this session yet.</p>
          ) : (
            recentTraces.map((t, i) => (
              <div key={`${t.metric}-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-mono">{t.metric}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />{new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge variant="outline" className="text-xs">{t.value.toFixed(1)}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
