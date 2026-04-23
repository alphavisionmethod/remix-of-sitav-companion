import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { History, ArrowRight, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Zap, RotateCcw, GitBranch } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { EmptyState } from "@/components/sita/EmptyState";

const DEMO_TIMELINE: any[] = [];
const typeIcons: Record<string, typeof GitBranch> = { deploy: GitBranch, config: Zap, rollback: RotateCcw };
const impactColors: Record<string, string> = { positive: "text-[hsl(var(--trust-safe))]", negative: "text-destructive", mixed: "text-amber-500" };

const AITimeMachine = () => {
  const { isDemo } = useAIEngDomain("auditTimeline", DEMO_TIMELINE);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(1);

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={History} title="Engineering Time Machine" subtitle="Replay what changed before an incident or regression — deploys, configs, flags, rollbacks" accent="primary" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-0">
          {([] as any[]).map((event, i) => {
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
                  {i < ([] as any[]).length - 1 && <div className="w-px flex-1 bg-border/40 min-h-[16px]" />}
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
            const event = DEMO_TIMELINE[selectedIdx];
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
                        <span className={String(v).startsWith("+") || String(v).includes("error") ? "text-destructive" : String(v).startsWith("-") || v === "All pass" || v === "0" || v === "0 new" ? "text-[hsl(var(--trust-safe))]" : "text-foreground"}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{event.time}</p>
              </div>
            );
          })() : (
            <EmptyState
              variant="card"
              icon={History}
              title="No event selected"
              description="Select an event to see its details."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AITimeMachine;
