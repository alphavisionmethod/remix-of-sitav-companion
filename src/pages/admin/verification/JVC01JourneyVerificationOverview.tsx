// ═══════════════════════════════════════════════════════
// SITA OS — JVC01: Journey Verification Overview
// Executive behavioral health dashboard
// ═══════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useVerificationSurfaces, useVerificationRuns, useVerificationBlockers } from "@/lib/verification/verification-hooks";
import { SURFACE_REGISTRY, getVerificationStats } from "@/lib/verification/surface-registry";
import { CUSTOMER_JOURNEY_REGISTRY, getLaunchBlockerJourneys } from "@/lib/customer-journey/journey-registry";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, CheckCircle2, XCircle, MousePointerClick, Monitor,
  ArrowRight, Shield, Keyboard, FileText, Layers, Radar, Play, BarChart3, Target, Zap
} from "lucide-react";

const SUB_PAGES = [
  { label: "Interaction Registry", path: "/admin/verification/surfaces", icon: Layers },
  { label: "Journey Manifests", path: "/admin/verification/p0-journeys", icon: Play },
  { label: "Button & CTA Health", path: "/admin/verification/buttons", icon: MousePointerClick },
  { label: "Redirect Integrity", path: "/admin/verification/redirects", icon: ArrowRight },
  { label: "Page Load Integrity", path: "/admin/verification/page-load", icon: Monitor },
  { label: "Form Verification", path: "/admin/verification/forms", icon: FileText },
  { label: "Modal / Drawer Board", path: "/admin/verification/modals", icon: Layers },
  { label: "Keyboard & Commands", path: "/admin/verification/keyboard", icon: Keyboard },
  { label: "Runtime Probes", path: "/admin/verification/probes", icon: Radar },
  { label: "Journey Replay", path: "/admin/verification/replay", icon: Play },
  { label: "Behavior Coverage", path: "/admin/verification/coverage", icon: BarChart3 },
  { label: "Interaction Drift", path: "/admin/verification/drift", icon: Activity },
  { label: "Launch Interaction Gate", path: "/admin/verification/launch-gate", icon: Target },
];

