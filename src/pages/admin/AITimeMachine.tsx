import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { History, ArrowRight, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Zap, RotateCcw, GitBranch } from "lucide-react";

const TIMELINE = [
  {
    time: "Apr 5, 10:12", event: "Preview deploy v2.15.0-rc2", type: "deploy" as const,
    details: "Added 8 AI Engineering Board pages, updated App.tsx routing",
    impact: "positive" as const, metrics: { errors: "0 new", performance: "No change", tests: "All pass" }
  },
  {
    time: "Apr 5, 09:45", event: "Staging deploy v2.15.0-rc1", type: "deploy" as const,
    details: "Projection cache strategy update + admin shell lazy imports",
    impact: "mixed" as const, metrics: { errors: "+14 projection errors", performance: "Admin LCP 3.2s (+191%)", tests: "2 flaky" }
  },
  {
    time: "Apr 4, 16:30", event: "Feature flag: revenue-sidebar-v2 enabled", type: "config" as const,
    details: "New sidebar layout for Revenue Office activated for 100% of users",
    impact: "negative" as const, metrics: { errors: "+3 render errors", performance: "No change", tests: "N/A" }
  },
  {
    time: "Apr 4, 17:15", event: "Feature flag: revenue-sidebar-v2 reverted", type: "rollback" as const,
    details: "Reliability Engineer auto-reverted after detecting render errors",
    impact: "positive" as const, metrics: { errors: "-3 (resolved)", performance: "Restored", tests: "N/A" }
  },
  {
    time: "Apr 4, 14:22", event: "Production deploy v2.14.3", type: "deploy" as const,
    details: "Cache strategy update, 3 bug fixes, 1 new admin page",
    impact: "positive" as const, metrics: { errors: "0 new", performance: "Slight improvement", tests: "All pass" }
  },
  {
    time: "Apr 3, 11:00", event: "Config: PROJECTION_REBUILD_CONCURRENCY → 5", type: "config" as const,
    details: "Increased from 2 to 5 to speed up projection rebuilds",
    impact: "negative" as const, metrics: { errors: "Contributed to race condition", performance: "Faster rebuilds", tests: "N/A" }
  },
  {
    time: "Apr 2, 11:05", event: "Production deploy v2.14.2", type: "deploy" as const,
    details: "Brand kit refresh, 2 edge function updates",
    impact: "positive" as const, metrics: { errors: "1 minor", performance: "No change", tests: "All pass" }
  },
  {
    time: "Mar 30, 16:40", event: "Production deploy v2.14.1", type: "deploy" as const,
    details: "Approval flow improvements, accessibility fixes",
    impact: "positive" as const, metrics: { errors: "0", performance: "No change", tests: "All pass" }
  },
];

const typeIcons: Record<string, typeof GitBranch> = { deploy: GitBranch, config: Zap, rollback: RotateCcw };
const impactColors: Record<string, string> = { positive: "text-[hsl(var(--trust-safe))]", negative: "text-destructive", mixed: "text-amber-500" };

const AITimeMachine = () => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(1);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={History} title="Engineering Time Machine" subtitle="Replay what changed before an incident or regression — deploys, configs, flags, rollbacks" accent="primary" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-0">
          {TIMELINE.map((event, i) => {
            const Icon = typeIcons[event.type] || GitBranch;
            return (
              <div key={i} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    event.impact === "negative" ? "border-destructive bg-destructive/20" :
                    event.impact === "mixed" ? "border-amber-500 bg-amber-500/20" :
                    "border-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe))]/20"
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      event.impact === "negative" ? "bg-destructive" :
                      event.impact === "mixed" ? "bg-amber-500" : "bg-[hsl(var(--trust-safe))]"
                    }`} />
                  </div>
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-border/40 min-h-[16px]" />}
                </div>

                {/* Event Card */}
                <div
                  className={`flex-1 mb-2 rounded-xl border p-3 cursor-pointer transition-all ${
                    i === selectedIdx ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border/40 bg-card hover:bg-muted/30"
                  }`}
                  onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{event.event}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{event.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.details}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="rounded-xl border border-border/40 bg-card p-5">
          {selectedIdx !== null ? (() => {
            const event = TIMELINE[selectedIdx];
            const Icon = typeIcons[event.type] || GitBranch;
            return (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Event</p>
                  <h3 className="font-semibold text-sm">{event.event}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{event.type}</Badge>
                    <Badge variant={event.impact === "positive" ? "default" : event.impact === "negative" ? "destructive" : "outline"} className="text-[10px]">{event.impact}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Details</p>
                  <p className="text-sm">{event.details}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Impact Metrics</p>
                  <div className="space-y-1">
                    {Object.entries(event.metrics).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground capitalize">{k}</span>
                        <span className={v.startsWith("+") || v.includes("error") ? "text-destructive" : v.startsWith("-") || v === "All pass" || v === "0" || v === "0 new" ? "text-[hsl(var(--trust-safe))]" : "text-foreground"}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{event.time}</p>
              </div>
            );
          })() : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <History className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select an event to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITimeMachine;
