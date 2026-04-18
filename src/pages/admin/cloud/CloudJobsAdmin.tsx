import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wrench, Play, CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { cloudSyncService, type SyncJob } from "@/platform/cloud/cloud-sync-service";
import { toast } from "sonner";

const jobDescriptions: Record<string, { label: string; desc: string; icon: string }> = {
  "reindex": { label: "Reindex User", desc: "Rebuild search index and metadata for a user's files", icon: "🔍" },
  "rebuild-quota": { label: "Rebuild Quota", desc: "Recalculate storage accounting from object store", icon: "📊" },
  "purge-trash": { label: "Purge Trash", desc: "Permanently delete expired items from trash", icon: "🗑️" },
  "retry-sync": { label: "Retry Failed Sync", desc: "Re-attempt all failed sync operations", icon: "🔄" },
  "clear-sessions": { label: "Clear Stale Sessions", desc: "Remove expired device sessions and tokens", icon: "🧹" },
  "verify-blobs": { label: "Verify Blob Integrity", desc: "Check hash consistency for stored objects", icon: "🔐" },
  "restore-version": { label: "Restore Object Version", desc: "Recover a previous version of an object", icon: "⏪" },
};

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  return `${Math.floor(ms / 3600000)}h ago`;
}

export function CloudJobsAdmin() {
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);
  const jobs = cloudSyncService.getJobs();

  const handleTrigger = async (jobType: string) => {
    setTriggeringJob(jobType);
    await cloudSyncService.triggerJob(jobType);
    toast.success(`Job "${jobType}" started successfully`);
    setTriggeringJob(null);
  };

  const statusIcon = (status: SyncJob["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "running": return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "pending": return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
  };

  const statusBadge = (status: SyncJob["status"]): "default" | "secondary" | "destructive" | "outline" => {
    return { completed: "default" as const, running: "secondary" as const, pending: "outline" as const, failed: "destructive" as const }[status];
  };

  return (
    <div className="space-y-4">
      {/* Job Launcher */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Repair & Maintenance Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Object.entries(jobDescriptions).map(([type, { label, desc, icon }]) => (
              <div key={type} className="flex flex-col p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground flex-1 mb-3">{desc}</p>
                <Button
                  size="sm" variant="outline" className="text-xs w-full"
                  disabled={triggeringJob === type}
                  onClick={() => handleTrigger(type)}
                >
                  {triggeringJob === type ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Starting...</>
                  ) : (
                    <><Play className="h-3 w-3 mr-1" /> Run</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Job History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/10">
              {statusIcon(job.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium capitalize">{job.jobType.replace(/-/g, " ")}</span>
                  <Badge variant={statusBadge(job.status)} className="text-[10px] capitalize">{job.status}</Badge>
                  {job.targetUserName && (
                    <span className="text-xs text-muted-foreground">→ {job.targetUserName}</span>
                  )}
                </div>
                {job.status === "running" && (
                  <Progress value={job.progressPct} className="h-1.5 mb-1" />
                )}
                {job.resultSummary && (
                  <p className="text-xs text-muted-foreground">{job.resultSummary}</p>
                )}
                {job.errorMessage && (
                  <p className="text-xs text-red-400">{job.errorMessage}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">
                  {job.startedAt ? timeSince(job.startedAt) : "Queued"}
                </p>
                {job.status === "running" && (
                  <p className="text-[10px] font-medium text-primary">{job.progressPct}%</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
