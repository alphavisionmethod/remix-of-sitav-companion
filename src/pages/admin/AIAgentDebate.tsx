import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { MessageSquare, Code, Palette, Shield, Gauge, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

const DEBATES = [
  {
    id: 1, topic: "How to fix projection cache corruption",
    status: "resolved" as const,
    participants: [
      { agent: "Backend Engineer", position: "Add Redis mutex lock with 30s TTL to prevent concurrent writes", confidence: 87, stance: "for" as const },
      { agent: "Performance Optimizer", position: "Mutex will add 200-500ms latency. Use optimistic locking instead", confidence: 72, stance: "against" as const },
      { agent: "Reliability Engineer", position: "Mutex is safer. Latency increase acceptable vs data corruption risk", confidence: 90, stance: "for" as const },
      { agent: "Security Reviewer", position: "Agree with mutex. Optimistic locking may leave window for inconsistency", confidence: 85, stance: "for" as const },
    ],
    resolution: "Mutex lock approach selected (3-1). Performance Optimizer's latency concern noted — monitor post-deploy.",
    consensus: 82,
  },
  {
    id: 2, topic: "Admin shell performance — lazy imports vs route preloading",
    status: "active" as const,
    participants: [
      { agent: "Frontend Engineer", position: "Full lazy imports with Suspense boundaries. Reduces initial bundle 60%", confidence: 85, stance: "for" as const },
      { agent: "Performance Optimizer", position: "Lazy imports + prefetch on hover for critical routes. Best of both", confidence: 88, stance: "modified" as const },
      { agent: "QA Engineer", position: "Lazy imports require route test updates. 8 tests need rewriting", confidence: 78, stance: "neutral" as const },
      { agent: "Design Engineer", position: "Ensure loading skeletons match page layouts to avoid layout shift", confidence: 81, stance: "neutral" as const },
    ],
    resolution: null,
    consensus: 68,
  },
  {
    id: 3, topic: "Should feature flags require canary rollout?",
    status: "resolved" as const,
    participants: [
      { agent: "Release Manager", position: "All feature flags must go through 10% → 50% → 100% canary stages", confidence: 88, stance: "for" as const },
      { agent: "Engineering Lead", position: "Only high-impact flags need canary. Low-risk can go straight to 100%", confidence: 82, stance: "modified" as const },
      { agent: "Reliability Engineer", position: "Recent flag rollback supports canary for all. 5 rollbacks in 30 days", confidence: 86, stance: "for" as const },
      { agent: "Learning Analyst", position: "Data shows 80% of rollbacks were flags without canary stage", confidence: 79, stance: "for" as const },
    ],
    resolution: "Canary required for medium+ impact flags. Low-risk flags can opt out with explicit justification.",
    consensus: 84,
  },
];

const stanceColors: Record<string, string> = {
  for: "text-[hsl(var(--trust-safe))]",
  against: "text-destructive",
  modified: "text-amber-500",
  neutral: "text-muted-foreground",
};

const AIAgentDebate = () => {
  const [expanded, setExpanded] = useState<number | null>(2);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={MessageSquare} title="Agent Debate" subtitle="When AI agents disagree — positions, evidence, consensus, and resolution" accent="primary" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Active Debates", v: DEBATES.filter(d => d.status === "active").length },
          { l: "Resolved", v: DEBATES.filter(d => d.status === "resolved").length },
          { l: "Avg Consensus", v: `${Math.round(DEBATES.reduce((a,d) => a + d.consensus, 0) / DEBATES.length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {DEBATES.map(d => (
          <div key={d.id} className={`rounded-xl border bg-card ${d.status === "active" ? "border-primary/30" : "border-border/40"}`}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{d.topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === "active" ? "default" : "outline"}>{d.status}</Badge>
                  <span className="text-xs font-bold">{d.consensus}% consensus</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{d.participants.length} participants</p>
            </div>

            {expanded === d.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
                {d.participants.map((p, i) => (
                  <div key={i} className="rounded-lg border border-border/30 bg-muted/10 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{p.agent}</span>
                        <Badge variant="outline" className={`text-[10px] ${stanceColors[p.stance]}`}>{p.stance}</Badge>
                      </div>
                      <span className="text-xs font-bold">{p.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.position}</p>
                  </div>
                ))}

                {/* Consensus */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Consensus Level</span>
                    <span className="text-xs font-bold">{d.consensus}%</span>
                  </div>
                  <Progress value={d.consensus} className="h-1.5" />
                </div>

                {/* Resolution */}
                {d.resolution ? (
                  <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-3">
                    <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider font-semibold mb-1">Resolution</p>
                    <p className="text-xs">{d.resolution}</p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-[10px] text-primary uppercase tracking-wider font-semibold mb-1">Awaiting Resolution</p>
                    <p className="text-xs text-muted-foreground">Debate is ongoing. Human input may accelerate consensus.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAgentDebate;
