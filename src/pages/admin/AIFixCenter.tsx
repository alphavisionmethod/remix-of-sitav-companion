import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Bug, AlertTriangle, CheckCircle2, Wrench, Shield, RotateCcw, Sparkles, FileCheck, Eye } from "lucide-react";

const FIXES = [
  { id: 1, title: "Elevated 500 errors on /api/projections/rebuild", area: "Backend — Projection Service", severity: "critical" as const, rootCause: "Cache invalidation race condition during concurrent rebuilds", patch: "Add mutex lock on projection rebuild queue", confidence: 87, testImpact: "3 tests affected", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 14 },
  { id: 2, title: "Broken navigation on /admin/durability", area: "Frontend — Admin Routes", severity: "high" as const, rootCause: "Missing lazy import after route restructuring", patch: "Add lazy import and Route entry for AdminDurabilityBoard", confidence: 96, testImpact: "1 route test", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 1 },
  { id: 3, title: "Stale brand kit colors in white-label preview", area: "Frontend — Brand Kit", severity: "medium" as const, rootCause: "CDN cache not invalidated on brand kit update", patch: "Add cache-busting query param on brand asset URLs", confidence: 82, testImpact: "No existing tests", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 3 },
  { id: 4, title: "Accessibility: missing aria-labels on sidebar icons", area: "Frontend — Shell Layout", severity: "medium" as const, rootCause: "Icon-only buttons without accessible names", patch: "Add aria-label props to all SidebarMenuButton icon items", confidence: 94, testImpact: "0 tests (needs new)", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 8 },
  { id: 5, title: "Slow page load on Revenue Office (>3s)", area: "Frontend — Revenue Office", severity: "high" as const, rootCause: "Synchronous import of all 30+ sub-pages in RevenueGate", patch: "Convert to lazy imports with code splitting", confidence: 78, testImpact: "Route tests need update", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 2 },
  { id: 6, title: "API mismatch: advisor response missing 'reasoning' field", area: "Backend — Advisor API", severity: "medium" as const, rootCause: "Edge function schema drift after recent advisor update", patch: "Add reasoning field to response serializer", confidence: 89, testImpact: "2 integration tests", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 1 },
  { id: 7, title: "Visual drift: card border radius inconsistency", area: "Frontend — Design System", severity: "low" as const, rootCause: "Mixed rounded-lg and rounded-xl in admin cards", patch: "Standardize to rounded-xl across admin surfaces", confidence: 92, testImpact: "Visual regression only", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 12 },
];

const severityColors: Record<string, string> = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-amber-500/30 bg-amber-500/5",
  medium: "border-border/40",
  low: "border-border/40",
};

const AIFixCenter = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Bug} title="Fix Center" subtitle="Detected issues, root cause analysis, proposed patches, and auto-fix eligibility" accent="destructive" />

      <div className="grid grid-cols-5 gap-3">
        {[
          { l: "Critical", v: FIXES.filter(f => f.severity === "critical").length, c: "text-destructive" },
          { l: "High", v: FIXES.filter(f => f.severity === "high").length, c: "text-amber-500" },
          { l: "Medium", v: FIXES.filter(f => f.severity === "medium").length, c: "text-foreground" },
          { l: "Auto-Fix Eligible", v: FIXES.filter(f => f.autoFixEligible).length, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Avg Confidence", v: `${Math.round(FIXES.reduce((a,f) => a + f.confidence, 0) / FIXES.length)}%`, c: "text-primary" },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className={`text-xl font-bold ${c.c}`}>{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {FIXES.map(f => (
          <div key={f.id} className={`rounded-xl border bg-card transition-all ${severityColors[f.severity]}`}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Bug className={`h-4 w-4 ${f.severity === "critical" ? "text-destructive" : f.severity === "high" ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className="text-sm font-semibold">{f.title}</span>
                  <Badge variant={f.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{f.severity}</Badge>
                  {f.autoFixEligible && <Badge variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))] border-[hsl(var(--trust-safe))]/30">Auto-fix eligible</Badge>}
                </div>
                <span className="text-sm font-bold">{f.confidence}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{f.area} · {f.cluster} similar errors</p>
            </div>

            {expanded === f.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Root Cause</p>
                    <p className="text-sm">{f.rootCause}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Suggested Patch</p>
                    <p className="text-sm font-mono text-primary">{f.patch}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileCheck className="h-3 w-3" /> {f.testImpact}</span>
                  <span className="flex items-center gap-1">{f.approvalNeeded ? <AlertTriangle className="h-3 w-3 text-amber-500" /> : <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" />} {f.approvalNeeded ? "Approval needed" : "No approval needed"}</span>
                  <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> {f.rollbackSafe ? "Rollback safe" : "No rollback"}</span>
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Confidence: {f.confidence}%</span>
                </div>
                <Progress value={f.confidence} className="h-1.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIFixCenter;
