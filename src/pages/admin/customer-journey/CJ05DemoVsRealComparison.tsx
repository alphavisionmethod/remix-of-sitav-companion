// ═══════════════════════════════════════════════════════
// SITA OS — CJ05: Demo vs Real Journey Comparison
// + internal_test status, recommended next action
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustomerJourneys, useCustomerJourneyRuns } from "@/lib/customer-journey/journey-hooks";
import { useModeComparisons, useUpsertModeComparison } from "@/lib/customer-journey/journey-scoring-hooks";
import { useModeDeltas } from "@/lib/customer-journey/journey-ingestion-hooks";
import { JOURNEY_STATUS_CONFIG } from "@/lib/customer-journey/journey-registry";
import { GitCompare, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useDataMode } from "@/contexts/DataModeContext";



const comparisonLabels: Record<string, { label: string; color: string }> = {
  both_work: { label: "Both Work", color: "bg-emerald-500/15 text-emerald-400" },
  demo_works_real_broken: { label: "Demo OK / Real Broken", color: "bg-destructive/15 text-destructive" },
  real_works_demo_broken: { label: "Real OK / Demo Broken", color: "bg-amber-500/15 text-amber-400" },
  both_issues: { label: "Both Have Issues", color: "bg-orange-500/15 text-orange-400" },
  demo_only: { label: "Demo Only", color: "bg-blue-500/15 text-blue-400" },
  real_only: { label: "Real Only", color: "bg-purple-500/15 text-purple-400" },
  no_data: { label: "No Runs", color: "bg-muted text-muted-foreground" },
};

function getNextAction(comparison: string, realStatus?: string): string {
  switch (comparison) {
    case "demo_works_real_broken": return "Fix real mode — claim risk if shipped";
    case "real_works_demo_broken": return "Fix demo mode for showcase readiness";
    case "both_issues": return "Prioritize real mode fix, then demo";
    case "demo_only": return "Add real mode test coverage";
    case "real_only": return "Add demo mode support";
    case "both_work": return "✓ No action needed";
    default: return "Run verification tests";
  }
}

