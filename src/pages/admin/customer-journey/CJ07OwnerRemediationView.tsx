// ═══════════════════════════════════════════════════════
// SITA OS — CJ07: Owner Remediation View
// Groups broken/partial journeys by owner/domain for fixing
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomerJourneys, useCustomerJourneyRuns } from "@/lib/customer-journey/journey-hooks";
import { JOURNEY_STATUS_CONFIG } from "@/lib/customer-journey/journey-registry";
import { Wrench, Loader2 } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";


interface CJ07OwnerRemediationViewRow {
  current_status?: unknown;
  display_?: unknown;
  id?: string;
  journey_key?: unknown;
  owner?: unknown;
}

export default function CJ07OwnerRemediationView() {
  const { isDemoMode } = useDataMode();
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: runs } = useCustomerJourneyRuns();

  // Journeys needing attention
  const needsWork = (journeys ?? []).filter((j: CJ07OwnerRemediationViewRow) =>
    j.current_status !== "working" && j.current_status !== "planned" && j.current_status !== "internal_only"
  );

  // Group by owner
  const byOwner = needsWork.reduce<Record<string, any[]>>((acc, j: any) => {
    const owner = j.owner || "unassigned";
    if (!acc[owner]) acc[owner] = [];
    acc[owner].push(j);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6" data-testid="cj07-owner-remediation">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          CJ07 — Owner Remediation View
        </h1>
        <p className="text-muted-foreground mt-1">Broken and partial journeys grouped by owner for efficient fixing</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : needsWork.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-emerald-400 text-lg font-medium">🎉 All journeys are working or planned!</p>
            <p className="text-muted-foreground text-sm mt-1">No remediation needed at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">{needsWork.length} journeys need attention across {Object.keys(byOwner).length} owners</div>

          {Object.entries(byOwner).sort(([,a],[,b]) => b.length - a.length).map(([owner, ownerJourneys]) => (
            <Card key={owner}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg capitalize flex items-center justify-between">
                  <span>{owner}</span>
                  <Badge variant="secondary">{ownerJourneys.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ownerJourneys.map((j: CJ07OwnerRemediationViewRow) => {
                  const statusCfg = JOURNEY_STATUS_CONFIG[j.current_status] || JOURNEY_STATUS_CONFIG.unverified;
                  const latestRun = (runs ?? []).find((r: CJ07OwnerRemediationViewRow) => r.journey_key === j.journey_key);
                  return (
                    <div key={j.id} className="p-3 rounded border bg-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{j.display_name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{j.journey_key} · {j.domain}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${statusCfg.color} text-[10px]`}>{statusCfg.label}</Badge>
                        </div>
                      </div>
                      {latestRun?.recommended_fix && (
                        <p className="text-xs text-amber-400 mt-1">Suggested fix: {latestRun.recommended_fix}</p>
                      )}
                      {latestRun?.root_cause_layer && (
                        <p className="text-xs text-muted-foreground mt-0.5">Root cause: {latestRun.root_cause_layer}</p>
                      )}
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
