// ═══════════════════════════════════════════════════════
// SITA OS — CJ09: Recent Verification Runs Feed
// Dedicated feed showing all verification run history
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomerJourneyRuns } from "@/lib/customer-journey/journey-hooks";
import { useRecentFailures } from "@/lib/customer-journey/journey-ingestion-hooks";
import { JOURNEY_STATUS_CONFIG } from "@/lib/customer-journey/journey-registry";
import { History, Loader2, AlertTriangle, CheckCircle2, Image, GitBranch } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";



const PROOF_BADGES: Record<string, { label: string; color: string }> = {
  verified_e2e: { label: "E2E", color: "bg-emerald-500/15 text-emerald-400" },
  verified_interaction: { label: "Interaction", color: "bg-blue-500/15 text-blue-400" },
  manually_confirmed: { label: "Manual", color: "bg-purple-500/15 text-purple-400" },
  unverified: { label: "Unverified", color: "bg-muted text-muted-foreground" },
};

export default function CJ09RecentVerificationRuns() {
  const { isDemoMode } = useDataMode();
  const { data: runs, isLoading } = useCustomerJourneyRuns();
  const { data: recentFailures } = useRecentFailures();

  // Merge and deduplicate, prefer view data
  const allRuns = [...(runs ?? []), ...(recentFailures ?? [])];
  const seenIds = new Set<string>();
  const dedupedRuns = allRuns.filter((r: any) => {
    const id = r.id || r.run_id;
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  }).sort((a: any, b: any) => {
    const da = new Date(a.created_at || a.completed_at || 0).getTime();
    const db = new Date(b.created_at || b.completed_at || 0).getTime();
    return db - da;
  });

  const failCount = dedupedRuns.filter((r: any) => r.status === "fail" || r.status === "broken" || r.status === "partial").length;
  const passCount = dedupedRuns.filter((r: any) => r.status === "pass" || r.status === "working").length;

  return (
    <div className="space-y-6 p-6" data-testid="cj09-recent-runs">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          CJ09 — Recent Verification Runs
        </h1>
        <p className="text-muted-foreground mt-1">Full feed of all journey verification runs with evidence and environment context</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{dedupedRuns.length}</div>
            <div className="text-xs text-muted-foreground">Total Runs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{passCount}</div>
            <div className="text-xs text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{failCount}</div>
            <div className="text-xs text-muted-foreground">Failed / Partial</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {dedupedRuns.length > 0
                ? new Date(dedupedRuns[0]?.created_at || dedupedRuns[0]?.completed_at).toLocaleDateString()
                : "—"}
            </div>
            <div className="text-xs text-muted-foreground">Last Run</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : dedupedRuns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No verification runs recorded yet. Run Playwright tests or record manual verifications.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {dedupedRuns.map((r: any, idx: number) => {
            const id = r.id || r.run_id || idx;
            const status = r.status || "unverified";
            const statusCfg = JOURNEY_STATUS_CONFIG[status] || JOURNEY_STATUS_CONFIG.unverified;
            const isFail = status === "fail" || status === "broken";
            const isPartial = status === "partial";
            const proofCfg = PROOF_BADGES[r.proof_confidence] || PROOF_BADGES.unverified;
            const timestamp = r.created_at || r.completed_at || r.started_at;
            const hasEvidence = r.evidence_bundle_ref || r.has_evidence;

            return (
              <Card key={id} className={isFail ? "border-destructive/30" : isPartial ? "border-amber-500/30" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {isFail ? (
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-medium truncate">{r.journey_key}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={`${statusCfg.color} text-[10px]`}>{statusCfg.label}</Badge>
                          <Badge variant="outline" className={`${proofCfg.color} text-[10px]`}>{proofCfg.label}</Badge>
                          {r.mode && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{r.mode}</span>}
                          {r.environment && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{r.environment}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-[10px] text-muted-foreground">
                        {timestamp ? new Date(timestamp).toLocaleString() : "—"}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {r.commit_sha && (
                          <span className="flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground">
                            <GitBranch className="h-3 w-3" />
                            {r.commit_sha.slice(0, 7)}
                          </span>
                        )}
                        {hasEvidence && (
                          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400">
                            <Image className="h-3 w-3 mr-0.5" />
                            Evidence
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step counts */}
                  <div className="mt-2 flex items-center gap-3 text-[10px]">
                    {r.steps_passed != null && <span className="text-emerald-400">{r.steps_passed} passed</span>}
                    {r.steps_failed > 0 && <span className="text-destructive">{r.steps_failed} failed</span>}
                    {(r.steps_total || r.steps_skipped) && (
                      <span className="text-muted-foreground">/ {r.steps_total || (r.steps_passed + r.steps_failed + (r.steps_skipped || 0))} total</span>
                    )}
                  </div>

                  {/* Summary */}
                  {(r.summary || r.actual_outcome) && (
                    <p className="text-xs text-muted-foreground mt-1">{r.summary || r.actual_outcome}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
