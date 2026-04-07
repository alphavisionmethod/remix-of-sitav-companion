// ═══════════════════════════════════════════════════════
// SITA OS — V07: Launch Blocker Board
// Auto-identifies which failures block pilot/launch
// Wired to real journey_verification_runs + customer_journey_status
// ═══════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function LaunchBlockerBoard() {
  // Fetch latest verification runs
  const { data: runs } = useQuery({
    queryKey: ["v07-verification-runs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("journey_verification_runs")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  // Fetch journey statuses that are broken
  const { data: brokenJourneys } = useQuery({
    queryKey: ["v07-broken-journeys"],
    queryFn: async () => {
      const { data } = await supabase
        .from("customer_journey_status")
        .select("*, customer_journey_registry!inner(journey_key, title, flagship_loop)")
        .in("current_status", ["broken", "degraded", "blocked"]);
      return data || [];
    },
  });

  // Compute blockers from failed runs with launch_blocker impact
  const launchBlockerRuns = (runs || []).filter(
    (r: any) => r.launch_impact === "launch_blocker" && r.status !== "pass"
  );

  const pilotBlockerRuns = (runs || []).filter(
    (r: any) => r.launch_impact === "pilot_blocker" && r.status !== "pass"
  );

  const launchReady = launchBlockerRuns.length === 0 && (brokenJourneys || []).filter((j: any) => j.launch_impact === "launch_blocker").length === 0;

  return (
    <div className="space-y-6 p-6" data-testid="verification-launch-blockers">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          V07 — Launch Blocker Board
        </h1>
        <p className="text-muted-foreground mt-1">Auto-identifies failures that block pilot/launch — driven by real E2E proof</p>
      </div>

      {/* Launch Status */}
      <Card className={launchReady ? "border-emerald-500/50" : "border-destructive/50"}>
        <CardContent className="p-6 text-center">
          {launchReady ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <h2 className="text-xl font-bold text-emerald-400">Launch Ready</h2>
              <p className="text-muted-foreground">No launch-blocking failures detected in latest proof runs</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <XCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-bold text-destructive">Launch Blocked</h2>
              <p className="text-muted-foreground">
                {launchBlockerRuns.length} launch-blocker failure{launchBlockerRuns.length !== 1 ? "s" : ""}
                {pilotBlockerRuns.length > 0 && ` + ${pilotBlockerRuns.length} pilot-blocker`}
                {(brokenJourneys || []).length > 0 && ` + ${(brokenJourneys || []).length} broken journeys`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Launch Blocker Runs */}
      {launchBlockerRuns.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" /> Launch Blockers ({launchBlockerRuns.length})
            </h3>
            {launchBlockerRuns.map((r: any) => (
              <div key={r.id} className="p-2 rounded border border-destructive/30 bg-destructive/5 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">{r.summary || r.verification_type}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ✅{r.steps_passed} ❌{r.steps_failed} · {r.proof_confidence}
                    {r.commit_sha && ` · ${r.commit_sha.slice(0, 7)}`}
                  </span>
                </div>
                <Badge variant="destructive">BLOCKS LAUNCH</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pilot Blocker Runs */}
      {pilotBlockerRuns.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Pilot Blockers ({pilotBlockerRuns.length})
            </h3>
            {pilotBlockerRuns.map((r: any) => (
              <div key={r.id} className="p-2 rounded border border-amber-500/30 bg-amber-500/5 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">{r.summary || r.verification_type}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ✅{r.steps_passed} ❌{r.steps_failed}
                  </span>
                </div>
                <Badge variant="outline" className="text-amber-400">BLOCKS PILOT</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Broken Journeys */}
      {(brokenJourneys || []).length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Broken Journeys ({(brokenJourneys || []).length})
            </h3>
            {(brokenJourneys || []).map((j: any) => (
              <div key={j.id} className="p-2 rounded border border-destructive/30 bg-destructive/5 flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm">{j.customer_journey_registry?.journey_key || "—"}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {j.customer_journey_registry?.title} · {j.proof_confidence || "unknown"}
                  </span>
                  {j.recommended_fix && (
                    <p className="text-xs text-muted-foreground mt-1">Fix: {j.recommended_fix}</p>
                  )}
                </div>
                <Badge variant={j.launch_impact === "launch_blocker" ? "destructive" : "outline"}>
                  {j.launch_impact?.replace(/_/g, " ").toUpperCase() || "UNKNOWN"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
