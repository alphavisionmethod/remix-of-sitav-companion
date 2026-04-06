import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FileCheck, CheckCircle2, AlertTriangle, XCircle, Clock, ArrowRight, Shield, Code, Eye, RotateCcw, Zap } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const PLANS = [
  {
    id: "cp-1", title: "Add Redis mutex for projection cache writes", missionId: "Fix projection corruption",
    agent: "Backend Engineer", status: "approved" as const, confidence: 87, autonomy: "approval_required",
    targetFiles: ["src/lib/services/projection-cache.ts", "src/lib/core-services/redis-client.ts"],
    targetSurfaces: ["Admin Dashboard", "Boardroom"],
    intendedEffect: "Prevent concurrent cache writes from corrupting projection data",
    affectedServices: ["projection-service", "cache-layer"],
    affectedRoutes: ["/admin/projections", "/boardroom"],
    rollbackStrategy: "Remove mutex lock, revert to optimistic writes. No data loss expected.",
    deploymentScope: "staging" as const,
    testsNeeded: ["Concurrent write stress test", "Projection rebuild integration test", "Cache invalidation test"],
    testResults: [
      { name: "Concurrent write stress test", passed: true, detail: "100 concurrent writes — 0 corruption" },
      { name: "Projection rebuild integration test", passed: true, detail: "Full rebuild completes in 2.1s" },
      { name: "Cache invalidation test", passed: true, detail: "Invalidation propagates within 500ms" },
    ],
    evidence: [
      { type: "Root cause analysis", detail: "Race condition when PROJECTION_REBUILD_CONCURRENCY > 2" },
      { type: "Signal cluster", detail: "14 projection 500 errors over 4 hours" },
      { type: "Agent debate", detail: "3-1 consensus for mutex over optimistic locking" },
    ],
    verificationGates: [
      { gate: "Type Check", result: "pass" as const, detail: "0 errors" },
      { gate: "Unit Tests", result: "pass" as const, detail: "3/3 passing" },
      { gate: "Security Scan", result: "pass" as const, detail: "No new vulnerabilities" },
      { gate: "Performance", result: "warning" as const, detail: "+200ms latency on writes (acceptable)" },
      { gate: "Policy Compliance", result: "pass" as const, detail: "Within approval boundaries" },
    ],
    createdAt: "Apr 5, 09:30", reviewedBy: "Operator", reviewNotes: "Approved after agent debate review"
  },
  {
    id: "cp-2", title: "Fix broken route /admin/durability", missionId: "Route mapping fix",
    agent: "Error Fixer", status: "applied" as const, confidence: 96, autonomy: "safe_auto_heal",
    targetFiles: ["src/App.tsx"],
    targetSurfaces: ["Admin Shell"],
    intendedEffect: "Restore navigation to durability dashboard",
    affectedServices: ["frontend-router"],
    affectedRoutes: ["/admin/durability"],
    rollbackStrategy: "Revert single route entry. Zero cascading effects.",
    deploymentScope: "preview" as const,
    testsNeeded: ["Route resolution test"],
    testResults: [{ name: "Route resolution test", passed: true, detail: "Route resolves correctly" }],
    evidence: [{ type: "Signal", detail: "404 on known internal route detected by observation layer" }],
    verificationGates: [
      { gate: "Type Check", result: "pass" as const, detail: "0 errors" },
      { gate: "Route Test", result: "pass" as const, detail: "Route resolves" },
      { gate: "Policy", result: "pass" as const, detail: "Auto-heal eligible (isolated, low-risk)" },
    ],
    createdAt: "Apr 5, 08:15", reviewedBy: "Auto-healed", reviewNotes: "Low-risk, isolated change — auto-applied"
  },
  {
    id: "cp-3", title: "Admin header gradient accent upgrade", missionId: "Design consistency improvement",
    agent: "Design Engineer", status: "proposed" as const, confidence: 84, autonomy: "approval_required",
    targetFiles: ["src/components/sita/admin/AdminPageHeader.tsx"],
    targetSurfaces: ["Admin Shell — all pages"],
    intendedEffect: "Improve scannability and visual premium feel across admin surfaces",
    affectedServices: ["frontend-components"],
    affectedRoutes: ["/admin/*"],
    rollbackStrategy: "Revert component file. Original flat style restored instantly.",
    deploymentScope: "preview" as const,
    testsNeeded: ["Visual regression test", "Design token audit"],
    testResults: [],
    evidence: [
      { type: "Design audit", detail: "Current headers lack visual hierarchy — blend with card backgrounds" },
      { type: "Consistency check", detail: "92% design token compliance after change" },
    ],
    verificationGates: [
      { gate: "Type Check", result: "pass" as const, detail: "0 errors" },
      { gate: "Design Consistency", result: "pass" as const, detail: "92% token compliance" },
      { gate: "Accessibility", result: "warning" as const, detail: "Contrast OK but review gradient readability" },
    ],
    createdAt: "Apr 5, 10:45", reviewedBy: undefined, reviewNotes: undefined
  },
  {
    id: "cp-4", title: "Canary rollout policy for medium+ feature flags", missionId: "Deployment hardening",
    agent: "Release Manager", status: "draft" as const, confidence: 76, autonomy: "approval_required",
    targetFiles: ["src/lib/core-services/feature-flags.ts", "src/lib/ai-engineering/self-healing-engine.ts"],
    targetSurfaces: ["Release pipeline", "Self-Healing Center"],
    intendedEffect: "Require 10%→50%→100% canary stages for medium+ impact flags",
    affectedServices: ["feature-flag-service", "deployment-pipeline"],
    affectedRoutes: [],
    rollbackStrategy: "Remove canary enforcement. Flags return to instant 100% activation.",
    deploymentScope: "staging" as const,
    testsNeeded: ["Canary stage transition test", "Flag rollback test", "Policy enforcement test"],
    testResults: [],
    evidence: [
      { type: "Learning pattern", detail: "80% of flag rollbacks were flags without canary stage" },
      { type: "Agent debate", detail: "3-1 consensus for canary requirement (with low-risk opt-out)" },
    ],
    verificationGates: [],
    createdAt: "Apr 5, 11:00", reviewedBy: undefined, reviewNotes: undefined
  },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  proposed: "bg-primary/10 text-primary",
  approved: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  applied: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  rejected: "bg-destructive/10 text-destructive",
  simulated: "bg-amber-500/10 text-amber-500",
};

