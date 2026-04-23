import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FileCheck, CheckCircle2, AlertTriangle, XCircle, Clock, ArrowRight, Shield, Code, Eye, RotateCcw, Zap } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  proposed: "bg-primary/10 text-primary",
  approved: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  applied: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  rejected: "bg-destructive/10 text-destructive",
  simulated: "bg-amber-500/10 text-amber-500",
};

const AIChangePlanViewer = () => {
  const { data: plans, isDemo } = useAIEngDomain("changePlans", PLANS);
  const [expanded, setExpanded] = useState<string | null>("cp-1");
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? plans :
    tab === "pending" ? plans.filter((p: any) => ["draft", "proposed"].includes(p.status)) :
    tab === "approved" ? plans.filter((p: any) => ["approved", "applied"].includes(p.status)) :
    plans;

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={FileCheck} title="Change Plan Viewer" subtitle="Every AI-proposed change as a structured, auditable, evidence-backed plan with verification gates" accent="primary" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Total Plans", v: plans.length },
          { l: "Pending Review", v: plans.filter((p: any) => ["draft", "proposed"].includes(p.status)).length },
          { l: "Applied", v: plans.filter((p: any) => p.status === "applied").length },
          { l: "Avg Confidence", v: `${Math.round(plans.reduce((a: number, p: any) => a + (p.confidence || 0), 0) / Math.max(plans.length, 1))}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Plans</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved/Applied</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map((plan: any) => (
          <div key={plan.id} className={`rounded-xl border bg-card overflow-hidden ${plan.status === "proposed" ? "border-primary/30" : "border-border/40"}`}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{plan.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${statusColors[plan.status] || ""}`}>{plan.status}</Badge>
                  <span className="text-xs font-bold">{plan.confidence}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{plan.agent || plan.proposed_by_agent || "—"} · {plan.missionId || plan.mission_id || "—"} · {plan.deploymentScope || plan.deployment_scope || "—"} · {plan.createdAt || plan.created_at || "—"}</p>
            </div>

            {expanded === plan.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Intended Effect</p>
                    <p className="text-sm">{plan.intendedEffect || plan.intended_effect || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rollback Strategy</p>
                    <p className="text-sm">{plan.rollbackStrategy || plan.rollback_strategy || "—"}</p>
                  </div>
                </div>

                {(plan.targetFiles || plan.target_files) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Target Files</p>
                      <div className="space-y-1">{(plan.targetFiles || plan.target_files || []).map((f: string) => <p key={f} className="text-xs font-mono bg-muted/30 rounded px-2 py-1">{f}</p>)}</div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Affected Surfaces</p>
                      <div className="flex flex-wrap gap-1">{(plan.targetSurfaces || plan.target_surfaces || []).map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 mt-2">Affected Services</p>
                      <div className="flex flex-wrap gap-1">{(plan.affectedServices || plan.affected_services || []).map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
                    </div>
                  </div>
                )}

                {plan.verificationGates?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Verification Gates</p>
                    <div className="grid grid-cols-3 gap-2">
                      {plan.verificationGates.map((g: any) => (
                        <div key={g.gate} className={`rounded-lg border p-2 ${
                          g.result === "pass" ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" :
                          g.result === "warning" ? "border-amber-500/20 bg-amber-500/5" :
                          "border-destructive/20 bg-destructive/5"
                        }`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            {g.result === "pass" ? <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> :
                             g.result === "warning" ? <AlertTriangle className="h-3 w-3 text-amber-500" /> :
                             <XCircle className="h-3 w-3 text-destructive" />}
                            <span className="text-[10px] font-semibold">{g.gate}</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{g.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plan.testResults?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Test Results</p>
                    <div className="space-y-1">
                      {plan.testResults.map((t: any) => (
                        <div key={t.name} className="flex items-center gap-2 text-xs">
                          {t.passed ? <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> : <XCircle className="h-3 w-3 text-destructive" />}
                          <span className="font-medium">{t.name}</span>
                          <span className="text-muted-foreground ml-auto">{t.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plan.evidence?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Evidence</p>
                    <div className="space-y-1">
                      {plan.evidence.map((e: any, i: number) => (
                        <div key={i} className="rounded-lg bg-muted/20 p-2 flex items-start gap-2">
                          <Badge variant="outline" className="text-[9px] shrink-0">{e.type}</Badge>
                          <p className="text-xs">{e.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(plan.reviewedBy || plan.reviewed_by) && (
                  <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-3">
                    <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider font-semibold mb-1">Review</p>
                    <p className="text-xs">Reviewed by: {plan.reviewedBy || plan.reviewed_by}</p>
                    {(plan.reviewNotes || plan.description) && <p className="text-xs text-muted-foreground">{plan.reviewNotes || plan.description}</p>}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-border/20">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs">Autonomy: <strong>{(plan.autonomy || plan.autonomy_mode || "—").replace(/_/g, " ")}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs">Scope: <strong>{plan.deploymentScope || plan.deployment_scope || "—"}</strong></span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-muted-foreground">Confidence</span>
                      <span className="text-xs font-bold">{plan.confidence}%</span>
                    </div>
                    <Progress value={plan.confidence} className="h-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIChangePlanViewer;
