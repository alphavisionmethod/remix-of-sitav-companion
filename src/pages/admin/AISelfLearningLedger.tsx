import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BookOpen, TrendingUp, CheckCircle2, AlertTriangle, RotateCcw, Brain, Target, Users, ArrowRight } from "lucide-react";

const LEARNED_PATTERNS = [
  { pattern: "Route mapping errors recur after lazy-import refactors", frequency: "4x / 30d", confidence: 88, domain: "Frontend", action: "Added pre-commit route validation", status: "active" as const, impact: "Prevented 3 broken routes" },
  { pattern: "Feature flag rollbacks cluster within 2 hours of activation", frequency: "5x / 30d", confidence: 82, domain: "Deployment", action: "Canary rollout required for medium+ flags", status: "active" as const, impact: "Reduced flag rollbacks 60%" },
  { pattern: "CDN cache staleness correlates with brand kit mutations", frequency: "Weekly", confidence: 91, domain: "Infrastructure", action: "Auto-invalidate on brand kit save", status: "active" as const, impact: "Zero stale brand reports since" },
  { pattern: "Operator overrides low-risk approval threshold repeatedly", frequency: "8x / 30d", confidence: 76, domain: "Governance", action: "Lowered threshold for auto-heals", status: "proposed" as const, impact: "Estimated: -40% approval friction" },
  { pattern: "Projection rebuild failures spike after concurrent config changes", frequency: "3x / 14d", confidence: 84, domain: "Backend", action: "Mutex lock + sequential rebuild queue", status: "active" as const, impact: "Eliminated rebuild corruption" },
  { pattern: "Approval flow tests become flaky after UI dependency updates", frequency: "3x / 14d", confidence: 79, domain: "QA", action: "Replace timing-dependent assertions with waitFor", status: "proposed" as const, impact: "Estimated: -80% flaky tests" },
];

const BEHAVIOR_CHANGES = [
  { change: "Error Fixer now checks for existing lazy imports before proposing route fixes", learnedFrom: "False positive: suggested import that already existed", date: "Apr 3", improvement: "+4% accuracy" },
  { change: "Reliability Engineer auto-reverts feature flags within 90 min if error rate > 2x baseline", learnedFrom: "revenue-sidebar-v2 flag caused 3 render errors for 45 min", date: "Apr 4", improvement: "45 min → 12 min MTTR" },
  { change: "Design Engineer includes design token audit in all proposals", learnedFrom: "2 proposals used hardcoded colors instead of semantic tokens", date: "Mar 28", improvement: "+15% consistency score" },
  { change: "QA Engineer prioritizes integration tests over unit tests for approval flows", learnedFrom: "Unit tests passed but integration flow broke in staging", date: "Mar 25", improvement: "Caught 2 integration bugs" },
  { change: "Release Manager requires 4-hour soak time before staging→prod promotion", learnedFrom: "v2.14.0 promoted after 30 min, required rollback", date: "Mar 28", improvement: "Zero premature promotions since" },
];

const ROUTING_WEIGHTS = [
  { agent: "Error Fixer", weight: 1.12, trend: "up" as const, reason: "91% accuracy, 3% improvement this month" },
  { agent: "QA Engineer", weight: 1.05, trend: "stable" as const, reason: "88% accuracy, consistent performance" },
  { agent: "Design Engineer", weight: 0.92, trend: "up" as const, reason: "79% accuracy, improving from 71%" },
  { agent: "Reliability Engineer", weight: 1.15, trend: "stable" as const, reason: "93% accuracy, top performer" },
  { agent: "Performance Optimizer", weight: 0.85, trend: "down" as const, reason: "74% accuracy, 3 false positives this month" },
  { agent: "Security Reviewer", weight: 1.18, trend: "stable" as const, reason: "96% accuracy, zero missed issues" },
  { agent: "Learning Analyst", weight: 0.78, trend: "up" as const, reason: "71% accuracy but improving pattern detection" },
];

const AISelfLearningLedger = () => {
  const [tab, setTab] = useState("patterns");

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={BookOpen} title="Self-Learning Ledger" subtitle="What the system learned, how behavior changed, and how routing adapted" accent="primary" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Active Patterns", v: LEARNED_PATTERNS.filter(p => p.status === "active").length },
          { l: "Behavior Changes", v: BEHAVIOR_CHANGES.length },
          { l: "Avg Pattern Confidence", v: `${Math.round(LEARNED_PATTERNS.reduce((a,p) => a + p.confidence, 0) / LEARNED_PATTERNS.length)}%` },
          { l: "Top Agent Weight", v: Math.max(...ROUTING_WEIGHTS.map(w => w.weight)).toFixed(2) },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="patterns"><Brain className="h-3.5 w-3.5 mr-1" />Patterns</TabsTrigger>
          <TabsTrigger value="behavior"><Target className="h-3.5 w-3.5 mr-1" />Behavior Changes</TabsTrigger>
          <TabsTrigger value="routing"><Users className="h-3.5 w-3.5 mr-1" />Routing Weights</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-2 mt-4">
          {LEARNED_PATTERNS.map((p, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{p.pattern}</span>
                <Badge variant={p.status === "active" ? "default" : "outline"}>{p.status}</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                <span>{p.domain}</span><span>{p.frequency}</span><span>Confidence: {p.confidence}%</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-primary/5 p-2">
                  <p className="text-[10px] text-primary uppercase tracking-wider mb-0.5">Action Taken</p>
                  <p className="text-xs">{p.action}</p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 p-2">
                  <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider mb-0.5">Impact</p>
                  <p className="text-xs">{p.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="behavior" className="space-y-2 mt-4">
          {BEHAVIOR_CHANGES.map((b, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <p className="text-sm font-medium mb-1">{b.change}</p>
              <div className="rounded-lg bg-muted/30 p-2 mb-2">
                <p className="text-xs text-muted-foreground"><span className="font-medium">Learned from:</span> {b.learnedFrom}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{b.date}</span>
                <span className="text-[hsl(var(--trust-safe))] font-medium">{b.improvement}</span>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="routing" className="space-y-2 mt-4">
          {ROUTING_WEIGHTS.map((w, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{w.agent}</span>
                  <Badge variant={w.trend === "up" ? "default" : w.trend === "down" ? "destructive" : "outline"} className="text-[10px]">
                    {w.trend === "up" ? "↑" : w.trend === "down" ? "↓" : "→"} {w.trend}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{w.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-lg font-bold ${w.weight >= 1 ? "text-[hsl(var(--trust-safe))]" : "text-amber-500"}`}>{w.weight.toFixed(2)}x</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISelfLearningLedger;
