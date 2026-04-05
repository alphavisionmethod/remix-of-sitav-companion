import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  Brain, Code, Palette, TestTube, Bug, Shield, Gauge, FileText,
  Rocket, Sparkles, TrendingUp, Users, Radio, Settings, Eye
} from "lucide-react";

const AGENTS = [
  { id: "eng-lead", name: "AI Engineering Lead", icon: Brain, domain: "Coordination", watching: "Cross-team synthesis, goal decomposition", currentTask: "Coordinating shell performance sprint", confidence: 92, autonomy: "supervised", escalation: "none", tasksCompleted: 34, recommendations: 12 },
  { id: "backend", name: "Backend Engineer", icon: Code, domain: "APIs & Services", watching: "API health, query performance, data models", currentTask: "Optimizing projection cache invalidation", confidence: 88, autonomy: "autonomous-low-risk", escalation: "none", tasksCompleted: 28, recommendations: 8 },
  { id: "frontend", name: "Frontend Engineer", icon: Code, domain: "UI & Components", watching: "Route health, render performance, hydration", currentTask: "Fixing broken layout on Mission Control", confidence: 85, autonomy: "supervised", escalation: "none", tasksCompleted: 41, recommendations: 15 },
  { id: "design", name: "Design Engineer", icon: Palette, domain: "Visual Quality", watching: "Layout consistency, dark mode, spacing", currentTask: "Proposing admin header redesign", confidence: 79, autonomy: "draft-only", escalation: "none", tasksCompleted: 19, recommendations: 22 },
  { id: "qa", name: "QA / Test Engineer", icon: TestTube, domain: "Quality Assurance", watching: "Test coverage, flaky tests, regressions", currentTask: "Generating tests for approval flow", confidence: 91, autonomy: "autonomous-low-risk", escalation: "none", tasksCompleted: 56, recommendations: 7 },
  { id: "debugger", name: "Error Fixer / Debugger", icon: Bug, domain: "Error Resolution", watching: "Error clusters, stack traces, user reports", currentTask: "Analyzing /api/projections error spike", confidence: 84, autonomy: "supervised", escalation: "pending", tasksCompleted: 63, recommendations: 31 },
  { id: "reliability", name: "Reliability Engineer", icon: Shield, domain: "Resilience & Ops", watching: "Incidents, health degradation, retries", currentTask: "Monitoring elevated error rate", confidence: 90, autonomy: "autonomous-low-risk", escalation: "none", tasksCompleted: 22, recommendations: 9 },
  { id: "security", name: "Security Reviewer", icon: Shield, domain: "Security Posture", watching: "Permission issues, secret drift, policies", currentTask: "Reviewing schema migration risk", confidence: 87, autonomy: "review-only", escalation: "active", tasksCompleted: 14, recommendations: 18 },
  { id: "performance", name: "Performance Optimizer", icon: Gauge, domain: "Speed & Efficiency", watching: "Load times, bundle size, query cost", currentTask: "Reducing admin shell initial load", confidence: 76, autonomy: "supervised", escalation: "none", tasksCompleted: 17, recommendations: 11 },
  { id: "docs", name: "Documentation Engineer", icon: FileText, domain: "Docs & Runbooks", watching: "Docs drift, changelog, runbook freshness", currentTask: "Updating deployment runbook", confidence: 93, autonomy: "autonomous-low-risk", escalation: "none", tasksCompleted: 31, recommendations: 5 },
  { id: "release", name: "Release Manager", icon: Rocket, domain: "Release Safety", watching: "Release readiness, smoke gates, rollout risk", currentTask: "Evaluating staging promotion evidence", confidence: 82, autonomy: "supervised", escalation: "none", tasksCompleted: 11, recommendations: 14 },
  { id: "healing", name: "Self-Healing Supervisor", icon: Sparkles, domain: "Auto-Remediation", watching: "Safe auto-fix scope, verification, downgrades", currentTask: "Verifying cache invalidation auto-heal", confidence: 88, autonomy: "autonomous-low-risk", escalation: "none", tasksCompleted: 47, recommendations: 3 },
  { id: "learning", name: "Learning Analyst", icon: TrendingUp, domain: "Pattern Discovery", watching: "Recurring failures, operator overrides, trends", currentTask: "Analyzing repeated UI regression pattern", confidence: 71, autonomy: "observe-only", escalation: "none", tasksCompleted: 8, recommendations: 19 },
];

const autonomyColors: Record<string, string> = {
  "autonomous-low-risk": "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  "supervised": "bg-primary/10 text-primary",
  "draft-only": "bg-amber-500/10 text-amber-500",
  "review-only": "bg-amber-500/10 text-amber-500",
  "observe-only": "bg-muted text-muted-foreground",
};

const AITeamRoster = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const active = selected ? AGENTS.find(a => a.id === selected) : null;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Users} title="AI Team Roster" subtitle="Your AI engineering specialists — what they watch, what they do, what they recommend" accent="primary" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-2 space-y-2">
          {AGENTS.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a.id === selected ? null : a.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                a.id === selected ? "border-primary/40 bg-primary/5" : "border-border/40 bg-card hover:bg-muted/30"
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
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-[10px] ${autonomyColors[a.autonomy] || ""}`} variant="outline">{a.autonomy}</Badge>
                  <span className="text-sm font-bold">{a.confidence}%</span>
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
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Confidence</p><Progress value={active.confidence} className="h-2" /><p className="text-xs text-muted-foreground mt-1">{active.confidence}%</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Autonomy Level</p><Badge className={autonomyColors[active.autonomy]} variant="outline">{active.autonomy}</Badge></div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div className="text-center"><p className="text-lg font-bold">{active.tasksCompleted}</p><p className="text-[10px] text-muted-foreground">Tasks Done</p></div>
                  <div className="text-center"><p className="text-lg font-bold">{active.recommendations}</p><p className="text-[10px] text-muted-foreground">Recommendations</p></div>
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
