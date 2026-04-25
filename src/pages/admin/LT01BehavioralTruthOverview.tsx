import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, XCircle, Activity, Route, Brain, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import LTSubNav from "@/platform/admin/components/admin/LTSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LT01BehavioralTruthOverview = () => {
  const { data: routeTruth } = useQuery({
    queryKey: ["route-truth-summary"],
    queryFn: async () => {
      const { data } = await fromTable("route_truth_records").select("status, route").order("created_at", { ascending: false }).limit(100);
      const passing = data?.filter(r => r.status === "pass").length ?? 0;
      const failing = data?.filter(r => r.status === "fail").length ?? 0;
      const total = data?.length ?? 0;
      return { passing, failing, total, routes: data ?? [] };
    },
  });

  const { data: regressions } = useQuery({
    queryKey: ["behavioral-regressions-active"],
    queryFn: async () => {
      const { data } = await fromTable("behavioral_regressions").select("*").eq("resolved", false).order("last_seen_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const { data: e2eJourneys } = useQuery({
    queryKey: ["e2e-journey-summary"],
    queryFn: async () => {
      const { data } = await fromTable("e2e_journeys").select("*").eq("enabled", true).limit(50);
      return data ?? [];
    },
  });

  const { data: e2eRuns } = useQuery({
    queryKey: ["e2e-runs-recent"],
    queryFn: async () => {
      const { data } = await fromTable("e2e_runs").select("status, journey_id").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const totalJourneys = e2eJourneys?.length ?? 0;
  const passingJourneys = e2eRuns?.filter(r => r.status === "pass").length ?? 0;
  const healthScore = routeTruth?.total ? Math.round((routeTruth.passing / routeTruth.total) * 100) : 0;
  const blockerCount = regressions?.length ?? 0;

  return (
    <div className="space-y-6 p-6">
      <LTSubNav />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Behavioral Truth Overview</h1>
          <p className="text-sm text-muted-foreground">Executive view of actual product behavior health</p>
        </div>
        <Badge variant={blockerCount === 0 ? "default" : "destructive"} className="text-base px-4 py-1">
          {blockerCount === 0 ? "No Blockers" : `${blockerCount} Blockers`}
        </Badge>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Route className="h-4 w-4" />Route Health</div>
            <div className="text-3xl font-bold">{healthScore}%</div>
            <p className="text-xs text-muted-foreground">{routeTruth?.passing ?? 0}/{routeTruth?.total ?? 0} passing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><ShieldCheck className="h-4 w-4" />P0 Journeys</div>
            <div className="text-3xl font-bold">{totalJourneys}</div>
            <p className="text-xs text-muted-foreground">{passingJourneys} recently passing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><AlertTriangle className="h-4 w-4" />Active Regressions</div>
            <div className="text-3xl font-bold text-destructive">{blockerCount}</div>
            <p className="text-xs text-muted-foreground">Unresolved behavioral failures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Activity className="h-4 w-4" />Truth Score</div>
            <Progress value={healthScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{healthScore >= 80 ? "Launch eligible" : "Below threshold"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Regression Alerts */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-destructive" />Regression Alert Lane</CardTitle></CardHeader>
        <CardContent>
          {regressions && regressions.length > 0 ? (
            <div className="space-y-2">
              {regressions.map((r: Record<string, any>) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{r.description || r.route || "Unknown regression"}</p>
                    <p className="text-xs text-muted-foreground">{r.domain} · {r.severity} · seen {r.occurrence_count}x</p>
                  </div>
                  <Badge variant="destructive">{r.regression_type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active regressions — behavioral health is clean.</p>
          )}
        </CardContent>
      </Card>

      {/* Route Health Summary */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5" />Recent Route Verifications</CardTitle></CardHeader>
        <CardContent>
          {routeTruth?.routes && routeTruth.routes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {routeTruth.routes.slice(0, 12).map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border text-sm">
                  <span className="font-mono text-xs truncate">{r.route}</span>
                  <Badge variant={r.status === "pass" ? "default" : "destructive"} className="text-xs">{r.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No route truth records yet. Run probes to populate.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LT01BehavioralTruthOverview;
