// ═══════════════════════════════════════════════════════
// SITA OS — CJ06: Broken Clicks / Broken Steps Explorer
// Maps failed steps to pages, controls, services, dependencies
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomerJourneyRuns } from "@/lib/customer-journey/journey-hooks";
import { JOURNEY_STATUS_CONFIG } from "@/lib/customer-journey/journey-registry";
import { Bug, Loader2 } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";



export default function CJ06BrokenClicksExplorer() {
  const { isDemoMode } = useDataMode();
  const { data: runs, isLoading } = useCustomerJourneyRuns();

  const brokenRuns = (runs ?? []).filter((r: Record<string, any>) =>
    r.status === "broken" || r.status === "partial" || r.status === "degraded_usable"
  );

  // Group by root cause layer
  const byCause = brokenRuns.reduce<Record<string, any[]>>((acc, r: any) => {
    const layer = r.root_cause_layer || "unknown";
    if (!acc[layer]) acc[layer] = [];
    acc[layer].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6" data-testid="cj06-broken-clicks">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="h-6 w-6 text-destructive" />
          CJ06 — Broken Clicks / Broken Steps Explorer
        </h1>
        <p className="text-muted-foreground mt-1">Maps failed steps to root causes and dependencies</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : brokenRuns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No broken or partial journey runs found. Run verifications first or all journeys are working!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{brokenRuns.filter((r: Record<string, any>) => r.status === "broken").length}</div>
                <div className="text-xs text-muted-foreground">Broken</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{brokenRuns.filter((r: Record<string, any>) => r.status === "partial").length}</div>
                <div className="text-xs text-muted-foreground">Partial</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{brokenRuns.filter((r: Record<string, any>) => r.status === "degraded_usable").length}</div>
                <div className="text-xs text-muted-foreground">Degraded</div>
              </CardContent>
            </Card>
          </div>

          {/* By Root Cause */}
          {Object.entries(byCause).map(([layer, layerRuns]) => (
            <Card key={layer}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize">{layer} Layer ({layerRuns.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {layerRuns.map((r: Record<string, any>) => {
                  const statusCfg = JOURNEY_STATUS_CONFIG[r.status] || JOURNEY_STATUS_CONFIG.unverified;
                  return (
                    <div key={r.id} className="p-3 rounded border bg-card space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{r.journey_key}</span>
                        <Badge variant="outline" className={`${statusCfg.color} text-[10px]`}>{statusCfg.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Mode: {r.mode} · {r.steps_failed} of {r.steps_total} steps failed
                      </div>
                      {r.actual_outcome && <p className="text-xs">{r.actual_outcome}</p>}
                      {r.recommended_fix && <p className="text-xs text-amber-400">Fix: {r.recommended_fix}</p>}
                      {r.degraded_reason && <p className="text-xs text-orange-400">Degraded: {r.degraded_reason}</p>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
