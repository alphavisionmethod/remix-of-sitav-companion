// ═══════════════════════════════════════════════════════
// SITA OS — V05: Failure Triage Board
// Broken buttons, flows, routes, state transitions
// ═══════════════════════════════════════════════════════

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVerificationSurfaces, useVerificationRuns } from "@/lib/verification/verification-hooks";
import { AlertTriangle, XCircle } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";



export default function FailureTriageBoard() {
  const { isDemoMode } = useDataMode();
  const { data: dbSurfaces } = useVerificationSurfaces();
  const { data: runs } = useVerificationRuns();

  const failedSurfaces = (dbSurfaces || []).filter((s: any) => s.verification_status === "fail");
  const failedRuns = (runs || []).filter((r: any) => !r.passed);
  const recentFailures = failedRuns.slice(0, 20);

  return (
    <div className="space-y-6 p-6" data-testid="verification-failure-triage">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          V05 — Failure Triage Board
        </h1>
        <p className="text-muted-foreground mt-1">{failedSurfaces.length} failed surfaces, {failedRuns.length} failed runs</p>
      </div>

      {failedSurfaces.length === 0 && failedRuns.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No failures detected. Run verifications to populate this board.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {/* Failed Surfaces */}
          {failedSurfaces.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /> Failed Surfaces ({failedSurfaces.length})</h3>
                {failedSurfaces.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded border border-destructive/20 bg-destructive/5">
                    <div>
                      <span className="font-mono text-sm">{s.route_key}</span>
                      <span className="text-xs text-muted-foreground ml-2">{s.action_label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{s.test_priority}</Badge>
                      <Badge variant="outline" className="text-xs">{s.route_path}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Failed Runs */}
          {recentFailures.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold">Recent Failed Runs ({recentFailures.length})</h3>
                {recentFailures.map((r: any) => (
                  <div key={r.id} className="p-2 rounded border border-destructive/20 bg-destructive/5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{r.run_type} / {r.mode}</span>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    {r.failure_reason && <p className="text-xs text-destructive mt-1">{r.failure_reason}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
