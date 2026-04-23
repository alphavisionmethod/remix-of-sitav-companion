import RCPSubNav from "@/components/admin/RCPSubNav";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Flag, GitBranch, Rocket } from "lucide-react";
import {
  getProgressTimeline, getRealityDistribution, REALITY_TRANSITIONS,
  SOURCE_INVENTORY, type RealityState
} from "@/runtimes/reality/reality-audit-registry";

const typeIcons: Record<string, typeof Clock> = {
  transition: GitBranch,
  milestone: Flag,
  migration: Rocket,
};

const typeColors: Record<string, string> = {
  transition: "text-blue-400 bg-blue-500/10",
  milestone: "text-emerald-400 bg-emerald-500/10",
  migration: "text-amber-400 bg-amber-500/10",
};

const RCP11ProgressTimeline = () => {
  const timeline = useMemo(() => getProgressTimeline(), []);
  const dist = useMemo(() => getRealityDistribution(), []);
  const totalFeatures = Object.values(dist).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Clock className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Reality Progress Timeline</h1>
          <p className="text-sm text-muted-foreground">Tracking conversion progress from demo-heavy to runtime-real</p>
        </div>
      </div>

      {/* StateTransitionCounters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Total Transitions", value: REALITY_TRANSITIONS.length, color: "text-blue-400" },
          { label: "→ Persisted", value: REALITY_TRANSITIONS.filter(t => t.toState === "persisted").length, color: "text-blue-400" },
          { label: "→ Proven", value: REALITY_TRANSITIONS.filter(t => t.toState === "proven").length, color: "text-emerald-400" },
          { label: "Mock Sources", value: SOURCE_INVENTORY.length, color: "text-amber-400" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Current distribution */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Current Platform Reality Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-8 rounded-lg overflow-hidden mb-2">
            {(["presentational", "simulated", "persisted", "proven"] as RealityState[]).map(s => {
              const pct = (dist[s] / totalFeatures) * 100;
              const bg = { presentational: "bg-red-500", simulated: "bg-amber-500", persisted: "bg-blue-500", proven: "bg-emerald-500" }[s];
              return pct > 0 ? (
                <div key={s} className={`${bg} flex items-center justify-center text-xs font-bold text-foreground`} style={{ width: `${pct}%` }}>
                  {dist[s]}
                </div>
              ) : null;
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>← Demo-heavy</span>
            <span>Runtime-real →</span>
          </div>
        </CardContent>
      </Card>

      {/* ProgressTimeline */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Conversion Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border/50" />
            <div className="space-y-4">
              {timeline.map((event, i) => {
                const Icon = typeIcons[event.type] || Clock;
                return (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full z-10 ${typeColors[event.type]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{event.event}</span>
                        <span className="text-[10px] text-muted-foreground">{event.date}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{event.detail}</p>
                      <Badge variant="outline" className="text-[9px] mt-1 capitalize">{event.type}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MilestoneMarkers */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Milestones & Targets</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { milestone: "50% Persisted", current: Math.round(((dist.persisted + dist.proven) / totalFeatures) * 100), target: 50, date: "Target: Q2 2026" },
              { milestone: "Zero Forbidden Mocks", current: SOURCE_INVENTORY.filter(s => !s.forbidden).length, target: SOURCE_INVENTORY.length, date: "Target: Q3 2026" },
              { milestone: "First Proven Feature", current: dist.proven, target: 1, date: "Target: Q2 2026" },
            ]).map(m => (
              <div key={m.milestone} className="p-3 rounded-lg border border-border/50 space-y-2">
                <div className="font-medium text-sm">{m.milestone}</div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.current >= m.target ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{m.current}/{m.target}</span>
                  <span>{m.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RCP11ProgressTimeline;
