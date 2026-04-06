import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { FileCheck, AlertTriangle, Shield, Eye, CheckCircle2, XCircle, Code, Palette, Wrench, RotateCcw } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const APPROVALS = [
  {
    id: 1, title: "Improve loading speed — admin shell code splitting", proposedBy: "Performance Optimizer", type: "code" as const,
    reason: "Admin shell loads 30+ pages synchronously, causing >3s initial load. Proposal converts to lazy imports with Suspense boundaries.",
    blastRadius: "medium", affectedAreas: ["Admin Shell", "Route Config", "8 admin pages"], confidence: 78,
    evidence: ["Lighthouse audit: 3.2s LCP", "Bundle analysis: 1.8MB admin chunk", "3 user-reported slow loads"],
    rollbackReady: true, testsNeeded: "Route tests need update for lazy boundaries",
    uncertainty: "Unknown interaction with existing ErrorBoundary wrappers"
  },
  {
    id: 2, title: "Redesign Mission Control header layout", proposedBy: "Design Engineer", type: "design" as const,
    reason: "Current header is flat and lacks visual hierarchy. Proposal adds gradient accent, icon badge, and action slot aligned with AdminPageHeader pattern.",
    blastRadius: "low", affectedAreas: ["Mission Control page"], confidence: 79,
    evidence: ["Design audit: inconsistent with other admin headers", "User feedback: 'hard to scan'"],
    rollbackReady: true, testsNeeded: "Visual regression snapshot",
    uncertainty: "Subjective design preference — may need user feedback"
  },
  {
    id: 3, title: "Add smoke gate for auth flow before production deploy", proposedBy: "Release Manager", type: "ops" as const,
    reason: "No automated auth flow check exists in promotion pipeline. Two recent deploys broke login for 5-15 minutes before detection.",
    blastRadius: "low", affectedAreas: ["CI/CD pipeline", "Deploy workflow"], confidence: 88,
    evidence: ["Incident #147: broken login 15m", "Incident #152: broken OAuth 5m", "No auth smoke test in pipeline"],
    rollbackReady: true, testsNeeded: "Smoke test implementation",
    uncertainty: "Auth flow depends on Supabase availability during test"
  },
  {
    id: 4, title: "Fix projection cache race condition", proposedBy: "Backend Engineer", type: "code" as const,
    reason: "Concurrent projection rebuilds cause cache corruption. Proposal adds Redis-based mutex lock with 30s TTL.",
    blastRadius: "high", affectedAreas: ["Projection Service", "Cache Layer", "3 edge functions"], confidence: 87,
    evidence: ["14 error cluster in last 48h", "Race condition reproduced in staging", "Stack trace: concurrent write conflict"],
    rollbackReady: false, testsNeeded: "Integration tests for concurrent rebuilds",
    uncertainty: "Mutex lock may increase rebuild latency by 200-500ms under load"
  },
];

const typeIcons: Record<string, typeof Code> = { code: Code, design: Palette, ops: Wrench };

const AIApprovalDesk = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={FileCheck} title="Approval & Safety Desk" subtitle="High-impact changes requiring review — evidence, blast radius, rollback readiness" accent="trust" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Awaiting Approval", v: APPROVALS.length, c: "text-amber-500" },
          { l: "High Blast Radius", v: APPROVALS.filter(a => a.blastRadius === "high").length, c: "text-destructive" },
          { l: "Rollback Ready", v: APPROVALS.filter(a => a.rollbackReady).length, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Avg Confidence", v: `${Math.round(APPROVALS.reduce((a,ap) => a + ap.confidence, 0) / APPROVALS.length)}%`, c: "text-primary" },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className={`text-xl font-bold ${c.c}`}>{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {APPROVALS.map(a => {
          const TypeIcon = typeIcons[a.type] || Code;
          return (
            <div key={a.id} className={`rounded-xl border bg-card ${a.blastRadius === "high" ? "border-amber-500/30" : "border-border/40"}`}>
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{a.title}</span>
                    <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                    <Badge variant={a.blastRadius === "high" ? "destructive" : a.blastRadius === "medium" ? "outline" : "secondary"} className="text-[10px]">{a.blastRadius} blast radius</Badge>
                  </div>
                  <span className="text-sm font-bold">{a.confidence}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Proposed by: {a.proposedBy}</p>
              </div>

              {expanded === a.id && (
                <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Why This Change</p>
                    <p className="text-sm">{a.reason}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Evidence ({a.evidence.length} items)</p>
                    <ul className="space-y-1">
                      {a.evidence.map((e, i) => (
                        <li key={i} className="text-xs flex items-start gap-2"><CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))] mt-0.5 shrink-0" />{e}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Affected Areas</p>
                      <div className="flex flex-wrap gap-1">{a.affectedAreas.map(area => <Badge key={area} variant="outline" className="text-[10px]">{area}</Badge>)}</div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tests Needed</p>
                      <p className="text-xs">{a.testsNeeded}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-xs">
                      {a.rollbackReady ? <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-3 w-3 text-destructive" />}
                      {a.rollbackReady ? "Rollback ready" : "No rollback path"}
                    </div>
                  </div>
                  {a.uncertainty && (
                    <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-2">
                      <p className="text-xs text-amber-500 flex items-start gap-1"><AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> Uncertainty: {a.uncertainty}</p>
                    </div>
                  )}
                  <Progress value={a.confidence} className="h-1.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIApprovalDesk;
