import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Cog, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Clock, Inbox
} from "lucide-react";
import { cloudWorkerService } from "@/platform/cloud/cloud-worker-service";
import type { WorkerJob, WorkerQueueStats } from "@/platform/cloud/cloud-worker-service";
import { toast } from "sonner";

export function CloudWorkerOpsAdmin() {
  const [stats, setStats] = useState<WorkerQueueStats | null>(null);
  const [jobs, setJobs] = useState<WorkerJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([cloudWorkerService.getQueueStats(), cloudWorkerService.getRecentJobs()])
      .then(([s, j]) => { setStats(s); setJobs(j); setLoading(false); });
  }, []);

  const statusIcon: Record<string, React.ElementType> = {
    pending: Clock, processing: Play, completed: CheckCircle, failed: AlertTriangle, dead_letter: Inbox,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Cog className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Worker Operations</h1>
          <p className="text-sm text-muted-foreground">Queue depth, failed jobs, dead-letter, throughput</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Pending", value: stats.pending, color: "text-amber-400" },
            { label: "Processing", value: stats.processing, color: "text-blue-400" },
            { label: "Completed", value: stats.completed, color: "text-emerald-400" },
            { label: "Failed", value: stats.failed, color: "text-red-400" },
            { label: "Dead Letter", value: stats.dead_letter, color: "text-red-500" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cog className="h-4 w-4 text-primary" /> Recent Jobs
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => toast.info("Refreshing...")} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map(j => {
                const Icon = statusIcon[j.status] || Clock;
                return (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium text-sm">{j.job_type.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-3.5 w-3.5 ${cloudWorkerService.getStatusColor(j.status)}`} />
                        <Badge variant="outline" className={`text-xs capitalize ${cloudWorkerService.getStatusColor(j.status)}`}>{j.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">P{j.priority}</Badge></TableCell>
                    <TableCell className="text-sm">{j.attempts}/{j.max_attempts}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
              {jobs.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No jobs found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
