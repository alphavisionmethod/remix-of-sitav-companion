// ═══════════════════════════════════════════════════════
// SITA OS — CJ05: Demo vs Real Journey Comparison
// Persisted mode comparisons + claim risk flags
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustomerJourneys, useCustomerJourneyRuns } from "@/lib/customer-journey/journey-hooks";
import { useModeComparisons, useUpsertModeComparison } from "@/lib/customer-journey/journey-scoring-hooks";
import { JOURNEY_STATUS_CONFIG } from "@/lib/customer-journey/journey-registry";
import { GitCompare, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function CJ05DemoVsRealComparison() {
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: runs } = useCustomerJourneyRuns();
  const { data: persistedComparisons } = useModeComparisons();
  const upsertComparison = useUpsertModeComparison();

  // Compute comparisons from runs
  const comparisons = (journeys ?? []).map((j: any) => {
    const jRuns = (runs ?? []).filter((r: any) => r.journey_key === j.journey_key);
    const demoRun = jRuns.find((r: any) => r.mode === "demo");
    const realRun = jRuns.find((r: any) => r.mode === "real");

    // Check persisted comparison
    const persisted = (persistedComparisons ?? []).find((c: any) => c.journey_key === j.journey_key);

    let comparison = "no_data";
    const demoStatus = demoRun?.status || persisted?.demo_status;
    const realStatus = realRun?.status || persisted?.real_status;

    if (demoStatus && realStatus) {
      if (demoStatus === "working" && realStatus === "working") comparison = "both_work";
      else if (demoStatus === "working" && realStatus !== "working") comparison = "demo_works_real_broken";
      else if (demoStatus !== "working" && realStatus === "working") comparison = "real_works_demo_broken";
      else comparison = "both_issues";
    } else if (demoStatus && !realStatus) comparison = "demo_only";
    else if (!demoStatus && realStatus) comparison = "real_only";

    const claim_risk = comparison === "demo_works_real_broken";

    return { journey: j, demoRun, realRun, comparison, claim_risk, persisted };
  });

  const handlePersistAll = async () => {
    try {
      let count = 0;
      for (const c of comparisons) {
        if (c.comparison === "no_data") continue;
        await upsertComparison.mutateAsync({
          journey_key: c.journey.journey_key,
          real_status: c.realRun?.status || c.persisted?.real_status,
          demo_status: c.demoRun?.status || c.persisted?.demo_status,
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

  const comparisonLabels: Record<string, { label: string; color: string }> = {
    both_work: { label: "Both Work", color: "bg-emerald-500/15 text-emerald-400" },
    demo_works_real_broken: { label: "Demo OK / Real Broken", color: "bg-destructive/15 text-destructive" },
    real_works_demo_broken: { label: "Real OK / Demo Broken", color: "bg-amber-500/15 text-amber-400" },
    both_issues: { label: "Both Have Issues", color: "bg-orange-500/15 text-orange-400" },
    demo_only: { label: "Demo Only", color: "bg-blue-500/15 text-blue-400" },
    real_only: { label: "Real Only", color: "bg-purple-500/15 text-purple-400" },
    no_data: { label: "No Runs", color: "bg-muted text-muted-foreground" },
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
          <p className="text-muted-foreground mt-1">Identifies truth gaps between demo and real mode</p>
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
          {comparisons.map(({ journey: j, demoRun, realRun, comparison, claim_risk }) => {
            const cLabel = comparisonLabels[comparison];
            const demoCfg = demoRun ? JOURNEY_STATUS_CONFIG[demoRun.status] || JOURNEY_STATUS_CONFIG.unverified : null;
            const realCfg = realRun ? JOURNEY_STATUS_CONFIG[realRun.status] || JOURNEY_STATUS_CONFIG.unverified : null;

            return (
              <Card key={j.id} className={claim_risk ? "border-amber-500/30" : ""}>
                <CardContent className="p-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <div className="font-medium text-sm flex items-center gap-1">
                      {claim_risk && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                      {j.display_name}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">{j.journey_key}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    {demoCfg ? <Badge variant="outline" className={`${demoCfg.color} text-[10px]`}>{demoCfg.label}</Badge> : <span className="text-[10px] text-muted-foreground">—</span>}
                    <div className="text-[9px] text-muted-foreground mt-0.5">Demo</div>
                  </div>
                  <div className="col-span-2 text-center">
                    {realCfg ? <Badge variant="outline" className={`${realCfg.color} text-[10px]`}>{realCfg.label}</Badge> : <span className="text-[10px] text-muted-foreground">—</span>}
                    <div className="text-[9px] text-muted-foreground mt-0.5">Real</div>
                  </div>
                  <div className="col-span-4 text-right">
                    <Badge variant="outline" className={`${cLabel.color} text-[10px]`}>{cLabel.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
