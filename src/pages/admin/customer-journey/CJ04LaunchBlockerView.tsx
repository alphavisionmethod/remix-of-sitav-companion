// ═══════════════════════════════════════════════════════
// SITA OS — CJ04: Launch Blocker View
// Uses v_customer_journey_blockers view + scoring engine
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustomerJourneys, useCustomerJourneyBlockers } from "@/lib/customer-journey/journey-hooks";
import { useBlockerScores, useResolveBlockerScore } from "@/lib/customer-journey/journey-scoring-hooks";
import { useBlockersView } from "@/lib/customer-journey/journey-ingestion-hooks";
import { JOURNEY_STATUS_CONFIG, LAUNCH_IMPACT_CONFIG } from "@/lib/customer-journey/journey-registry";
import { ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BLOCKER_TYPE_COLORS: Record<string, string> = {
  launch_blocker: "bg-destructive/15 text-destructive",
  pilot_blocker: "bg-orange-500/15 text-orange-400",
  claim_risk: "bg-amber-500/15 text-amber-400",
  important_non_blocker: "bg-blue-500/15 text-blue-400",
  non_blocking: "bg-muted text-muted-foreground",
};

export default function CJ04LaunchBlockerView() {
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: blockers } = useCustomerJourneyBlockers();
  const { data: scores } = useBlockerScores(false);
  const { data: viewBlockers } = useBlockersView();
  const resolveScore = useResolveBlockerScore();

  const criticalJourneys = (journeys ?? []).filter((j: any) =>
    j.launch_importance === "launch_blocker" || j.launch_importance === "pilot_blocker" || j.launch_importance === "claim_risk"
  );

  const unresolvedBlockers = (blockers ?? []).filter((b: any) => !b.resolved);
  const resolvedBlockers = (blockers ?? []).filter((b: any) => b.resolved);

  // Merge scored blockers from both sources, deduplicate by ID
  const allScoredBlockers = [...(scores ?? []), ...(viewBlockers ?? [])];
  const seenIds = new Set<string>();
  const unresolvedScores = allScoredBlockers.filter((s: any) => {
    const id = s.id || s.blocker_id;
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  const handleResolve = async (id: string) => {
    try {
      await resolveScore.mutateAsync(id);
      toast.success("Blocker resolved");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 p-6" data-testid="cj04-launch-blockers">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          CJ04 — Launch Blocker View
        </h1>
        <p className="text-muted-foreground mt-1">Critical journeys that must work before launch</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Scored Blockers */}
          {unresolvedScores.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-destructive text-lg">🎯 Scored Blockers ({unresolvedScores.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unresolvedScores.map((s: any) => {
                  const id = s.id || s.blocker_id;
                  const journeyKey = s.journey_key || "unknown";
                  const blockerType = s.blocker_type || "unknown";
                  const severityScore = s.severity_score ?? 0;
                  const reasonSummary = s.reason_summary || "";
                  return (
                    <div key={id} className="p-3 rounded border border-destructive/20 bg-destructive/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm font-medium">{journeyKey}</span>
                          {s.display_name && <span className="text-xs text-muted-foreground ml-2">{s.display_name}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono">Score: {severityScore}</Badge>
                          <Badge variant="outline" className={`text-[10px] ${BLOCKER_TYPE_COLORS[blockerType] || ""}`}>
                            {blockerType.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{reasonSummary}</p>
                      <div className="flex items-center gap-2 text-[10px]">
                        {s.affects_user && <Badge variant="outline" className="text-[10px]">User</Badge>}
                        {s.affects_admin && <Badge variant="outline" className="text-[10px]">Admin</Badge>}
                        {s.affects_real && <Badge variant="outline" className="text-[10px]">Real</Badge>}
                        {s.affects_demo && <Badge variant="outline" className="text-[10px]">Demo</Badge>}
                        {s.domain_family && <Badge variant="outline" className="text-[10px]">{s.domain_family}</Badge>}
                        {s.priority_class && <Badge variant="outline" className="text-[10px]">{s.priority_class.toUpperCase()}</Badge>}
                        <div className="flex-1" />
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => handleResolve(id)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Legacy Active Blockers */}
          {unresolvedBlockers.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-destructive text-lg">🚫 Active Blockers ({unresolvedBlockers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unresolvedBlockers.map((b: any) => (
                  <div key={b.id} className="p-3 rounded border border-destructive/20 bg-destructive/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium">{b.journey_key}</span>
                      <Badge variant="outline" className="bg-destructive/15 text-destructive text-[10px]">{b.blocker_type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.summary}</p>
                    {b.recommended_fix && <p className="text-xs text-amber-400">Fix: {b.recommended_fix}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Critical Journeys Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Launch-Critical Journeys ({criticalJourneys.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalJourneys.map((j: any) => {
                  const statusCfg = JOURNEY_STATUS_CONFIG[j.current_status] || JOURNEY_STATUS_CONFIG.unverified;
                  const impactCfg = LAUNCH_IMPACT_CONFIG[j.launch_importance] || LAUNCH_IMPACT_CONFIG.non_blocking;
                  return (
                    <div key={j.id} className="flex items-center justify-between p-3 rounded border bg-card">
                      <div>
                        <div className="font-medium text-sm">{j.display_name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{j.journey_key}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${statusCfg.color} text-[10px]`}>{statusCfg.label}</Badge>
                        <Badge variant="outline" className={`${impactCfg.color} text-[10px]`}>{impactCfg.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Resolved */}
          {resolvedBlockers.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-400">✅ Resolved ({resolvedBlockers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {resolvedBlockers.map((b: any) => (
                  <div key={b.id} className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-xs">
                    <span className="font-mono">{b.journey_key}</span>
                    <span className="text-muted-foreground ml-2">{b.summary}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {criticalJourneys.length === 0 && unresolvedBlockers.length === 0 && unresolvedScores.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No launch-critical journeys found. Seed from registry first.</CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
