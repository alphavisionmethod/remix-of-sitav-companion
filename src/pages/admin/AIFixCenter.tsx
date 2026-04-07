import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Bug, AlertTriangle, CheckCircle2, Wrench, Shield, RotateCcw, Sparkles, FileCheck, Eye, Code, Server, Layout } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const FIXES = [
  { id: 1, title: "Elevated 500 errors on /api/projections/rebuild", area: "Backend — Projection Service", severity: "critical" as const, rootCause: "Cache invalidation race condition during concurrent rebuilds", patch: "Add mutex lock on projection rebuild queue", confidence: 87, testImpact: "3 tests affected", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 14, blastRadius: "surface" as const, reproducibility: "always" as const, affectedRoutes: ["/admin/projections", "/boardroom"], affectedComponents: ["ProjectionService", "CacheLayer"], affectedServices: ["projection-service", "cache-layer", "rebuild-edge-fn"], environment: "production" },
  { id: 2, title: "Broken navigation on /admin/durability", area: "Frontend — Admin Routes", severity: "high" as const, rootCause: "Missing lazy import after route restructuring", patch: "Add lazy import and Route entry for AdminDurabilityBoard", confidence: 96, testImpact: "1 route test", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 1, blastRadius: "isolated" as const, reproducibility: "always" as const, affectedRoutes: ["/admin/durability"], affectedComponents: ["App.tsx"], affectedServices: ["frontend-router"], environment: "all" },
  { id: 3, title: "Stale brand kit colors in white-label preview", area: "Frontend — Brand Kit", severity: "medium" as const, rootCause: "CDN cache not invalidated on brand kit update", patch: "Add cache-busting query param on brand asset URLs", confidence: 82, testImpact: "No existing tests", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 3, blastRadius: "component" as const, reproducibility: "frequent" as const, affectedRoutes: ["/white-label/*"], affectedComponents: ["BrandKitPreview"], affectedServices: ["cdn", "brand-service"], environment: "staging" },
  { id: 4, title: "Accessibility: missing aria-labels on sidebar icons", area: "Frontend — Shell Layout", severity: "medium" as const, rootCause: "Icon-only buttons without accessible names", patch: "Add aria-label props to all SidebarMenuButton icon items", confidence: 94, testImpact: "0 tests (needs new)", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 8, blastRadius: "component" as const, reproducibility: "always" as const, affectedRoutes: ["/*"], affectedComponents: ["AppSidebar", "SidebarMenuButton"], affectedServices: ["frontend-shell"], environment: "all" },
  { id: 5, title: "Slow page load on Revenue Office (>3s)", area: "Frontend — Revenue Office", severity: "high" as const, rootCause: "Synchronous import of all 30+ sub-pages in RevenueGate", patch: "Convert to lazy imports with code splitting", confidence: 78, testImpact: "Route tests need update", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 2, blastRadius: "surface" as const, reproducibility: "always" as const, affectedRoutes: ["/revenue-office/*"], affectedComponents: ["RevenueGate"], affectedServices: ["frontend-router"], environment: "all" },
  { id: 6, title: "API mismatch: advisor response missing 'reasoning' field", area: "Backend — Advisor API", severity: "medium" as const, rootCause: "Edge function schema drift after recent advisor update", patch: "Add reasoning field to response serializer", confidence: 89, testImpact: "2 integration tests", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 1, blastRadius: "component" as const, reproducibility: "always" as const, affectedRoutes: ["/api/advisor/*"], affectedComponents: ["AdvisorResponseSerializer"], affectedServices: ["advisor-edge-fn"], environment: "staging" },
  { id: 7, title: "Visual drift: card border radius inconsistency", area: "Frontend — Design System", severity: "low" as const, rootCause: "Mixed rounded-lg and rounded-xl in admin cards", patch: "Standardize to rounded-xl across admin surfaces", confidence: 92, testImpact: "Visual regression only", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 12, blastRadius: "cross-surface" as const, reproducibility: "always" as const, affectedRoutes: ["/admin/*"], affectedComponents: ["AdminCards"], affectedServices: ["frontend-components"], environment: "all" },
];

const severityColors: Record<string, string> = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-amber-500/30 bg-amber-500/5",
  medium: "border-border/40",
  low: "border-border/40",
};

const blastRadiusColors: Record<string, string> = {
  isolated: "text-[hsl(var(--trust-safe))]",
  component: "text-primary",
  surface: "text-amber-500",
  "cross-surface": "text-destructive",
  "platform-wide": "text-destructive",
};

