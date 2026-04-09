// ═══════════════════════════════════════════════════════
// SITA OS — CJ01: Customer Journey Executive Report
// Proof confidence distribution, mismatch count, surface breakdown
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustomerJourneys, useSeedJourneys, useJourneyStats, useCustomerJourneyBlockers } from "@/lib/customer-journey/journey-hooks";
import { useJourneySummaryView, useSeedJourneyRegistry, useRecentFailures, useModeDeltas } from "@/lib/customer-journey/journey-ingestion-hooks";
import { JOURNEY_STATUS_CONFIG, LAUNCH_IMPACT_CONFIG } from "@/lib/customer-journey/journey-registry";
import { ClipboardCheck, AlertTriangle, Shield, BarChart3, Loader2, Database, GitCompare, Clock } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";
import { useDataMode } from "@/contexts/DataModeContext";


interface CJ01ExecutiveReportRow {
  blocker_type?: unknown;
  claim_risk?: unknown;
  commit_sha?: unknown;
  current_status?: unknown;
  domain?: string;
  domain_family?: unknown;
  environment?: unknown;
  id?: string;
  journey_key?: unknown;
  last_v?: unknown;
  last_verified_at?: unknown;
  message?: string;
  mode?: unknown;
  resolved?: unknown;
  run_id?: unknown;
  steps_failed?: unknown;
  summary?: unknown;
}

const PROOF_LABELS: Record<string, { label: string; color: string }> = {
  verified_e2e: { label: "E2E Verified", color: "bg-emerald-500" },
  verified_interaction: { label: "Interaction", color: "bg-blue-500" },
  verified_component_only: { label: "Component", color: "bg-amber-500" },
  manually_confirmed: { label: "Manual", color: "bg-purple-500" },
  unverified: { label: "Unverified", color: "bg-muted-foreground" },
};

