import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Brain, Code, Palette, TestTube, Bug, Shield, Gauge, FileText,
  Rocket, Sparkles, TrendingUp, Users, Eye, AlertTriangle, Activity
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const AGENTS = [
  { id: "eng-lead", name: "AI Engineering Lead", icon: Brain, domain: "Coordination", watching: "Cross-team synthesis, goal decomposition", currentTask: "Coordinating shell performance sprint", confidence: 92, autonomy: "supervised", escalation: "none" as const, tasksCompleted: 34, recommendations: 12, queueLoad: 3, accuracy: 89, missionIds: ["m-1", "m-2"], findings: 4, nextAction: "Synthesize sprint outcome report" },
  { id: "backend", name: "Backend Engineer", icon: Code, domain: "APIs & Services", watching: "API health, query performance, data models", currentTask: "Optimizing projection cache invalidation", confidence: 88, autonomy: "draft-only", escalation: "none" as const, tasksCompleted: 28, recommendations: 8, queueLoad: 2, accuracy: 86, missionIds: ["m-1"], findings: 3, nextAction: "Submit mutex lock change plan for review" },
  { id: "frontend", name: "Frontend Engineer", icon: Code, domain: "UI & Components", watching: "Route health, render performance, hydration", currentTask: "Fixing broken layout on Mission Control", confidence: 85, autonomy: "supervised", escalation: "none" as const, tasksCompleted: 41, recommendations: 15, queueLoad: 4, accuracy: 84, missionIds: ["m-3"], findings: 6, nextAction: "Complete accessibility sweep — 2 violations left" },
  { id: "design", name: "Design Engineer", icon: Palette, domain: "Visual Quality", watching: "Layout consistency, dark mode, spacing", currentTask: "Proposing admin header redesign", confidence: 79, autonomy: "draft-only", escalation: "none" as const, tasksCompleted: 19, recommendations: 22, queueLoad: 2, accuracy: 79, missionIds: ["m-5"], findings: 8, nextAction: "Finalize before/after for header proposal" },
  { id: "qa", name: "QA / Test Engineer", icon: TestTube, domain: "Quality Assurance", watching: "Test coverage, flaky tests, regressions", currentTask: "Generating tests for approval flow", confidence: 91, autonomy: "auto-low-risk", escalation: "none" as const, tasksCompleted: 56, recommendations: 7, queueLoad: 3, accuracy: 88, missionIds: ["m-2"], findings: 2, nextAction: "Replace flaky timing assertions with waitFor" },
  { id: "debugger", name: "Error Fixer / Debugger", icon: Bug, domain: "Error Resolution", watching: "Error clusters, stack traces, user reports", currentTask: "Analyzing /api/projections error spike", confidence: 84, autonomy: "supervised", escalation: "pending" as const, tasksCompleted: 63, recommendations: 31, queueLoad: 5, accuracy: 91, missionIds: ["m-1", "m-4"], findings: 14, nextAction: "Escalate projection race condition to Backend Engineer" },
  { id: "reliability", name: "Reliability Engineer", icon: Shield, domain: "Resilience & Ops", watching: "Incidents, health degradation, retries", currentTask: "Monitoring elevated error rate", confidence: 90, autonomy: "auto-low-risk", escalation: "none" as const, tasksCompleted: 22, recommendations: 9, queueLoad: 2, accuracy: 93, missionIds: ["m-1"], findings: 5, nextAction: "Verify error rate returns to baseline after fix" },
  { id: "security", name: "Security Reviewer", icon: Shield, domain: "Security Posture", watching: "Permission issues, secret drift, policies", currentTask: "Reviewing schema migration risk", confidence: 87, autonomy: "observe-only", escalation: "active" as const, tasksCompleted: 14, recommendations: 18, queueLoad: 1, accuracy: 96, missionIds: [], findings: 7, nextAction: "Complete migration risk assessment" },
  { id: "performance", name: "Performance Optimizer", icon: Gauge, domain: "Speed & Efficiency", watching: "Load times, bundle size, query cost", currentTask: "Reducing admin shell initial load", confidence: 76, autonomy: "supervised", escalation: "none" as const, tasksCompleted: 17, recommendations: 11, queueLoad: 2, accuracy: 74, missionIds: ["m-2"], findings: 3, nextAction: "Propose lazy import + prefetch strategy" },
  { id: "docs", name: "Documentation Engineer", icon: FileText, domain: "Docs & Runbooks", watching: "Docs drift, changelog, runbook freshness", currentTask: "Updating deployment runbook", confidence: 93, autonomy: "auto-low-risk", escalation: "none" as const, tasksCompleted: 31, recommendations: 5, queueLoad: 0, accuracy: 92, missionIds: [], findings: 1, nextAction: "No pending actions" },
  { id: "release", name: "Release Manager", icon: Rocket, domain: "Release Safety", watching: "Release readiness, smoke gates, rollout risk", currentTask: "Evaluating staging promotion evidence", confidence: 82, autonomy: "supervised", escalation: "none" as const, tasksCompleted: 11, recommendations: 14, queueLoad: 1, accuracy: 85, missionIds: ["m-5"], findings: 4, nextAction: "Resolve performance gate blocker before promotion" },
  { id: "healing", name: "Self-Healing Supervisor", icon: Sparkles, domain: "Auto-Remediation", watching: "Safe auto-fix scope, verification, downgrades", currentTask: "Verifying cache invalidation auto-heal", confidence: 88, autonomy: "auto-low-risk", escalation: "none" as const, tasksCompleted: 47, recommendations: 3, queueLoad: 3, accuracy: 90, missionIds: [], findings: 2, nextAction: "Monitor downgraded layout-restore rule" },
  { id: "learning", name: "Learning Analyst", icon: TrendingUp, domain: "Pattern Discovery", watching: "Recurring failures, operator overrides, trends", currentTask: "Analyzing repeated UI regression pattern", confidence: 71, autonomy: "observe-only", escalation: "none" as const, tasksCompleted: 8, recommendations: 19, queueLoad: 1, accuracy: 71, missionIds: [], findings: 6, nextAction: "Propose permanent fix for flag-rollback pattern" },
];