export default function JVC01JourneyVerificationOverview() {
  const navigate = useNavigate();
  const { data: dbSurfaces } = useVerificationSurfaces();
  const { data: runs } = useVerificationRuns();
  const { data: blockers } = useVerificationBlockers();
  const stats = getVerificationStats();

  const surfaces = dbSurfaces || [];
  const passed = surfaces.filter((s: Record<string, any>) => s.verification_status === "pass").length;
  const failed = surfaces.filter((s: Record<string, any>) => s.verification_status === "fail").length;
  const untested = Math.max(0, stats.total - passed - failed);
  const overallCoverage = stats.total > 0 ? Math.round((passed / stats.total) * 100) : 0;

  // By surface class
  const classBreakdown = useMemo(() => {
    const surfaceMap = new Map<string, Record<string, any>>();
    surfaces.forEach((s: Record<string, any>) => surfaceMap.set(s.route_key, s));
    const classes = ["page", "button", "form", "modal", "redirect", "keyboard_shortcut", "command_palette"];
    return classes.map((cls) => {
      const group = SURFACE_REGISTRY.filter((s) => s.surfaceClass === cls);
      const groupPassed = group.filter((s) => surfaceMap.get(s.routeKey)?.verification_status === "pass").length;
      const groupFailed = group.filter((s) => surfaceMap.get(s.routeKey)?.verification_status === "fail").length;
      return { cls, total: group.length, passed: groupPassed, failed: groupFailed };
    }).filter((c) => c.total > 0);
  }, [surfaces]);

  // P0 health
  const p0Surfaces = SURFACE_REGISTRY.filter((s) => s.testPriority === "P0");
  const p0SurfaceMap = useMemo(() => {
    const m = new Map<string, Record<string, any>>();
    surfaces.forEach((s: Record<string, any>) => m.set(s.route_key, s));
    return m;
  }, [surfaces]);
  const p0Passed = p0Surfaces.filter((s) => p0SurfaceMap.get(s.routeKey)?.verification_status === "pass").length;
  const p0Failed = p0Surfaces.filter((s) => p0SurfaceMap.get(s.routeKey)?.verification_status === "fail").length;

  // Journey stats
  const totalJourneys = CUSTOMER_JOURNEY_REGISTRY.length;
  const blockerJourneys = getLaunchBlockerJourneys().length;

  // Recent runs
  const recentRuns = (runs || []).slice(0, 8);
  const activeBlockers = (blockers || []).length;

  return (
    <div className="space-y-6 p-6" data-testid="jvc01-overview">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          JVC01 — Journey Verification Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Executive behavioral health — interactions, journeys, coverage, drift, and launch readiness
        </p>
      </div>

      {/* Behavioral Health Overview Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-[10px] text-muted-foreground">Interactions</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{passed}</div>
          <div className="text-[10px] text-muted-foreground">Passing</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{failed}</div>
          <div className="text-[10px] text-muted-foreground">Failing</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-muted-foreground">{untested}</div>
          <div className="text-[10px] text-muted-foreground">Untested</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold">{overallCoverage}%</div>
          <div className="text-[10px] text-muted-foreground">Coverage</div>
          <Progress value={overallCoverage} className="mt-1 h-1" />
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{totalJourneys}</div>
          <div className="text-[10px] text-muted-foreground">Journeys</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-amber-500">{blockerJourneys}</div>
          <div className="text-[10px] text-muted-foreground">Blocker Journeys</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{activeBlockers}</div>
          <div className="text-[10px] text-muted-foreground">Active Blockers</div>
        </CardContent></Card>
      </div>

      {/* P0 Critical Lane */}
      <Card className={p0Failed > 0 ? "border-destructive/50" : "border-green-500/30"}>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            P0 Critical Surface Health
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-lg font-bold text-green-500">{p0Passed}</span>
              <span className="text-xs text-muted-foreground">pass</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-lg font-bold text-destructive">{p0Failed}</span>
              <span className="text-xs text-muted-foreground">fail</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-bold">{p0Surfaces.length - p0Passed - p0Failed}</span>
              <span className="text-xs text-muted-foreground">untested</span>
            </div>
            <Progress value={p0Surfaces.length > 0 ? (p0Passed / p0Surfaces.length) * 100 : 0} className="flex-1 h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Coverage by Surface Class */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Coverage by Interaction Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {classBreakdown.map((c) => (
              <div key={c.cls} className="p-3 border rounded bg-muted/20">
                <div className="font-mono text-xs text-primary mb-1">{c.cls}</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{c.total}</span>
                  <div className="flex-1">
                    <Progress value={c.total > 0 ? (c.passed / c.total) * 100 : 0} className="h-1" />
                  </div>
                </div>
                <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                  <span className="text-green-500">{c.passed} pass</span>
                  {c.failed > 0 && <span className="text-destructive">{c.failed} fail</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Verification Runs */}
      {recentRuns.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Recent Verification Activity
            </h3>
            <div className="space-y-1">
              {recentRuns.map((run: Record<string, any>) => (
                <div key={run.id} className="flex items-center gap-2 text-xs p-2 bg-muted/20 rounded">
                  {run.passed ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-destructive" />}
                  <span className="font-mono truncate flex-1">{run.surface_id?.slice(0, 8)}…</span>
                  <Badge variant="outline" className="text-[10px]">{run.run_type}</Badge>
                  <Badge variant="outline" className="text-[10px]">{run.mode}</Badge>
                  {run.duration_ms && <span className="text-muted-foreground">{run.duration_ms}ms</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-Pages Navigation */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Verification Workspaces</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {SUB_PAGES.map((page) => (
              <button
                key={page.path}
                onClick={() => navigate(page.path)}
                className="flex items-center gap-3 p-3 rounded border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-colors text-left"
              >
                <page.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium">{page.label}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
