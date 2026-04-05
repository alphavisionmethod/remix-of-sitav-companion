import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Target, Clock, CheckCircle2, AlertTriangle, Pause, RotateCcw, Sparkles, ArrowRight, Shield, FileCheck } from "lucide-react";

const MISSIONS = [
  { id: 1, title: "Fix broken route /admin/durability", status: "applied" as const, priority: "P0", agent: "Error Fixer", confidence: 94, evidence: 3, tests: 2, blastRadius: "low", approvalNeeded: false, rollbackSafe: true },
  { id: 2, title: "Improve loading speed — admin shell", status: "in_progress" as const, priority: "P1", agent: "Performance Optimizer", confidence: 76, evidence: 5, tests: 0, blastRadius: "medium", approvalNeeded: true, rollbackSafe: true },
  { id: 3, title: "Redesign Mission Control header", status: "ready_for_approval" as const, priority: "P2", agent: "Design Engineer", confidence: 79, evidence: 2, tests: 1, blastRadius: "low", approvalNeeded: true, rollbackSafe: true },
  { id: 4, title: "Resolve incident — elevated /api/projections errors", status: "in_progress" as const, priority: "P0", agent: "Reliability Engineer", confidence: 84, evidence: 6, tests: 0, blastRadius: "high", approvalNeeded: true, rollbackSafe: false },
  { id: 5, title: "Reduce drift between staging and production configs", status: "planned" as const, priority: "P2", agent: "Backend Engineer", confidence: 65, evidence: 2, tests: 0, blastRadius: "medium", approvalNeeded: true, rollbackSafe: true },
  { id: 6, title: "Harden deployment — add smoke gate for auth flow", status: "simulated" as const, priority: "P1", agent: "Release Manager", confidence: 88, evidence: 4, tests: 3, blastRadius: "low", approvalNeeded: true, rollbackSafe: true },
  { id: 7, title: "Remove flaky tests in approval workflow suite", status: "suggested" as const, priority: "P3", agent: "QA Engineer", confidence: 71, evidence: 1, tests: 0, blastRadius: "low", approvalNeeded: false, rollbackSafe: true },
  { id: 8, title: "Optimize prompts for advisor briefing packets", status: "learned_from" as const, priority: "P2", agent: "Learning Analyst", confidence: 82, evidence: 3, tests: 1, blastRadius: "low", approvalNeeded: false, rollbackSafe: true },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  suggested: { label: "Suggested", color: "text-muted-foreground", icon: Sparkles },
  planned: { label: "Planned", color: "text-primary", icon: Target },
  simulated: { label: "Simulated", color: "text-primary", icon: Shield },
  in_progress: { label: "In Progress", color: "text-amber-500", icon: Clock },
  blocked: { label: "Blocked", color: "text-destructive", icon: Pause },
  ready_for_approval: { label: "Ready for Approval", color: "text-amber-500", icon: FileCheck },
  applied: { label: "Applied", color: "text-[hsl(var(--trust-safe))]", icon: CheckCircle2 },
  rolled_back: { label: "Rolled Back", color: "text-destructive", icon: RotateCcw },
  learned_from: { label: "Learned From", color: "text-primary", icon: Sparkles },
};

const AIMissionCenter = () => {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? MISSIONS : MISSIONS.filter(m => m.status === tab);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Target} title="Mission Center" subtitle="AI team missions — from suggestion to applied, with evidence and rollback safety" accent="primary" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Active Missions", v: MISSIONS.filter(m => ["in_progress","simulated","ready_for_approval"].includes(m.status)).length },
          { l: "Awaiting Approval", v: MISSIONS.filter(m => m.status === "ready_for_approval").length },
          { l: "Applied Today", v: MISSIONS.filter(m => m.status === "applied").length },
          { l: "Avg Confidence", v: `${Math.round(MISSIONS.reduce((a,m) => a + m.confidence, 0) / MISSIONS.length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="ready_for_approval">Awaiting Approval</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-2 mt-4">
          {filtered.map(m => {
            const sc = statusConfig[m.status];
            return (
              <div key={m.id} className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <sc.icon className={`h-4 w-4 ${sc.color}`} />
                    <span className="text-sm font-semibold">{m.title}</span>
                    <Badge variant="outline" className="text-[10px]">{m.priority}</Badge>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Agent: {m.agent}</span>
                  <span>Confidence: {m.confidence}%</span>
                  <span>Evidence: {m.evidence} items</span>
                  <span>Tests: {m.tests}</span>
                  <span>Blast Radius: {m.blastRadius}</span>
                  {m.approvalNeeded && <span className="text-amber-500">Approval needed</span>}
                  <span>{m.rollbackSafe ? "✓ Rollback safe" : "⚠ No rollback"}</span>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIMissionCenter;
