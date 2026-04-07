import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Target, Clock, CheckCircle2, AlertTriangle, Pause, RotateCcw, Sparkles, Shield, FileCheck, ArrowRight, Eye, Users, Bug, Wrench } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_MISSIONS = [
  {
    id: 1, title: "Fix projection cache corruption", type: "fix-issue", status: "ready_for_approval" as const, priority: "P0",
    agents: ["Backend Engineer", "QA Engineer"], confidence: 87, blastRadius: "high", rollbackSafe: false,
    description: "Concurrent projection rebuilds corrupt cache entries. Add mutex lock with 30s TTL.",
    why: "14 error cluster in 48h. Affects admin dashboard, boardroom, and projections surface.",
    impact: "Eliminates all cache corruption errors. +200ms write latency (acceptable).",
    evidence: 6, tests: 3, changePlans: 1, approvals: 1, simResult: "Pass — 100 concurrent writes, 0 corruption",
    tasks: [
      { task: "Analyze root cause", status: "done" as const, agent: "Backend Engineer" },
      { task: "Draft mutex lock proposal", status: "done" as const, agent: "Backend Engineer" },
      { task: "Run concurrent write tests", status: "done" as const, agent: "QA Engineer" },
      { task: "Security review", status: "done" as const, agent: "Security Reviewer" },
      { task: "Human approval", status: "pending" as const, agent: "Operator" },
    ],
    lessonsLearned: null,
  },
  {
    id: 2, title: "Reduce admin shell load time to <1.2s", type: "optimize-performance", status: "in_progress" as const, priority: "P1",
    agents: ["Performance Optimizer", "Frontend Engineer"], confidence: 76, blastRadius: "medium", rollbackSafe: true,
    description: "Admin shell loads 30+ pages synchronously. Convert to lazy imports with Suspense.",
    why: "LCP 3.2s exceeds 1.5s budget. Users report slow first load. Blocks release gate.",
    impact: "Estimated: LCP 1.1s. 60% bundle reduction for initial load.",
    evidence: 5, tests: 0, changePlans: 0, approvals: 1, simResult: null,
    tasks: [
      { task: "Analyze bundle composition", status: "done" as const, agent: "Performance Optimizer" },
      { task: "Identify lazy-import candidates", status: "done" as const, agent: "Performance Optimizer" },
      { task: "Implement lazy imports", status: "in_progress" as const, agent: "Frontend Engineer" },
      { task: "Update route tests", status: "pending" as const, agent: "QA Engineer" },
    ],
    lessonsLearned: null,
  },
  {
    id: 3, title: "Zero critical accessibility violations", type: "improve-accessibility", status: "in_progress" as const, priority: "P1",
    agents: ["Frontend Engineer", "Design Engineer"], confidence: 85, blastRadius: "low", rollbackSafe: true,
    description: "2 AA violations remaining in admin sidebar. Add aria-labels and fix contrast.",
    why: "WCAG AA compliance required. Current sidebar icons have no accessible names.",
    impact: "Full AA compliance across admin surfaces.",
    evidence: 2, tests: 1, changePlans: 0, approvals: 0, simResult: null,
    tasks: [
      { task: "Audit all sidebar icons", status: "done" as const, agent: "Frontend Engineer" },
      { task: "Add aria-label props", status: "in_progress" as const, agent: "Frontend Engineer" },
      { task: "Fix contrast in dark mode headers", status: "done" as const, agent: "Design Engineer" },
    ],
    lessonsLearned: null,
  },
  {
    id: 4, title: "Resolve incident — elevated projection errors", type: "resolve-incident", status: "in_progress" as const, priority: "P0",
    agents: ["Reliability Engineer", "Error Fixer"], confidence: 84, blastRadius: "high", rollbackSafe: false,
    description: "Elevated 500 error rate on /api/projections/rebuild. Linked to cache corruption mission.",
    why: "Production stability. Error rate 5x baseline for 18 minutes.",
    impact: "Resolves all projection error spikes. Dependent on mission #1.",
    evidence: 6, tests: 0, changePlans: 0, approvals: 1, simResult: null,
    tasks: [
      { task: "Detect and classify error pattern", status: "done" as const, agent: "Error Fixer" },
      { task: "Link to root cause (cache corruption)", status: "done" as const, agent: "Reliability Engineer" },
      { task: "Monitor after mission #1 fix applied", status: "pending" as const, agent: "Reliability Engineer" },
    ],
    lessonsLearned: null,
  },
  {
    id: 5, title: "Harden deployment — add auth smoke gate", type: "harden-deployment", status: "simulated" as const, priority: "P1",
    agents: ["Release Manager", "QA Engineer"], confidence: 88, blastRadius: "low", rollbackSafe: true,
    description: "Add automated auth flow smoke test before staging→prod promotion.",
    why: "Two recent deploys broke login for 5-15 minutes before detection.",
    impact: "Prevents auth-breaking deploys from reaching production.",
    evidence: 4, tests: 3, changePlans: 1, approvals: 1, simResult: "Pass — simulated login, OAuth, and session refresh",
    tasks: [
      { task: "Design smoke test flow", status: "done" as const, agent: "Release Manager" },
      { task: "Implement auth smoke test", status: "done" as const, agent: "QA Engineer" },
      { task: "Simulate in staging", status: "done" as const, agent: "QA Engineer" },
      { task: "Add to promotion pipeline", status: "pending" as const, agent: "Release Manager" },
    ],
    lessonsLearned: null,
  },
  {
    id: 6, title: "Optimize prompts for advisor briefing packets", type: "custom", status: "learned_from" as const, priority: "P2",
    agents: ["Learning Analyst"], confidence: 82, blastRadius: "low", rollbackSafe: true,
    description: "Advisor briefing packets included redundant context. Streamlined prompt structure.",
    why: "30% token waste in briefing generation. Increased latency and cost.",
    impact: "30% reduction in briefing tokens. Latency improved by 400ms.",
    evidence: 3, tests: 1, changePlans: 1, approvals: 0, simResult: "Pass",
    tasks: [
      { task: "Analyze token usage patterns", status: "done" as const, agent: "Learning Analyst" },
      { task: "Draft optimized prompt template", status: "done" as const, agent: "Learning Analyst" },
      { task: "A/B test old vs new", status: "done" as const, agent: "Learning Analyst" },
    ],
    lessonsLearned: "Compact context windows reduced hallucination by 12% and improved response relevance.",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  suggested: { label: "Suggested", color: "text-muted-foreground", icon: Sparkles },
  planned: { label: "Planned", color: "text-primary", icon: Target },
  simulated: { label: "Simulated", color: "text-primary", icon: Shield },
  in_progress: { label: "In Progress", color: "text-amber-500", icon: Clock },
  blocked: { label: "Blocked", color: "text-destructive", icon: Pause },
  ready_for_approval: { label: "Awaiting Approval", color: "text-amber-500", icon: FileCheck },
  applied: { label: "Applied", color: "text-[hsl(var(--trust-safe))]", icon: CheckCircle2 },
  rolled_back: { label: "Rolled Back", color: "text-destructive", icon: RotateCcw },
  learned_from: { label: "Learned From", color: "text-primary", icon: Sparkles },
};

const taskStatusIcon = (status: string) =>
  status === "done" ? <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> :
  status === "in_progress" ? <Clock className="h-3 w-3 text-amber-500" /> :
  <div className="h-3 w-3 rounded-full border border-border" />;

const AIMissionCenter = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(1);
  const filtered = tab === "all" ? DEMO_MISSIONS : DEMO_MISSIONS.filter(m => m.status === tab);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Target} title="Mission Center" subtitle="AI team missions — goals, decomposition, evidence, risk, approvals, and outcomes" accent="primary" />

      <div className="grid grid-cols-5 gap-3">
        {[
          { l: "Active", v: DEMO_MISSIONS.filter(m => ["in_progress","simulated","ready_for_approval"].includes(m.status)).length },
          { l: "Awaiting Approval", v: DEMO_MISSIONS.filter(m => m.status === "ready_for_approval").length },
          { l: "P0 Critical", v: DEMO_MISSIONS.filter(m => m.priority === "P0").length, c: "text-destructive" },
          { l: "Learned From", v: DEMO_MISSIONS.filter(m => m.status === "learned_from").length },
          { l: "Avg Confidence", v: `${Math.round(DEMO_MISSIONS.reduce((a,m) => a + m.confidence, 0) / DEMO_MISSIONS.length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className={`text-xl font-bold ${c.c || ""}`}>{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="ready_for_approval">Awaiting Approval</TabsTrigger>
          <TabsTrigger value="simulated">Simulated</TabsTrigger>
          <TabsTrigger value="learned_from">Learned From</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map(m => {
          const sc = statusConfig[m.status];
          const isExpanded = expanded === m.id;
          return (
            <div key={m.id} className={`rounded-xl border bg-card overflow-hidden ${
              m.priority === "P0" ? "border-destructive/30" : m.status === "ready_for_approval" ? "border-amber-500/30" : "border-border/40"
            }`}>
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : m.id)}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <sc.icon className={`h-4 w-4 ${sc.color}`} />
                    <span className="text-sm font-semibold">{m.title}</span>
                    <Badge variant="outline" className="text-[10px]">{m.priority}</Badge>
                    <Badge variant="outline" className="text-[10px]">{m.type}</Badge>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {m.agents.join(", ")} · Confidence: {m.confidence}% · Blast: {m.blastRadius} · {m.evidence} evidence · {m.tests} tests
                </p>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
                  {/* Mission Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Mission Statement</p>
                      <p className="text-sm">{m.description}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Why This Exists</p>
                      <p className="text-sm">{m.why}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Expected Impact</p>
                    <p className="text-sm text-[hsl(var(--trust-safe))]">{m.impact}</p>
                  </div>

                  {/* Task Decomposition */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Task Decomposition</p>
                    <div className="space-y-1">
                      {m.tasks.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-border/10 last:border-0">
                          {taskStatusIcon(t.status)}
                          <span className={`flex-1 ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.task}</span>
                          <span className="text-muted-foreground">{t.agent}</span>
                          <Badge variant="outline" className="text-[9px]">{t.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk & Safety */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="rounded-lg bg-muted/20 p-2 text-center">
                      <p className="text-xs font-bold">{m.confidence}%</p>
                      <p className="text-[9px] text-muted-foreground">Confidence</p>
                    </div>
                    <div className="rounded-lg bg-muted/20 p-2 text-center">
                      <p className="text-xs font-bold">{m.blastRadius}</p>
                      <p className="text-[9px] text-muted-foreground">Blast Radius</p>
                    </div>
                    <div className="rounded-lg bg-muted/20 p-2 text-center">
                      <p className="text-xs font-bold">{m.rollbackSafe ? "✓ Safe" : "⚠ No"}</p>
                      <p className="text-[9px] text-muted-foreground">Rollback</p>
                    </div>
                    <div className="rounded-lg bg-muted/20 p-2 text-center">
                      <p className="text-xs font-bold">{m.changePlans}</p>
                      <p className="text-[9px] text-muted-foreground">Change Plans</p>
                    </div>
                  </div>

                  {m.simResult && (
                    <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-2">
                      <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider font-semibold mb-0.5">Simulation Result</p>
                      <p className="text-xs">{m.simResult}</p>
                    </div>
                  )}

                  {m.lessonsLearned && (
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-2">
                      <p className="text-[10px] text-primary uppercase tracking-wider font-semibold mb-0.5">Lessons Learned</p>
                      <p className="text-xs">{m.lessonsLearned}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIMissionCenter;