export default function CJ01ExecutiveReport() {
  const { isDemoMode } = useDataMode();
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: blockers } = useCustomerJourneyBlockers();
  const { data: summaryView } = useJourneySummaryView();
  const { data: recentFailures } = useRecentFailures();
  const { data: modeDeltas } = useModeDeltas();
  const seedMutation = useSeedJourneys();
  const seedRegistryMutation = useSeedJourneyRegistry();
  const stats = useJourneyStats();

  const handleSeed = () => {
    seedMutation.mutate(undefined, {
      onSuccess: (count) => toast.success(`Seeded ${count} journeys from registry`),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleSeedRegistry = () => {
    seedRegistryMutation.mutate(undefined, {
      onSuccess: (result) => toast.success(`Seeded ${result.registryCount} registry entries + ${result.statusCount} status rows`),
      onError: (e: CJ01ExecutiveReportRow) => toast.error(e.message),
    });
  };

  const unresolvedBlockers = (blockers ?? []).filter((b: CJ01ExecutiveReportRow) => !b.resolved);

  const viewJourneys = summaryView ?? [];
  const hasViewData = viewJourneys.length > 0;

  const viewStatuses = useMemo(() => {
    return (hasViewData ? viewJourneys : journeys ?? []).reduce((acc: Record<string, number>, j: any) => {
      const s = j.current_status || "unverified";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
  }, [viewJourneys, journeys, hasViewData]);

  // Proof confidence distribution
  const proofDist = useMemo(() => {
    const source = hasViewData ? viewJourneys : (journeys ?? []);
    return source.reduce((acc: Record<string, number>, j: any) => {
      const p = j.proof_confidence || "unverified";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
  }, [viewJourneys, journeys, hasViewData]);

  const totalJourneys = hasViewData ? viewJourneys.length : stats.total;

  // Surface class breakdown
  const surfaceBreakdown = useMemo(() => {
    const source = hasViewData ? viewJourneys : (journeys ?? []);
    const map: Record<string, { total: number; working: number }> = {};
    for (const j of source) {
      const jr = j as Record<string, unknown>;
      const s = String(jr.surface_class || "web_app");
      if (!map[s]) map[s] = { total: 0, working: 0 };
      map[s].total++;
      if (jr.current_status === "working") map[s].working++;
    }
    return Object.entries(map).map(([surface, stats]) => ({
      surface,
      ...stats,
      score: stats.total > 0 ? Math.round((stats.working / stats.total) * 100) : 0,
    }));
  }, [viewJourneys, journeys, hasViewData]);

  // Real vs demo mismatch count
  const mismatchCount = (modeDeltas ?? []).filter((d: CJ01ExecutiveReportRow) => d.claim_risk).length;

  // Domain scores
  const domainScores = useMemo(() => {
    const source = hasViewData ? viewJourneys : (journeys ?? []);
    const domains: string[] = Array.from(new Set<string>(source.map((j: CJ01ExecutiveReportRow) => (j.domain_family || j.domain))));
    return domains.map((d) => {
      const dj = source.filter((j: CJ01ExecutiveReportRow) => (j.domain_family || j.domain) === d);
      const working = dj.filter((j: CJ01ExecutiveReportRow) => j.current_status === "working").length;
      return { domain: d, total: dj.length, working, score: dj.length > 0 ? Math.round((working / dj.length) * 100) : 0 };
    });
  }, [viewJourneys, journeys, hasViewData]);

  // Last full verification run
  const lastVerification = useMemo(() => {
    const source = hasViewData ? viewJourneys : (journeys ?? []);
    const dates = source
      .map((j: CJ01ExecutiveReportRow) => j.last_verified_at)
      .filter(Boolean)
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
    return dates[0] || null;
  }, [viewJourneys, journeys, hasViewData]);

  return (
    <div className="space-y-6 p-6" data-testid="cj01-executive-report">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            CJ01 — Customer Journey Executive Report
          </h1>
          <p className="text-muted-foreground mt-1">High-level truth summary of the entire user experience</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSeedRegistry} disabled={seedRegistryMutation.isPending} variant="outline" size="sm">
            {seedRegistryMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            <Database className="h-4 w-4 mr-1" />
            Seed Registry
          </Button>
          <Button onClick={handleSeed} disabled={seedMutation.isPending} variant="outline" size="sm">
            {seedMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Seed Journeys
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : totalJourneys === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No journeys seeded yet. Click "Seed Registry" to populate.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{totalJourneys}</div>
                <div className="text-xs text-muted-foreground">Total Journeys</div>
              </CardContent>
            </Card>
            {Object.entries(viewStatuses).sort(([,a],[,b]) => (b as number) - (a as number)).map(([status, count]) => {
              const cfg = JOURNEY_STATUS_CONFIG[status] || { label: status, color: "bg-muted text-muted-foreground" };
              return (
                <Card key={status}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{count as number}</div>
                    <Badge variant="outline" className={`${cfg.color} text-[10px] mt-1`}>{cfg.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mismatch + Last Verification + Blockers row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className={mismatchCount > 0 ? "border-amber-500/30" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-amber-400" />
                  <span className="font-medium text-sm">Demo vs Real Mismatches</span>
                </div>
                <div className="text-2xl font-bold mt-1">{mismatchCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Last Verification</span>
                </div>
                <div className="text-sm font-medium mt-1">
                  {lastVerification ? new Date(lastVerification).toLocaleString() : "Never"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Total Runs</span>
                </div>
                <div className="text-2xl font-bold mt-1">{stats.totalRuns}</div>
              </CardContent>
            </Card>
            <Card className={unresolvedBlockers.length > 0 ? "border-destructive/30" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-sm">Unresolved Blockers</span>
                </div>
                <div className="text-2xl font-bold mt-1">{unresolvedBlockers.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Proof Confidence Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Proof Confidence Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 h-6 rounded-full overflow-hidden">
                {Object.entries(proofDist).map(([key, count]) => {
                  const pct = totalJourneys > 0 ? ((count as number) / totalJourneys) * 100 : 0;
                  const cfg = PROOF_LABELS[key] || PROOF_LABELS.unverified;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={key}
                      className={`${cfg.color} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${cfg.label}: ${count}`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                {Object.entries(proofDist).map(([key, count]) => {
                  const cfg = PROOF_LABELS[key] || PROOF_LABELS.unverified;
                  return (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
                      <span>{cfg.label}: {count as number}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Launch Blockers */}
          {unresolvedBlockers.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  Launch Blockers ({unresolvedBlockers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unresolvedBlockers.slice(0, 10).map((b: CJ01ExecutiveReportRow) => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded bg-destructive/5 border border-destructive/20">
                    <div>
                      <span className="font-mono text-sm">{b.journey_key}</span>
                      <span className="text-muted-foreground text-xs ml-2">{b.summary}</span>
                    </div>
                    <Badge variant="outline" className="bg-destructive/15 text-destructive text-[10px]">{b.blocker_type}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Failures */}
          {(recentFailures ?? []).length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Failures ({(recentFailures ?? []).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(recentFailures ?? []).slice(0, 5).map((f: CJ01ExecutiveReportRow) => (
                  <div key={f.run_id} className="flex items-center justify-between p-2 rounded bg-amber-500/5 border border-amber-500/20">
                    <div>
                      <span className="font-mono text-sm">{f.journey_key}</span>
                      <span className="text-muted-foreground text-xs ml-2">{f.steps_failed} failed • {f.mode} • {f.environment}</span>
                    </div>
                    {f.commit_sha && <span className="font-mono text-[10px] text-muted-foreground">{f.commit_sha.slice(0, 7)}</span>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Surface Class Breakdown */}
          {surfaceBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Status by Surface Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {surfaceBreakdown.map((s) => (
                    <div key={s.surface} className="p-3 rounded-lg border bg-card">
                      <div className="font-mono text-sm">{s.surface}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xl font-bold">{s.score}%</div>
                        <div className="text-xs text-muted-foreground">{s.working}/{s.total} working</div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted mt-2">
                        <div
                          className={`h-1.5 rounded-full ${s.score >= 80 ? "bg-emerald-500" : s.score >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Domain Health Scores */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Domain Health Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {domainScores.sort((a, b) => a.score - b.score).map((d) => (
                  <div key={d.domain} className="p-3 rounded-lg border bg-card">
                    <div className="font-mono text-sm capitalize">{d.domain}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xl font-bold">{d.score}%</div>
                      <div className="text-xs text-muted-foreground">{d.working}/{d.total} working</div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted mt-2">
                      <div
                        className={`h-1.5 rounded-full ${d.score >= 80 ? "bg-emerald-500" : d.score >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
