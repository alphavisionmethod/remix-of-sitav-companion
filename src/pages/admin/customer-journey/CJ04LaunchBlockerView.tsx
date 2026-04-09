// ═══════════════════════════════════════════════════════
// SITA OS — CJ04: Launch Blocker View (War Room)
// Age, persona, modes, war-room visual intensity
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustomerJourneys, useCustomerJourneyBlockers } from "@/lib/customer-journey/journey-hooks";
import { useBlockerScores, useResolveBlockerScore } from "@/lib/customer-journey/journey-scoring-hooks";
import { useBlockersView } from "@/lib/customer-journey/journey-ingestion-hooks";
import { JOURNEY_STATUS_CONFIG, LAUNCH_IMPACT_CONFIG } from "@/lib/customer-journey/journey-registry";
import { ShieldAlert, Loader2, CheckCircle2, Clock, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";
import { useDataMode } from "@/contexts/DataModeContext";


interface CJ04LaunchBlockerViewRow {
  blocker_id?: unknown;
  blocker_type?: unknown;
  created_at?: string;
  current_status?: unknown;
  display_name?: string;
  id?: string;
  journey_key?: unknown;
  launch_importance?: unknown;
  message?: string;
  reason_summary?: unknown;
  resolved?: unknown;
  scored_at?: unknown;
  severity_score?: unknown;
  summary?: unknown;
}

const BLOCKER_TYPE_COLORS: Record<string, string> = {
  launch_blocker: "bg-destructive/15 text-destructive",
  pilot_blocker: "bg-orange-500/15 text-orange-400",
  claim_risk: "bg-amber-500/15 text-amber-400",
  important_non_blocker: "bg-blue-500/15 text-blue-400",
  non_blocking: "bg-muted text-muted-foreground",
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function CJ04LaunchBlockerView() {
  const { isDemoMode } = useDataMode();
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: blockers } = useCustomerJourneyBlockers();
  const { data: scores } = useBlockerScores(false);
  const { data: viewBlockers } = useBlockersView();
  const resolveScore = useResolveBlockerScore();

  const criticalJourneys = (journeys ?? []).filter((j: CJ04LaunchBlockerViewRow) =>
    j.launch_importance === "launch_blocker" || j.launch_importance === "pilot_blocker" || j.launch_importance === "claim_risk"
  );

  const unresolvedBlockers = (blockers ?? []).filter((b: CJ04LaunchBlockerViewRow) => !b.resolved);
  const resolvedBlockers = (blockers ?? []).filter((b: CJ04LaunchBlockerViewRow) => b.resolved);

  const allScoredBlockers = useMemo(() => {
    const merged = [...(scores ?? []), ...(viewBlockers ?? [])];
    const seenIds = new Set<string>();
    return merged.filter((s: CJ04LaunchBlockerViewRow) => {
      const id = s.id || s.blocker_id;
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
  }, [scores, viewBlockers]);

  const handleResolve = async (id: string) => {
    try {
      await resolveScore.mutateAsync(id);
      toast.success("Blocker resolved");
    } catch (e: CJ04LaunchBlockerViewRow) {
      toast.error(e.message);
    }
  };

  const totalBlockers = allScoredBlockers.length + unresolvedBlockers.length;
  const launchBlockerCount = allScoredBlockers.filter((s: CJ04LaunchBlockerViewRow) => s.blocker_type === "launch_blocker").length;
  const pilotBlockerCount = allScoredBlockers.filter((s: CJ04LaunchBlockerViewRow) => s.blocker_type === "pilot_blocker").length;
  const claimRiskCount = allScoredBlockers.filter((s: CJ04LaunchBlockerViewRow) => s.blocker_type === "claim_risk").length;

  return (
    <div className="space-y-6 p-6" data-testid="cj04-launch-blockers">
      {/* War Room Header */}
      <div className={`rounded-lg p-6 ${totalBlockers > 0 ? "bg-destructive/5 border border-destructive/20" : "bg-emerald-500/5 border border-emerald-500/20"}`}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className={`h-6 w-6 ${totalBlockers > 0 ? "text-destructive" : "text-emerald-400"}`} />
          CJ04 — Launch Blocker War Room
        </h1>
        <p className="text-muted-foreground mt-1">Critical journeys that must work before launch — resolve all to ship</p>

        {/* War Room Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="p-3 rounded bg-background border text-center">
            <div className="text-2xl font-bold">{totalBlockers}</div>
            <div className="text-xs text-muted-foreground">Total Blockers</div>
          </div>
          <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-center">
            <div className="text-2xl font-bold text-destructive">{launchBlockerCount}</div>
            <div className="text-xs text-destructive/70">Launch Blockers</div>
          </div>
          <div className="p-3 rounded bg-orange-500/10 border border-orange-500/20 text-center">
            <div className="text-2xl font-bold text-orange-400">{pilotBlockerCount}</div>
            <div className="text-xs text-orange-400/70">Pilot Blockers</div>
          </div>
          <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-2xl font-bold text-amber-400">{claimRiskCount}</div>
            <div className="text-xs text-amber-400/70">Claim Risks</div>
          </div>
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-2xl font-bold text-emerald-400">{resolvedBlockers.length}</div>
            <div className="text-xs text-emerald-400/70">Resolved</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Scored Blockers */}
          {allScoredBlockers.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-destructive text-lg">🎯 Active Blockers ({allScoredBlockers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allScoredBlockers.map((s: CJ04LaunchBlockerViewRow) => {
                  const id = s.id || s.blocker_id;
                  const journeyKey = s.journey_key || "unknown";
                  const blockerType = s.blocker_type || "unknown";
                  const severityScore = s.severity_score ?? 0;
                  const reasonSummary = s.reason_summary || "";
                  const createdAt = s.created_at || s.scored_at;
                  const age = createdAt ? daysSince(createdAt) : 0;
                  const isUrgent = age > 7 || blockerType === "launch_blocker";

                  return (
                    <div key={id} className={`p-4 rounded-lg border space-y-2 ${isUrgent ? "bg-destructive/8 border-destructive/30" : "bg-destructive/5 border-destructive/20"}`}>
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
                      <div className="flex items-center gap-3 flex-wrap text-[10px]">
                        {/* Age */}
                        <span className={`flex items-center gap-1 ${age > 7 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          <Clock className="h-3 w-3" />
                          {age}d old
                        </span>
                        {/* Affected personas */}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {s.affects_user && "User "}
                          {s.affects_admin && "Admin "}
                          {!s.affects_user && !s.affects_admin && (s.persona || "—")}
                        </span>
                        {/* Affected modes */}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          {s.affects_real && "Real "}
                          {s.affects_demo && "Demo "}
                          {!s.affects_real && !s.affects_demo && (s.mode || "—")}
                        </span>
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
                <CardTitle className="text-destructive text-lg">🚫 Legacy Blockers ({unresolvedBlockers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unresolvedBlockers.map((b: CJ04LaunchBlockerViewRow) => {
                  const age = b.created_at ? daysSince(b.created_at) : 0;
                  return (
                    <div key={b.id} className="p-3 rounded border border-destructive/20 bg-destructive/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">{b.journey_key}</span>
                          <span className={`text-[10px] ${age > 7 ? "text-destructive font-medium" : "text-muted-foreground"}`}>{age}d old</span>
                        </div>
                        <Badge variant="outline" className="bg-destructive/15 text-destructive text-[10px]">{b.blocker_type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.summary}</p>
                      {b.recommended_fix && <p className="text-xs text-amber-400">Fix: {b.recommended_fix}</p>}
                    </div>
                  );
                })}
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
                {criticalJourneys.map((j: CJ04LaunchBlockerViewRow) => {
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
                {resolvedBlockers.map((b: CJ04LaunchBlockerViewRow) => (
                  <div key={b.id} className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-xs">
                    <span className="font-mono">{b.journey_key}</span>
                    <span className="text-muted-foreground ml-2">{b.summary}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {criticalJourneys.length === 0 && unresolvedBlockers.length === 0 && allScoredBlockers.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No launch-critical journeys found. Seed from registry first.</CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
