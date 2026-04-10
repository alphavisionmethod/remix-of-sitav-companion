// ═══════════════════════════════════════════════════════
// SITA OS — JVC14: Launch Interaction Gate View
// Behavioral truth as launch gate
// ═══════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useVerificationSurfaces, useVerificationBlockers } from "@/lib/verification/verification-hooks";
import { SURFACE_REGISTRY, getVerificationStats } from "@/lib/verification/surface-registry";
import { CUSTOMER_JOURNEY_REGISTRY, getLaunchBlockerJourneys } from "@/lib/customer-journey/journey-registry";
import { fromTable } from "@/lib/supabase-helpers";
import {
  Target, Shield, CheckCircle2, XCircle, AlertTriangle, Rocket, Ban,
  MousePointerClick, ArrowRight, FileText, Keyboard, Radar, Monitor
} from "lucide-react";

type GateVerdict = "GO" | "NO_GO" | "CONDITIONAL";

export default function JVC14LaunchInteractionGate() {
  const { data: dbSurfaces } = useVerificationSurfaces();
  const { data: blockers } = useVerificationBlockers();
  const stats = getVerificationStats();

  const { data: probes } = useQuery({
    queryKey: ["runtime-probes-gate"],
    queryFn: async () => {
      const { data } = await fromTable("runtime_probes").select("*").limit(100);
      return data ?? [];
    },
  });

  const { data: probeRuns } = useQuery({
    queryKey: ["runtime-probe-runs-gate"],
    queryFn: async () => {
      const { data } = await fromTable("runtime_probe_runs").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  const surfaces = dbSurfaces || [];
  const surfaceMap = useMemo(() => {
    const m = new Map<string, Record<string, any>>();
    surfaces.forEach((s: Record<string, any>) => m.set(s.route_key, s));
    return m;
  }, [surfaces]);

  // P0 analysis
  const p0Surfaces = SURFACE_REGISTRY.filter((s) => s.testPriority === "P0");
  const p0Failing = p0Surfaces.filter((s) => surfaceMap.get(s.routeKey)?.verification_status === "fail");
  const p0Untested = p0Surfaces.filter((s) => {
    const status = surfaceMap.get(s.routeKey)?.verification_status;
    return !status || status === "untested";
  });
  const p0Passing = p0Surfaces.filter((s) => surfaceMap.get(s.routeKey)?.verification_status === "pass");

  // By critical class
  const criticalClasses = useMemo(() => {
    const classes = [
      { key: "button", label: "Buttons/CTAs", icon: MousePointerClick },
      { key: "form", label: "Forms", icon: FileText },
      { key: "redirect", label: "Redirects", icon: ArrowRight },
      { key: "page", label: "Pages", icon: Monitor },
      { key: "keyboard_shortcut", label: "Shortcuts", icon: Keyboard },
      { key: "command_palette", label: "Commands", icon: Keyboard },
      { key: "modal", label: "Modals", icon: Target },
    ];
    return classes.map((c) => {
      const group = SURFACE_REGISTRY.filter((s) => s.surfaceClass === c.key && s.testPriority === "P0");
      const failing = group.filter((s) => surfaceMap.get(s.routeKey)?.verification_status === "fail");
      const passing = group.filter((s) => surfaceMap.get(s.routeKey)?.verification_status === "pass");
      return { ...c, total: group.length, passing: passing.length, failing: failing.length };
    }).filter((c) => c.total > 0);
  }, [surfaceMap]);

  // Probe gate
  const launchBlockingProbes = (probes || []).filter((p: Record<string, any>) => p.launch_impact === "blocks");
  const latestRunMap = useMemo(() => {
    const m = new Map<string, Record<string, any>>();
    (probeRuns || []).forEach((r: Record<string, any>) => {
      if (!m.has(r.probe_id)) m.set(r.probe_id, r);
    });
    return m;
  }, [probeRuns]);
  const failingBlockingProbes = launchBlockingProbes.filter((p: Record<string, any>) => {
    const run = latestRunMap.get(p.id);
    return run && run.status === "fail";
  });

  // Journey gate
  const blockerJourneys = getLaunchBlockerJourneys();

  // Active blockers
  const activeBlockers = (blockers || []).length;

  // Overall verdict
  const verdict: GateVerdict = useMemo(() => {
    if (p0Failing.length > 0 || failingBlockingProbes.length > 0 || activeBlockers > 0) return "NO_GO";
    if (p0Untested.length > p0Surfaces.length * 0.3) return "CONDITIONAL";
    return "GO";
  }, [p0Failing, p0Untested, p0Surfaces, failingBlockingProbes, activeBlockers]);

  const verdictConfig = {
    GO: { color: "text-green-500", bg: "bg-green-500/10 border-green-500/30", icon: Rocket, label: "GO — Launch Eligible" },
    NO_GO: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: Ban, label: "NO GO — Critical Failures" },
    CONDITIONAL: { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle, label: "CONDITIONAL — Insufficient Coverage" },
  };
  const vc = verdictConfig[verdict];

  return (
    <div className="space-y-6 p-6" data-testid="jvc14-launch-gate">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          JVC14 — Launch Interaction Gate
        </h1>
        <p className="text-muted-foreground mt-1">
          Behavioral truth as launch gate — P0 failures, probe health, journey integrity
        </p>
      </div>

      {/* Verdict Banner */}
      <Card className={`${vc.bg} border`}>
        <CardContent className="p-6 flex items-center gap-4">
          <vc.icon className={`h-12 w-12 ${vc.color}`} />
          <div>
            <div className={`text-2xl font-bold ${vc.color}`}>{vc.label}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {p0Failing.length} P0 failures · {p0Untested.length} untested · {failingBlockingProbes.length} failing probes · {activeBlockers} blockers
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold">{p0Surfaces.length > 0 ? Math.round((p0Passing.length / p0Surfaces.length) * 100) : 0}%</div>
            <div className="text-xs text-muted-foreground">P0 Pass Rate</div>
          </div>
        </CardContent>
      </Card>

      {/* Gate Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={p0Failing.length > 0 ? "border-destructive/40" : "border-green-500/30"}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" /> P0 Interaction Health
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Passing</span><span className="text-green-500 font-bold">{p0Passing.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Failing</span><span className="text-destructive font-bold">{p0Failing.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Untested</span><span className="font-bold">{p0Untested.length}</span>
              </div>
              <Progress value={p0Surfaces.length > 0 ? (p0Passing.length / p0Surfaces.length) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className={failingBlockingProbes.length > 0 ? "border-destructive/40" : "border-green-500/30"}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Radar className="h-4 w-4" /> Runtime Probe Gate
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Launch-blocking probes</span><span className="font-bold">{launchBlockingProbes.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Currently failing</span><span className="text-destructive font-bold">{failingBlockingProbes.length}</span>
              </div>
              <Badge variant={failingBlockingProbes.length === 0 ? "default" : "destructive"} className="text-xs">
                {failingBlockingProbes.length === 0 ? "All probes healthy" : `${failingBlockingProbes.length} blocking`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={activeBlockers > 0 ? "border-destructive/40" : "border-green-500/30"}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Active Blockers
            </h3>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-center">{activeBlockers}</div>
              <div className="text-xs text-muted-foreground text-center">unresolved verification blockers</div>
              <Badge variant={activeBlockers === 0 ? "default" : "destructive"} className="text-xs w-full justify-center">
                {activeBlockers === 0 ? "Clear" : "Blocking launch"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P0 Failures Detail */}
      {p0Failing.length > 0 && (
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Critical P0 Failures ({p0Failing.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {p0Failing.map((s) => (
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

      {/* Critical Class Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">P0 Gate by Interaction Type</h3>
          <div className="space-y-2">
            {criticalClasses.map((c) => (
              <div key={c.key} className="flex items-center gap-3">
                <c.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="w-24 text-xs font-medium">{c.label}</div>
                <Progress value={c.total > 0 ? (c.passing / c.total) * 100 : 0} className="flex-1 h-2" />
                <div className="w-16 text-right text-xs">
                  {c.passing}/{c.total}
                </div>
                {c.failing > 0 && <Badge variant="destructive" className="text-[10px]">{c.failing} fail</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Journey Blockers */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Launch/Pilot Blocker Journeys ({blockerJourneys.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {blockerJourneys.map((j) => (
              <div key={j.journeyKey} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded border">
                <Shield className="h-3 w-3 text-amber-500 shrink-0" />
                <span className="font-medium truncate">{j.displayName}</span>
                <Badge variant={j.launchImportance === "launch_blocker" ? "destructive" : "default"} className="text-[10px] ml-auto">
                  {j.launchImportance.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Promotion Eligibility */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Ring Promotion Eligibility</h3>
          <div className="grid grid-cols-3 gap-3">
            {["Ring 0 — Internal", "Ring 1 — Pilot", "Ring 2 — GA"].map((ring, i) => {
              const eligible = i === 0 ? verdict !== "NO_GO" : i === 1 ? verdict === "GO" : verdict === "GO" && activeBlockers === 0 && p0Untested.length === 0;
              return (
                <Card key={ring} className={eligible ? "border-green-500/30" : "border-destructive/30"}>
                  <CardContent className="p-3 text-center">
                    <div className="text-xs font-medium mb-1">{ring}</div>
                    {eligible ? (
                      <Badge variant="default" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Eligible</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs"><Ban className="h-3 w-3 mr-1" />Blocked</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