export default function CJ05DemoVsRealComparison() {
  const { isDemoMode } = useDataMode();
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: runs } = useCustomerJourneyRuns();
  const { data: persistedComparisons } = useModeComparisons();
  const { data: viewDeltas } = useModeDeltas();
  const upsertComparison = useUpsertModeComparison();

  const useViewData = (viewDeltas ?? []).length > 0;

  const comparisons = useViewData
    ? (viewDeltas ?? []).map((d: any) => ({
        journey: { journey_key: d.journey_key, display_name: d.display_name, domain_family: d.domain_family, id: d.comparison_id },
        demoRun: null,
        realRun: null,
        comparison: d.comparison_summary || "no_data",
        claim_risk: d.claim_risk,
        persisted: d,
        demoStatus: d.demo_status,
        realStatus: d.real_status,
        internalTestStatus: d.internal_test_status || null,
      }))
    : (journeys ?? []).map((j: any) => {
        const jRuns = (runs ?? []).filter((r: any) => r.journey_key === j.journey_key);
        const demoRun = jRuns.find((r: any) => r.mode === "demo");
        const realRun = jRuns.find((r: any) => r.mode === "real");
        const internalRun = jRuns.find((r: any) => r.mode === "internal_test");
        const persisted = (persistedComparisons ?? []).find((c: any) => c.journey_key === j.journey_key);

        let comparison = "no_data";
        const demoStatus = demoRun?.status || persisted?.demo_status;
        const realStatus = realRun?.status || persisted?.real_status;
        const internalTestStatus = internalRun?.status || null;

        if (demoStatus && realStatus) {
          if (demoStatus === "working" && realStatus === "working") comparison = "both_work";
          else if (demoStatus === "working" && realStatus !== "working") comparison = "demo_works_real_broken";
          else if (demoStatus !== "working" && realStatus === "working") comparison = "real_works_demo_broken";
          else comparison = "both_issues";
        } else if (demoStatus && !realStatus) comparison = "demo_only";
        else if (!demoStatus && realStatus) comparison = "real_only";

        return {
          journey: j,
          demoRun,
          realRun,
          comparison,
          claim_risk: comparison === "demo_works_real_broken",
          persisted,
          demoStatus,
          realStatus,
          internalTestStatus,
        };
      });

  const handlePersistAll = async () => {
    try {
      let count = 0;
      for (const c of comparisons) {
        if (c.comparison === "no_data") continue;
        await upsertComparison.mutateAsync({
          journey_key: c.journey.journey_key,
          real_status: c.realStatus || c.realRun?.status || c.persisted?.real_status,
          demo_status: c.demoStatus || c.demoRun?.status || c.persisted?.demo_status,
          comparison_summary: c.comparison,
          claim_risk: c.claim_risk,
        });
        count++;
      }
      toast.success(`Persisted ${count} mode comparisons`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const claimRiskCount = comparisons.filter((c) => c.claim_risk).length;

  return (
    <div className="space-y-6 p-6" data-testid="cj05-demo-vs-real">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" />
            CJ05 — Demo vs Real Comparison
          </h1>
          <p className="text-muted-foreground mt-1">Identifies truth gaps between demo, real, and internal test modes</p>
        </div>
        <Button onClick={handlePersistAll} disabled={upsertComparison.isPending} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-1" />
          Persist Comparisons
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(comparisonLabels).map(([key, cfg]) => {
          const count = comparisons.filter((c) => c.comparison === key).length;
          if (count === 0) return null;
          return (
            <Card key={key}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{count}</div>
                <Badge variant="outline" className={`${cfg.color} text-[10px] mt-1`}>{cfg.label}</Badge>
              </CardContent>
            </Card>
          );
        })}
        {claimRiskCount > 0 && (
          <Card className="border-amber-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{claimRiskCount}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] text-amber-400 font-medium">Claim Risks</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-16 gap-1 px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">
            <div className="col-span-3">Journey</div>
            <div className="col-span-2 text-center">Demo</div>
            <div className="col-span-2 text-center">Real</div>
            <div className="col-span-2 text-center">Internal Test</div>
            <div className="col-span-3 text-center">Comparison</div>
            <div className="col-span-4">Next Action</div>
          </div>

          {comparisons.map((c, idx) => {
            const { journey: j, comparison, claim_risk, demoStatus, realStatus, internalTestStatus } = c;
            const cLabel = comparisonLabels[comparison] || comparisonLabels.no_data;
            const demoCfg = demoStatus ? JOURNEY_STATUS_CONFIG[demoStatus] || JOURNEY_STATUS_CONFIG.unverified : null;
            const realCfg = realStatus ? JOURNEY_STATUS_CONFIG[realStatus] || JOURNEY_STATUS_CONFIG.unverified : null;
            const internalCfg = internalTestStatus ? JOURNEY_STATUS_CONFIG[internalTestStatus] || JOURNEY_STATUS_CONFIG.unverified : null;
            const nextAction = getNextAction(comparison, realStatus);

            return (
              <Card key={j.id || idx} className={claim_risk ? "border-amber-500/30" : ""}>
                <CardContent className="p-3 grid grid-cols-16 gap-1 items-center">
                  <div className="col-span-3">
                    <div className="font-medium text-sm flex items-center gap-1">
                      {claim_risk && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                      {j.display_name}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">{j.journey_key}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    {demoCfg ? <Badge variant="outline" className={`${demoCfg.color} text-[10px]`}>{demoCfg.label}</Badge> : <span className="text-[10px] text-muted-foreground">—</span>}
                  </div>
                  <div className="col-span-2 text-center">
                    {realCfg ? <Badge variant="outline" className={`${realCfg.color} text-[10px]`}>{realCfg.label}</Badge> : <span className="text-[10px] text-muted-foreground">—</span>}
                  </div>
                  <div className="col-span-2 text-center">
                    {internalCfg ? <Badge variant="outline" className={`${internalCfg.color} text-[10px]`}>{internalCfg.label}</Badge> : <span className="text-[10px] text-muted-foreground">—</span>}
                  </div>
                  <div className="col-span-3 text-center">
                    <Badge variant="outline" className={`${cLabel.color} text-[10px]`}>{cLabel.label}</Badge>
                  </div>
                  <div className="col-span-4 text-[10px] text-muted-foreground">{nextAction}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
