import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAllJobs, cancelJob } from "@/lib/recovery-ops/recovery-job-service";
import type { RecoveryJob } from "@/lib/recovery-ops/types";
import { Loader2, CheckCircle2, XCircle, Ban, Clock } from "lucide-react";

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  running: <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />,
  failed: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  cancelled: <Ban className="h-3.5 w-3.5 text-muted-foreground" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-primary/20 text-primary",
  completed: "bg-green-500/20 text-green-300",
  failed: "bg-destructive/20 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function RecoveryJobMonitor() {
  const [jobs, setJobs] = useState<RecoveryJob[]>([]);

  // Poll every second for active jobs
  useEffect(() => {
    const poll = setInterval(() => setJobs(getAllJobs()), 1000);
    setJobs(getAllJobs());
    return () => clearInterval(poll);
  }, []);

  if (jobs.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No recovery jobs have been run yet. Use the actions below to start one.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id} className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {statusIcons[job.status]}
                <CardTitle className="text-sm text-foreground">{job.label}</CardTitle>
                <Badge variant="outline" className={statusColors[job.status]}>
                  {job.status}
                </Badge>
                {job.isDryRun && (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 text-[10px]">
                    DRY RUN
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{job.id}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {job.status === "running" && (
              <div className="flex items-center gap-3">
                <Progress value={job.progress} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-10 text-right">{job.progress}%</span>
                <Button size="sm" variant="ghost" className="text-xs h-6" onClick={() => cancelJob(job.id)}>
                  Cancel
                </Button>
              </div>
            )}
            {job.error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded p-2">{job.error}</p>
            )}
            {job.result && (
              <p className="text-xs text-muted-foreground">
                Processed: {(job.result as any).itemsProcessed} items
                {(job.result as any).dryRun ? " (simulated)" : ""}
              </p>
            )}
            <div className="flex gap-4 text-[10px] text-muted-foreground">
              <span>Started: {new Date(job.startedAt).toLocaleTimeString()}</span>
              {job.completedAt && <span>Completed: {new Date(job.completedAt).toLocaleTimeString()}</span>}
              <span>Type: {job.actionType}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}