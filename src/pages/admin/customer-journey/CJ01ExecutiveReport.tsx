// ═══════════════════════════════════════════════════════
// SITA OS — CJ01: Customer Journey Executive Report
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustomerJourneys, useSeedJourneys, useJourneyStats, useCustomerJourneyBlockers } from "@/lib/customer-journey/journey-hooks";
import { JOURNEY_STATUS_CONFIG, LAUNCH_IMPACT_CONFIG } from "@/lib/customer-journey/journey-registry";
import { ClipboardCheck, AlertTriangle, Shield, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CJ01ExecutiveReport() {
  const { data: journeys, isLoading } = useCustomerJourneys();
  const { data: blockers } = useCustomerJourneyBlockers();
  const seedMutation = useSeedJourneys();
  const stats = useJourneyStats();

  const handleSeed = () => {
    seedMutation.mutate(undefined, {
      onSuccess: (count) => toast.success(`Seeded ${count} journeys from registry`),
      onError: (e) => toast.error(e.message),
    });
  };

  const unresolvedBlockers = (blockers ?? []).filter((b: any) => !b.resolved);

  return (
    <div className="space-y-6 p-6" data-testid="cj01-executive-report">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            CJ01 — Customer Journey Executive Report
          </h1>
          <p className="text-muted-foreground mt-1">High-level truth summary of the entire user experience</p>
        </div>
        <Button onClick={handleSeed} disabled={seedMutation.isPending} variant="outline">
          {seedMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Seed from Registry
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !journeys?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No journeys seeded yet. Click "Seed from Registry" to populate the journey inventory.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Journeys</div>
              </CardContent>
            </Card>
            {Object.entries(stats.statuses).sort(([,a],[,b]) => b - a).map(([status, count]) => {
              const cfg = JOURNEY_STATUS_CONFIG[status] || { label: status, color: "bg-muted text-muted-foreground" };
              return (
                <Card key={status}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <Badge variant="outline" className={`${cfg.color} text-[10px] mt-1`}>{cfg.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Launch Blockers */}
          {unresolvedBlockers.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  Launch Blockers ({unresolvedBlockers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unresolvedBlockers.slice(0, 10).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded bg-destructive/5 border border-destructive/20">
                    <div>
                      <span className="font-mono text-sm">{b.journey_key}</span>
                      <span className="text-muted-foreground text-xs ml-2">{b.summary}</span>
                    </div>
                    <Badge variant="outline" className="bg-destructive/15 text-destructive text-[10px]">{b.blocker_type}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Domain Scores */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Domain Health Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stats.domainScores.sort((a, b) => a.score - b.score).map((d) => (
                  <div key={d.domain} className="p-3 rounded-lg border bg-card">
                    <div className="font-mono text-sm capitalize">{d.domain}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xl font-bold">{d.score}%</div>
                      <div className="text-xs text-muted-foreground">{d.working}/{d.total} working</div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted mt-2">
                      <div
                        className={`h-1.5 rounded-full ${d.score >= 80 ? "bg-emerald-500" : d.score >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total Verification Runs</span>
                </div>
                <div className="text-2xl font-bold mt-1">{stats.totalRuns}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="font-medium">Unresolved Blockers</span>
                </div>
                <div className="text-2xl font-bold mt-1">{stats.unresolvedBlockers}</div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
