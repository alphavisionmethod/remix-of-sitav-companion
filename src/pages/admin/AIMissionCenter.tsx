import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Target, Clock, CheckCircle2, AlertTriangle, Pause, RotateCcw, Sparkles, Shield, FileCheck, ArrowRight, Eye, Users, Bug, Wrench } from "lucide-react";
import { useAIEngDomain } from "@/platform/governance/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


// Production fallback — seed data removed
const MISSIONS: any[] = [];

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
  const { data: missions, isDemo } = useAIEngDomain("missions", MISSIONS);
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(1);
  const filtered = tab === "all" ? missions : missions.filter((m: any) => m.status === tab);

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={Target} title="Mission Center" subtitle="AI team missions — goals, decomposition, evidence, risk, approvals, and outcomes" accent="primary" />

      <div className="grid grid-cols-5 gap-3">
        {[
          { l: "Active", v: missions.filter((m: any) => ["in_progress","simulated","ready_for_approval"].includes(m.status)).length },
          { l: "Awaiting Approval", v: missions.filter((m: any) => m.status === "ready_for_approval").length },
          { l: "P0 Critical", v: missions.filter((m: any) => m.priority === "P0").length, c: "text-destructive" },
          { l: "Learned From", v: missions.filter((m: any) => m.status === "learned_from").length },
          { l: "Avg Confidence", v: `${Math.round(missions.reduce((a: number, m: any) => a + (m.confidence || 0), 0) / Math.max(missions.length, 1))}%` },
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
        {filtered.map((m: any) => {
          const sc = statusConfig[m.status] || statusConfig.suggested;
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
                    {m.priority && <Badge variant="outline" className="text-[10px]">{m.priority}</Badge>}
                    {m.type && <Badge variant="outline" className="text-[10px]">{m.type}</Badge>}
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {m.agents?.join(", ") || m.agent || "—"} · Confidence: {m.confidence}% · {m.evidence || 0} evidence · {m.tests || 0} tests
                </p>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Mission Statement</p>
                      <p className="text-sm">{m.description || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Why This Exists</p>
                      <p className="text-sm">{m.why || "—"}</p>
                    </div>
                  </div>

                  {m.impact && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Expected Impact</p>
                      <p className="text-sm text-[hsl(var(--trust-safe))]">{m.impact}</p>
                    </div>
                  )}

                  {m.tasks && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Task Decomposition</p>
                      <div className="space-y-1">
                        {m.tasks.map((t: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-border/10 last:border-0">
                            {taskStatusIcon(t.status)}
                            <span className={`flex-1 ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.task}</span>
                            <span className="text-muted-foreground">{t.agent}</span>
                            <Badge variant="outline" className="text-[9px]">{t.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3">
                    <div className="rounded-lg bg-muted/20 p-2 text-center">
                      <p className="text-xs font-bold">{m.confidence}%</p>
                      <p className="text-[9px] text-muted-foreground">Confidence</p>
                    </div>
                    <div className="rounded-lg bg-muted/20 p-2 text-center">
                      <p className="text-xs font-bold">{m.blastRadius || "—"}</p>
                      <p className="text-[9px] text-muted-foreground">Blast Radius</p>
                    </div>
                    <div className="rounded-lg bg-muted/20 p-2 text-center">
                      <p className="text-xs font-bold">{m.rollbackSafe ? "✓ Safe" : "⚠ No"}</p>
                      <p className="text-[9px] text-muted-foreground">Rollback</p>
                    </div>
                    <div className="rounded-lg bg-muted/20 p-2 text-center">
                      <p className="text-xs font-bold">{m.changePlans || 0}</p>
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