const AIChangePlanViewer = () => {
  const [expanded, setExpanded] = useState<string | null>("cp-1");
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? PLANS :
    tab === "pending" ? PLANS.filter(p => ["draft", "proposed"].includes(p.status)) :
    tab === "approved" ? PLANS.filter(p => ["approved", "applied"].includes(p.status)) :
    PLANS;

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={FileCheck} title="Change Plan Viewer" subtitle="Every AI-proposed change as a structured, auditable, evidence-backed plan with verification gates" accent="primary" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Total Plans", v: PLANS.length },
          { l: "Pending Review", v: PLANS.filter(p => ["draft", "proposed"].includes(p.status)).length },
          { l: "Applied", v: PLANS.filter(p => p.status === "applied").length },
          { l: "Avg Confidence", v: `${Math.round(PLANS.reduce((a, p) => a + p.confidence, 0) / PLANS.length)}%` },
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
        {filtered.map(plan => (
          <div key={plan.id} className={`rounded-xl border bg-card overflow-hidden ${plan.status === "proposed" ? "border-primary/30" : "border-border/40"}`}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{plan.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${statusColors[plan.status]}`}>{plan.status}</Badge>
                  <span className="text-xs font-bold">{plan.confidence}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{plan.agent} · {plan.missionId} · {plan.deploymentScope} · {plan.createdAt}</p>
            </div>

            {expanded === plan.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
                {/* Intent & Impact */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Intended Effect</p>
                    <p className="text-sm">{plan.intendedEffect}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rollback Strategy</p>
                    <p className="text-sm">{plan.rollbackStrategy}</p>
                  </div>
                </div>

                {/* Target Files & Surfaces */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Target Files</p>
                    <div className="space-y-1">{plan.targetFiles.map(f => <p key={f} className="text-xs font-mono bg-muted/30 rounded px-2 py-1">{f}</p>)}</div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Affected Surfaces</p>
                    <div className="flex flex-wrap gap-1">{plan.targetSurfaces.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 mt-2">Affected Services</p>
                    <div className="flex flex-wrap gap-1">{plan.affectedServices.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
                  </div>
                </div>

                {/* Verification Gates */}
                {plan.verificationGates.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Verification Gates</p>
                    <div className="grid grid-cols-3 gap-2">
                      {plan.verificationGates.map(g => (
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

                {/* Test Results */}
                {plan.testResults.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Test Results</p>
                    <div className="space-y-1">
                      {plan.testResults.map(t => (
                        <div key={t.name} className="flex items-center gap-2 text-xs">
                          {t.passed ? <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> : <XCircle className="h-3 w-3 text-destructive" />}
                          <span className="font-medium">{t.name}</span>
                          <span className="text-muted-foreground ml-auto">{t.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Evidence</p>
                  <div className="space-y-1">
                    {plan.evidence.map((e, i) => (
                      <div key={i} className="rounded-lg bg-muted/20 p-2 flex items-start gap-2">
                        <Badge variant="outline" className="text-[9px] shrink-0">{e.type}</Badge>
                        <p className="text-xs">{e.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review */}
                {plan.reviewedBy && (
                  <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-3">
                    <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider font-semibold mb-1">Review</p>
                    <p className="text-xs">Reviewed by: {plan.reviewedBy}</p>
                    {plan.reviewNotes && <p className="text-xs text-muted-foreground">{plan.reviewNotes}</p>}
                  </div>
                )}

                {/* Autonomy & Confidence */}
                <div className="flex items-center gap-4 pt-2 border-t border-border/20">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs">Autonomy: <strong>{plan.autonomy.replace(/_/g, " ")}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs">Scope: <strong>{plan.deploymentScope}</strong></span>
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