const autonomyColors: Record<string, string> = {
  "auto-low-risk": "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  "supervised": "bg-primary/10 text-primary",
  "draft-only": "bg-amber-500/10 text-amber-500",
  "observe-only": "bg-muted text-muted-foreground",
};

const AITeamRoster = () => {
  const [selected, setSelected] = useState<string | null>("debugger");
  const [view, setView] = useState("roster");
  const active = selected ? AGENTS.find(a => a.id === selected) : null;

  const sorted = view === "roster" ? AGENTS :
    view === "severity" ? [...AGENTS].sort((a, b) => (b.escalation === "active" ? 2 : b.escalation === "pending" ? 1 : 0) - (a.escalation === "active" ? 2 : a.escalation === "pending" ? 1 : 0)) :
    view === "workload" ? [...AGENTS].sort((a, b) => b.queueLoad - a.queueLoad) :
    [...AGENTS].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Users} title="AI Team Roster" subtitle="Your AI engineering specialists — focus, queue, confidence, autonomy, and accuracy" accent="primary" />

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { l: "Total Agents", v: AGENTS.length },
          { l: "Escalated", v: AGENTS.filter(a => a.escalation !== "none").length, c: "text-amber-500" },
          { l: "Total Queue", v: AGENTS.reduce((a, ag) => a + ag.queueLoad, 0) },
          { l: "Avg Confidence", v: `${Math.round(AGENTS.reduce((a, ag) => a + ag.confidence, 0) / AGENTS.length)}%` },
          { l: "Avg Accuracy", v: `${Math.round(AGENTS.reduce((a, ag) => a + ag.accuracy, 0) / AGENTS.length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className={`text-xl font-bold ${c.c || ""}`}>{c.v}</p>
            <p className="text-[10px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      {/* View Selector */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="workload">By Workload</TabsTrigger>
          <TabsTrigger value="severity">By Escalation</TabsTrigger>
          <TabsTrigger value="accuracy">By Accuracy</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-2 space-y-2">
          {sorted.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a.id === selected ? null : a.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                a.id === selected ? "border-primary/40 bg-primary/5" : a.escalation !== "none" ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-card hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{a.name}</span>
                    {a.escalation === "active" && <Badge variant="destructive" className="text-[10px]">Escalated</Badge>}
                    {a.escalation === "pending" && <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500">Pending</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{a.currentTask}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* Queue Load Bar */}
                  <div className="w-12">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-0.5">
                      <span>Q</span><span>{a.queueLoad}</span>
                    </div>
                    <Progress value={a.queueLoad * 20} className="h-1" />
                  </div>
                  <Badge className={`text-[10px] ${autonomyColors[a.autonomy] || ""}`} variant="outline">{a.autonomy}</Badge>
                  <span className="text-sm font-bold w-8 text-right">{a.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="rounded-xl border border-border/40 bg-card p-5">
          {active ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <active.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{active.name}</h3>
                  <p className="text-xs text-muted-foreground">{active.domain}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Watching</p><p className="text-sm">{active.watching}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current Task</p><p className="text-sm">{active.currentTask}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Recommended Next Action</p><p className="text-sm text-primary">{active.nextAction}</p></div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                    <Progress value={active.confidence} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{active.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Accuracy</p>
                    <Progress value={active.accuracy} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{active.accuracy}%</p>
                  </div>
                </div>

                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Autonomy Level</p><Badge className={autonomyColors[active.autonomy]} variant="outline">{active.autonomy}</Badge></div>

                {active.escalation !== "none" && (
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-2">
                    <p className="text-xs text-amber-500 font-semibold">Escalation: {active.escalation}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/40">
                  <div className="text-center"><p className="text-lg font-bold">{active.tasksCompleted}</p><p className="text-[10px] text-muted-foreground">Tasks Done</p></div>
                  <div className="text-center"><p className="text-lg font-bold">{active.recommendations}</p><p className="text-[10px] text-muted-foreground">Recommendations</p></div>
                  <div className="text-center"><p className="text-lg font-bold">{active.findings}</p><p className="text-[10px] text-muted-foreground">Findings</p></div>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Queue Load</p>
                  <Progress value={active.queueLoad * 20} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{active.queueLoad} items</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Eye className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select an agent to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITeamRoster;
