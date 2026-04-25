import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube, Play, Camera, Filter } from "lucide-react";
import LTSubNav from "@/platform/admin/components/admin/LTSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LT03E2EJourneyBoard = () => {
  const { data: journeys } = useQuery({
    queryKey: ["e2e-journeys-all"],
    queryFn: async () => {
      const { data } = await fromTable("e2e_journeys").select("*").order("criticality").limit(100);
      return data ?? [];
    },
  });

  const { data: runs } = useQuery({
    queryKey: ["e2e-runs-all"],
    queryFn: async () => {
      const { data } = await fromTable("e2e_runs").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const getLatestRun = (journeyId: string) => runs?.find((r: Record<string, any>) => r.journey_id === journeyId);

  return (
    <div className="space-y-6 p-6">
      <LTSubNav />
<div>
        <h1 className="text-2xl font-bold">E2E Journey Board</h1>
        <p className="text-sm text-muted-foreground">Inspect end-to-end truth by journey, criticality, and mode</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Total Journeys</div>
            <div className="text-3xl font-bold">{journeys?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Recent Runs</div>
            <div className="text-3xl font-bold">{runs?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Pass Rate</div>
            <div className="text-3xl font-bold">
              {runs && runs.length > 0 ? Math.round((runs.filter((r: Record<string, any>) => r.status === "pass").length / runs.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5" />Journey Registry</CardTitle></CardHeader>
        <CardContent>
          {journeys && journeys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">Journey</th><th className="p-2">Domain</th><th className="p-2">Criticality</th><th className="p-2">Mode</th><th className="p-2">Latest</th>
                </tr></thead>
                <tbody>
                  {journeys.map((j: Record<string, any>) => {
                    const latest = getLatestRun(j.id);
                    return (
                      <tr key={j.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{j.name}</td>
                        <td className="p-2">{j.domain}</td>
                        <td className="p-2"><Badge variant={j.criticality === "p0" ? "destructive" : "secondary"}>{j.criticality}</Badge></td>
                        <td className="p-2"><Badge variant="outline">{j.mode}</Badge></td>
                        <td className="p-2">{latest ? <Badge variant={latest.status === "pass" ? "default" : "destructive"}>{latest.status}</Badge> : <span className="text-muted-foreground text-xs">not run</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No E2E journeys registered yet. Journeys populate from test execution.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Runs */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Play className="h-5 w-5" />Recent Runs</CardTitle></CardHeader>
        <CardContent>
          {runs && runs.length > 0 ? (
            <div className="space-y-2">
              {runs.slice(0, 10).map((run: Record<string, any>) => (
                <div key={run.id} className="flex items-center justify-between p-3 rounded border">
                  <div>
                    <p className="font-medium text-sm">{run.environment} run</p>
                    <p className="text-xs text-muted-foreground">{run.steps_passed} passed · {run.steps_failed} failed · {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : "—"}</p>
                  </div>
                  <Badge variant={run.status === "pass" ? "default" : "destructive"}>{run.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No runs yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LT03E2EJourneyBoard;