const AIFixCenter = () => {
  const [expanded, setExpanded] = useState<number | null>(1);
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("severity");

  const filtered = tab === "all" ? FIXES :
    tab === "critical" ? FIXES.filter(f => f.severity === "critical") :
    tab === "auto-fix" ? FIXES.filter(f => f.autoFixEligible) :
    tab === "approval" ? FIXES.filter(f => f.approvalNeeded) :
    FIXES;

  const sorted = view === "severity" ? filtered :
    view === "confidence" ? [...filtered].sort((a, b) => b.confidence - a.confidence) :
    view === "blast" ? [...filtered].sort((a, b) => {
      const order = ["isolated", "component", "surface", "cross-surface", "platform-wide"];
      return order.indexOf(b.blastRadius) - order.indexOf(a.blastRadius);
    }) :
    filtered;

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Bug} title="Fix Center" subtitle="Issue clusters, root cause analysis, patches, blast radius, auto-fix eligibility, and rollback readiness" accent="destructive" />

      <div className="grid grid-cols-6 gap-2">
        {[
          { l: "Critical", v: FIXES.filter(f => f.severity === "critical").length, c: "text-destructive" },
          { l: "High", v: FIXES.filter(f => f.severity === "high").length, c: "text-amber-500" },
          { l: "Medium", v: FIXES.filter(f => f.severity === "medium").length, c: "text-foreground" },
          { l: "Low", v: FIXES.filter(f => f.severity === "low").length, c: "text-muted-foreground" },
          { l: "Auto-Fix Eligible", v: FIXES.filter(f => f.autoFixEligible).length, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Avg Confidence", v: `${Math.round(FIXES.reduce((a,f) => a + f.confidence, 0) / FIXES.length)}%`, c: "text-primary" },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className={`text-lg font-bold ${c.c}`}>{c.v}</p>
            <p className="text-[10px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="auto-fix">Auto-Fix</TabsTrigger>
            <TabsTrigger value="approval">Needs Approval</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-1">
          {(["severity", "confidence", "blast"] as const).map(v => (
            <Badge key={v} variant={view === v ? "default" : "outline"} className="text-[10px] cursor-pointer" onClick={() => setView(v)}>
              By {v}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map(f => (
          <div key={f.id} className={`rounded-xl border bg-card transition-all overflow-hidden ${severityColors[f.severity]}`}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Bug className={`h-4 w-4 ${f.severity === "critical" ? "text-destructive" : f.severity === "high" ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className="text-sm font-semibold">{f.title}</span>
                  <Badge variant={f.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{f.severity}</Badge>
                  {f.autoFixEligible && <Badge variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))] border-[hsl(var(--trust-safe))]/30">Auto-fix eligible</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${blastRadiusColors[f.blastRadius]}`}>{f.blastRadius}</Badge>
                  <span className="text-sm font-bold">{f.confidence}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{f.area} · {f.cluster} similar errors · {f.reproducibility} · {f.environment}</p>
            </div>

            {expanded === f.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-3">
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

                {/* Blast Radius Map */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Blast Radius</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Routes</p>
                      <div className="flex flex-wrap gap-1">
                        {f.affectedRoutes.map(r => <Badge key={r} variant="outline" className="text-[9px] font-mono">{r}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Components</p>
                      <div className="flex flex-wrap gap-1">
                        {f.affectedComponents.map(c => <Badge key={c} variant="outline" className="text-[9px]">{c}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Services</p>
                      <div className="flex flex-wrap gap-1">
                        {f.affectedServices.map(s => <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Row */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileCheck className="h-3 w-3" /> {f.testImpact}</span>
                  <span className="flex items-center gap-1">{f.approvalNeeded ? <AlertTriangle className="h-3 w-3 text-amber-500" /> : <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" />} {f.approvalNeeded ? "Approval needed" : "No approval needed"}</span>
                  <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> {f.rollbackSafe ? "Rollback safe" : "No rollback"}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Reproducibility: {f.reproducibility}</span>
                  <span className="flex items-center gap-1"><Server className="h-3 w-3" /> Env: {f.environment}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-muted-foreground">Confidence</span>
                      <span className="text-xs font-bold">{f.confidence}%</span>
                    </div>
                    <Progress value={f.confidence} className="h-1.5" />
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

export default AIFixCenter;
