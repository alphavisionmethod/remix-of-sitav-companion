// ═══════════════════════════════════════════════════════
// SITA OS — V07: Launch Blocker Board
// Auto-identifies which failures block pilot/launch
// ═══════════════════════════════════════════════════════

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVerificationSurfaces, useVerificationBlockers, useResolveBlocker } from "@/lib/verification/verification-hooks";
import { getP0Surfaces } from "@/lib/verification/surface-registry";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function LaunchBlockerBoard() {
  const { data: dbSurfaces } = useVerificationSurfaces();
  const { data: blockers } = useVerificationBlockers();
  const resolveBlocker = useResolveBlocker();
  const p0s = getP0Surfaces();

  // Auto-compute blockers from failed P0 surfaces
  const failedP0 = (dbSurfaces || []).filter((s: any) => s.test_priority === "P0" && s.verification_status === "fail");
  const untestedP0 = p0s.filter((p) => {
    const db = (dbSurfaces || []).find((s: any) => s.route_key === p.routeKey);
    return !db || db.verification_status === "untested";
  });

  const launchReady = failedP0.length === 0 && untestedP0.length === 0 && (blockers || []).length === 0;

  return (
    <div className="space-y-6 p-6" data-testid="verification-launch-blockers">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          V07 — Launch Blocker Board
        </h1>
        <p className="text-muted-foreground mt-1">Identifies failures that block pilot/launch readiness</p>
      </div>

      {/* Launch Status */}
      <Card className={launchReady ? "border-green-500/50" : "border-destructive/50"}>
        <CardContent className="p-6 text-center">
          {launchReady ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-xl font-bold text-green-500">Launch Ready</h2>
              <p className="text-muted-foreground">All P0 surfaces verified, no active blockers</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <XCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-bold text-destructive">Launch Blocked</h2>
              <p className="text-muted-foreground">{failedP0.length} failed + {untestedP0.length} untested P0 surfaces + {(blockers || []).length} active blockers</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Failed P0 Surfaces */}
      {failedP0.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /> Failed P0 Surfaces ({failedP0.length})</h3>
            {failedP0.map((s: any) => (
              <div key={s.id} className="p-2 rounded border border-destructive/30 bg-destructive/5 flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm">{s.route_key}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {s.action_label}</span>
                </div>
                <Badge variant="destructive">BLOCKS LAUNCH</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Untested P0 Surfaces */}
      {untestedP0.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-400" /> Untested P0 Surfaces ({untestedP0.length})</h3>
            {untestedP0.map((s) => (
              <div key={s.routeKey} className="p-2 rounded border border-orange-500/30 bg-orange-500/5 flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm">{s.routeKey}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {s.actionLabel}</span>
                </div>
                <Badge variant="outline" className="text-orange-400">NEEDS VERIFICATION</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Blockers */}
      {(blockers || []).length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold">Active Blockers ({(blockers || []).length})</h3>
            {(blockers || []).map((b: any) => (
              <div key={b.id} className="p-2 rounded border border-destructive/30 bg-destructive/5 flex justify-between items-center">
                <div>
                  <Badge variant="destructive" className="mr-2">{b.severity}</Badge>
                  <span className="text-sm">{b.description}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => resolveBlocker.mutate(b.id)}>Resolve</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
