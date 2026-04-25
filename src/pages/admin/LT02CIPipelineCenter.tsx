import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import LTSubNav from "@/platform/admin/components/admin/LTSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LT02CIPipelineCenter = () => {
  const { data: ciRuns } = useQuery({
    queryKey: ["ci-runs"],
    queryFn: async () => {
      const { data } = await fromTable("ci_runs").select("*").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const { data: ciJobs } = useQuery({
    queryKey: ["ci-jobs-recent"],
    queryFn: async () => {
      const { data } = await fromTable("ci_jobs").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const latestRun = ciRuns?.[0];
  const successCount = ciRuns?.filter((r: Record<string, any>) => r.status === "success").length ?? 0;
  const failCount = ciRuns?.filter((r: Record<string, any>) => r.status === "failure").length ?? 0;

  const statusColor = (s: string) => {
    if (s === "success") return "default";
    if (s === "failure") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6 p-6">
      <LTSubNav />
<div>
        <h1 className="text-2xl font-bold">CI Pipeline Center</h1>
        <p className="text-sm text-muted-foreground">Inspect CI status, quality gates, and job breakdown</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" />Total Runs</div>
            <div className="text-3xl font-bold">{ciRuns?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><CheckCircle className="h-4 w-4 text-green-500" />Passing</div>
            <div className="text-3xl font-bold text-green-600">{successCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><XCircle className="h-4 w-4 text-destructive" />Failing</div>
            <div className="text-3xl font-bold text-destructive">{failCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Clock className="h-4 w-4" />Latest</div>
            <Badge variant={statusColor(latestRun?.status ?? "pending")}>{latestRun?.status ?? "none"}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Runs Table */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" />Pipeline Runs</CardTitle></CardHeader>
        <CardContent>
          {ciRuns && ciRuns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">Branch</th><th className="p-2">Commit</th><th className="p-2">Trigger</th><th className="p-2">Status</th><th className="p-2">Time</th>
                </tr></thead>
                <tbody>
                  {ciRuns.map((run: Record<string, any>) => (
                    <tr key={run.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-xs">{run.branch ?? "—"}</td>
                      <td className="p-2 font-mono text-xs">{run.commit_sha?.slice(0, 8) ?? "—"}</td>
                      <td className="p-2">{run.trigger_type}</td>
                      <td className="p-2"><Badge variant={statusColor(run.status)}>{run.status}</Badge></td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(run.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No CI runs recorded yet. Runs populate from GitHub Actions.</p>
          )}
        </CardContent>
      </Card>

      {/* Job Breakdown */}
      <Card>
        <CardHeader><CardTitle>Job Breakdown</CardTitle></CardHeader>
        <CardContent>
          {ciJobs && ciJobs.length > 0 ? (
            <div className="space-y-2">
              {ciJobs.slice(0, 10).map((job: Record<string, any>) => (
                <div key={job.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <span className="font-medium">{job.job_name}</span>
                    {job.duration_ms && <span className="text-xs text-muted-foreground ml-2">{(job.duration_ms / 1000).toFixed(1)}s</span>}
                  </div>
                  <Badge variant={statusColor(job.status)}>{job.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No job data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LT02CIPipelineCenter;
