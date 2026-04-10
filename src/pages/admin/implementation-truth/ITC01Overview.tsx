// ═══════════════════════════════════════════════════════════════
// ITC01 — Implementation Truth Overview
// ═══════════════════════════════════════════════════════════════

import { useSpecRegistry, useImplementationStats, useDriftDetection, STATUS_TIERS } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Shield, GitBranch, FileCheck, BarChart3, Radar, BookOpen, AlertTriangle, CheckCircle2, ArrowRight, Map, ShieldCheck, Route, Activity } from "lucide-react";

const SUB_PAGES = [
  { path: "/admin/implementation-truth/specs", label: "Spec Registry", icon: BookOpen, desc: "Canonical records of every major system" },
  { path: "/admin/implementation-truth/contracts", label: "Contract Verification", icon: FileCheck, desc: "Contract alignment & shadow detection" },
  { path: "/admin/implementation-truth/wiring", label: "Wiring Graph", icon: GitBranch, desc: "End-to-end trace from spec to proof" },
  { path: "/admin/implementation-truth/readiness", label: "Readiness Scorecards", icon: BarChart3, desc: "10-dimension per-feature scoring" },
  { path: "/admin/implementation-truth/drift", label: "Drift & Traceability", icon: Radar, desc: "Spec vs. implementation drift radar" },
  { path: "/admin/implementation-truth/map", label: "Implementation Map", icon: Map, desc: "Per-spec artifact inventory & presence" },
  { path: "/admin/implementation-truth/architecture", label: "Architecture Compliance", icon: ShieldCheck, desc: "17 architecture enforcement checks" },
  { path: "/admin/implementation-truth/routes", label: "Route Inventory", icon: Route, desc: "Unified route & component registry" },
  { path: "/admin/implementation-truth/runtime", label: "Runtime Evidence", icon: Activity, desc: "Live runtime signals per spec" },
];

export default function ITC01Overview() {
  const { data: specs, isLoading } = useSpecRegistry();
  const stats = useImplementationStats(specs);
  const { drifts, driftCount } = useDriftDetection(specs);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Implementation Truth Center</h1>
          <Badge variant="outline" className="text-[8px]">ITC</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Unified verification: spec → contract → wiring → runtime → proof</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Specs", value: stats.total },
          { label: "Avg Readiness", value: `${stats.avgReadiness}%` },
          { label: "Proven+", value: stats.byStatus.proven + stats.byStatus.launch_ready, cls: "text-green-500" },
          { label: "In Progress", value: stats.byStatus.partial + stats.byStatus.advanced_unwired, cls: "text-orange-500" },
          { label: "Drift Alerts", value: driftCount, cls: "text-destructive" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 text-center">
              <div className={`text-2xl font-bold ${m.cls || "text-foreground"}`}>{m.value}</div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Status Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {STATUS_TIERS.map(tier => {
              const count = stats.byStatus[tier.value] || 0;
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={tier.value} className="flex items-center gap-3">
                  <span className={`text-[10px] w-28 ${tier.color}`}>{tier.label}</span>
                  <Progress value={pct} className="flex-1 h-2" />
                  <span className="text-[10px] text-muted-foreground w-12 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Top Readiness Gaps</CardTitle></CardHeader>
          <CardContent>
            {stats.topGaps.length === 0 ? (
              <div className="text-[11px] text-muted-foreground py-4 text-center">No specs registered</div>
            ) : (
              <div className="space-y-2">
                {stats.topGaps.map(g => (
                  <div key={g.spec_id} className="flex items-center justify-between">
                    <span className="text-[11px] text-foreground">{g.canonical_name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={g.overall_readiness} className="w-20 h-1.5" />
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{g.overall_readiness}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radar className="h-4 w-4 text-orange-500" />Recent Drift Alerts</CardTitle></CardHeader>
          <CardContent>
            {drifts.length === 0 ? (
              <div className="flex items-center gap-2 text-[11px] text-green-500 py-4 justify-center">
                <CheckCircle2 className="h-3.5 w-3.5" /> No drift detected
              </div>
            ) : (
              <div className="space-y-2">
                {drifts.slice(0, 5).map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant={d.severity === "high" ? "destructive" : "secondary"} className="text-[8px] h-4 mt-0.5">{d.severity}</Badge>
                    <div>
                      <div className="text-[11px] font-medium text-foreground">{d.canonical_name}</div>
                      <div className="text-[10px] text-muted-foreground">{d.issue}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pb-4">
        {SUB_PAGES.map(p => (
          <Link key={p.path} to={p.path}>
            <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
              <CardContent className="pt-4">
                <p.icon className="h-5 w-5 text-primary mb-2" />
                <div className="text-sm font-medium text-foreground">{p.label}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{p.desc}</div>
                <ArrowRight className="h-3 w-3 text-muted-foreground mt-2" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
