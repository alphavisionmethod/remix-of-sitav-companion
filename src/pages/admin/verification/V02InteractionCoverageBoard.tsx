// ═══════════════════════════════════════════════════════
// SITA OS — V02: Interaction Coverage Board
// Full coverage analysis: by priority, surface class, probed vs tested
// ═══════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useVerificationSurfaces, useVerificationRuns } from "@/lib/verification/verification-hooks";
import { SURFACE_REGISTRY, getVerificationStats, type SurfaceEntry, type TestPriority, type SurfaceClass } from "@/lib/verification/surface-registry";
import { CheckCircle2, XCircle, MinusCircle, BarChart3, AlertTriangle, Shield, Target } from "lucide-react";

function coveragePct(passed: number, total: number) {
  return total > 0 ? Math.round((passed / total) * 100) : 0;
}

export default function InteractionCoverageBoard() {
  const { data: dbSurfaces } = useVerificationSurfaces();
  const { data: runs } = useVerificationRuns();
  const surfaces = dbSurfaces && dbSurfaces.length > 0 ? dbSurfaces : [];
  const stats = getVerificationStats();

  const passed = surfaces.filter((s: Record<string, any>) => s.verification_status === "pass").length;
  const failed = surfaces.filter((s: Record<string, any>) => s.verification_status === "fail").length;
  const untested = Math.max(0, stats.total - passed - failed);
  const coverage = coveragePct(passed, stats.total);

  // Surfaces with at least one run (tested)
  const testedSurfaceIds = useMemo(() => {
    const s = new Set<string>();
    (runs || []).forEach((r: Record<string, any>) => s.add(r.surface_id));
    return s;
  }, [runs]);

  const surfaceMap = useMemo(() => {
    const m = new Map<string, Record<string, any>>();
    (dbSurfaces || []).forEach((s: Record<string, any>) => m.set(s.route_key, s));
    return m;
  }, [dbSurfaces]);

  // By priority breakdown
  const priorityBreakdown = useMemo(() => {
    const priorities: TestPriority[] = ["P0", "P1", "P2"];
    return priorities.map((p) => {
      const group = SURFACE_REGISTRY.filter((s) => s.testPriority === p);
      const groupPassed = group.filter((s) => surfaceMap.get(s.routeKey)?.verification_status === "pass").length;
      return { priority: p, total: group.length, passed: groupPassed, pct: coveragePct(groupPassed, group.length) };
    });
  }, [surfaceMap]);

  // By surface class breakdown
  const classBreakdown = useMemo(() => {
    const classes: SurfaceClass[] = ["page", "button", "form", "modal", "drawer", "keyboard_shortcut", "command_palette", "redirect", "toggle", "upload", "ai_input", "tab", "navigation", "card_action"];
    return classes
      .map((c) => {
        const group = SURFACE_REGISTRY.filter((s) => s.surfaceClass === c);
        if (group.length === 0) return null;
        const groupPassed = group.filter((s) => surfaceMap.get(s.routeKey)?.verification_status === "pass").length;
        return { cls: c, total: group.length, passed: groupPassed, pct: coveragePct(groupPassed, group.length) };
      })
      .filter(Boolean) as { cls: string; total: number; passed: number; pct: number }[];
  }, [surfaceMap]);

  // Critical uncovered P0s
  const uncoveredP0 = useMemo(() => {
    return SURFACE_REGISTRY.filter((s) => {
      if (s.testPriority !== "P0") return false;
      const db = surfaceMap.get(s.routeKey);
      return !db || db.verification_status === "untested";
    });
  }, [surfaceMap]);

  // Domain breakdown
  const domains = [...new Set(SURFACE_REGISTRY.map((s) => s.domain))];
  const domainCoverage = domains.map((d) => {
    const domainSurfaces = SURFACE_REGISTRY.filter((s) => s.domain === d);
    const dbDomain = surfaces.filter((s: Record<string, any>) => s.domain === d);
    const domainPassed = dbDomain.filter((s: Record<string, any>) => s.verification_status === "pass").length;
    return { domain: d, total: domainSurfaces.length, passed: domainPassed, pct: coveragePct(domainPassed, domainSurfaces.length) };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 p-6" data-testid="verification-coverage-board">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          V02 — Interaction Coverage Board
        </h1>
        <p className="text-muted-foreground mt-1">Full coverage analysis across priorities, surface classes, and domains</p>
      </div>

      {/* Overall KPI */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-primary">{coverage}%</div><div className="text-xs text-muted-foreground">Overall Coverage</div><Progress value={coverage} className="mt-2" /></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-500" /><div><div className="text-2xl font-bold text-green-500">{passed}</div><div className="text-xs text-muted-foreground">Passed</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><XCircle className="h-8 w-8 text-destructive" /><div><div className="text-2xl font-bold text-destructive">{failed}</div><div className="text-xs text-muted-foreground">Failed</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><MinusCircle className="h-8 w-8 text-muted-foreground" /><div><div className="text-2xl font-bold">{untested}</div><div className="text-xs text-muted-foreground">Untested</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Target className="h-8 w-8 text-amber-500" /><div><div className="text-2xl font-bold text-amber-500">{testedSurfaceIds.size}</div><div className="text-xs text-muted-foreground">With Runs</div></div></CardContent></Card>
      </div>

      {/* Priority Breakdown */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Coverage by Priority
          </h3>
          {priorityBreakdown.map((p) => (
            <div key={p.priority} className="flex items-center gap-3">
              <Badge variant={p.priority === "P0" ? "destructive" : p.priority === "P1" ? "default" : "secondary"} className="w-12 justify-center">{p.priority}</Badge>
              <Progress value={p.pct} className="flex-1" />
              <div className="w-16 text-right text-sm font-mono">{p.pct}%</div>
              <div className="w-20 text-right text-xs text-muted-foreground">{p.passed}/{p.total}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Surface Class Breakdown */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg">Coverage by Surface Class</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classBreakdown.map((c) => (
              <div key={c.cls} className="flex items-center gap-3">
                <div className="w-32 text-sm font-mono">{c.cls}</div>
                <Progress value={c.pct} className="flex-1" />
                <div className="w-16 text-right text-sm">{c.pct}%</div>
                <div className="w-12 text-right text-xs text-muted-foreground">{c.passed}/{c.total}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Uncovered P0s */}
      {uncoveredP0.length > 0 && (
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Critical Uncovered P0 Surfaces ({uncoveredP0.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {uncoveredP0.map((s) => (
                <div key={s.routeKey} className="flex items-center gap-2 text-xs p-2 bg-destructive/5 rounded border border-destructive/20">
                  <XCircle className="h-3 w-3 text-destructive shrink-0" />
                  <span className="font-mono truncate">{s.routeKey}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">{s.surfaceClass}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain Breakdown */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg">Coverage by Domain</h3>
          {domainCoverage.map((d) => (
            <div key={d.domain} className="flex items-center gap-3">
              <div className="w-40 text-sm font-mono">{d.domain}</div>
              <Progress value={d.pct} className="flex-1" />
              <div className="w-20 text-right text-sm">
                <Badge variant={d.pct === 100 ? "default" : d.pct > 0 ? "outline" : "secondary"}>{d.pct}%</Badge>
              </div>
              <div className="w-16 text-right text-xs text-muted-foreground">{d.passed}/{d.total}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
