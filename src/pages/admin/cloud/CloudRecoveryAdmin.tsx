import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, CheckCircle, Clock, Loader2, Play,
  Upload, Download, KeyRound, HardDrive, RefreshCw,
  FileWarning, ShieldAlert, GitMerge, Database, RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface RepairFlow {
  key: string;
  label: string;
  description: string;
  category: "upload" | "download" | "sync" | "storage" | "auth" | "integrity";
  icon: React.ElementType;
  severity: "low" | "medium" | "high";
  estimatedTime: string;
  affectedCount: number;
}

interface RepairRun {
  id: string;
  flowKey: string;
  label: string;
  status: "running" | "completed" | "failed" | "queued";
  progressPct: number;
  startedAt: string;
  completedAt?: string;
  itemsProcessed: number;
  itemsTotal: number;
  errors: number;
  result?: string;
}

const repairFlows: RepairFlow[] = [
  { key: "stuck-uploads", label: "Stuck Uploads", description: "Resume or cancel uploads that have been pending for >30 minutes without progress", category: "upload", icon: Upload, severity: "high", estimatedTime: "~2 min", affectedCount: 3 },
  { key: "stuck-downloads", label: "Stuck Downloads", description: "Clear incomplete downloads and re-queue them with fresh signed URLs", category: "download", icon: Download, severity: "medium", estimatedTime: "~1 min", affectedCount: 1 },
  { key: "invalid-checkpoints", label: "Invalid Checkpoints", description: "Detect and rebuild sync checkpoints that reference missing or corrupted objects", category: "sync", icon: FileWarning, severity: "high", estimatedTime: "~5 min", affectedCount: 4 },
  { key: "corrupted-cache", label: "Corrupted Local Cache", description: "Identify devices with cache integrity failures and trigger re-download of affected files", category: "storage", icon: Database, severity: "medium", estimatedTime: "~3 min", affectedCount: 2 },
  { key: "revoked-tokens", label: "Revoked Device Tokens", description: "Clean up sessions for revoked devices that still have pending operations", category: "auth", icon: KeyRound, severity: "low", estimatedTime: "~30 sec", affectedCount: 5 },
  { key: "quota-mismatches", label: "Quota Mismatches", description: "Recalculate actual storage usage vs recorded quotas and fix discrepancies", category: "storage", icon: HardDrive, severity: "medium", estimatedTime: "~4 min", affectedCount: 6 },
  { key: "orphaned-blobs", label: "Orphaned Blobs", description: "Find storage objects not referenced by any file record and quarantine them", category: "integrity", icon: ShieldAlert, severity: "low", estimatedTime: "~8 min", affectedCount: 12 },
  { key: "sync-conflicts", label: "Sync Conflicts", description: "Auto-resolve conflicts using last-write-wins or surface for manual resolution", category: "sync", icon: GitMerge, severity: "high", estimatedTime: "~2 min", affectedCount: 7 },
  { key: "missing-versions", label: "Missing Version Rows", description: "Detect objects with gaps in version history and rebuild from storage backend", category: "integrity", icon: RotateCcw, severity: "medium", estimatedTime: "~6 min", affectedCount: 3 },
  { key: "failed-resumable", label: "Failed Resumable Uploads", description: "Retry multipart uploads that failed mid-stream with fresh upload sessions", category: "upload", icon: RefreshCw, severity: "high", estimatedTime: "~3 min", affectedCount: 2 },
];

const demoRuns: RepairRun[] = [
  { id: "r1", flowKey: "quota-mismatches", label: "Quota Mismatches", status: "completed", progressPct: 100, startedAt: new Date(Date.now() - 3600000).toISOString(), completedAt: new Date(Date.now() - 3500000).toISOString(), itemsProcessed: 6, itemsTotal: 6, errors: 0, result: "Fixed 4 discrepancies totaling 2.3 GB" },
  { id: "r2", flowKey: "orphaned-blobs", label: "Orphaned Blobs", status: "completed", progressPct: 100, startedAt: new Date(Date.now() - 7200000).toISOString(), completedAt: new Date(Date.now() - 6800000).toISOString(), itemsProcessed: 12, itemsTotal: 12, errors: 1, result: "Quarantined 11 blobs (847 MB), 1 skipped (in-use reference found)" },
  { id: "r3", flowKey: "sync-conflicts", label: "Sync Conflicts", status: "running", progressPct: 43, startedAt: new Date(Date.now() - 120000).toISOString(), itemsProcessed: 3, itemsTotal: 7, errors: 0 },
  { id: "r4", flowKey: "stuck-uploads", label: "Stuck Uploads", status: "failed", progressPct: 67, startedAt: new Date(Date.now() - 1800000).toISOString(), completedAt: new Date(Date.now() - 1700000).toISOString(), itemsProcessed: 2, itemsTotal: 3, errors: 1, result: "1 upload unrecoverable — file no longer exists on source device" },
];

const categoryColors: Record<string, string> = {
  upload: "bg-blue-500/10 text-blue-400",
  download: "bg-cyan-500/10 text-cyan-400",
  sync: "bg-purple-500/10 text-purple-400",
  storage: "bg-amber-500/10 text-amber-400",
  auth: "bg-red-500/10 text-red-400",
  integrity: "bg-emerald-500/10 text-emerald-400",
};

const severityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-red-500/10 text-red-400",
};

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}

export function CloudRecoveryAdmin() {
  const [runningFlows, setRunningFlows] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [runs] = useState(demoRuns);

  const handleRunRepair = async (flow: RepairFlow) => {
    setRunningFlows(prev => new Set(prev).add(flow.key));
    await new Promise(r => setTimeout(r, 2000));
    toast.success(`Repair "${flow.label}" completed — ${flow.affectedCount} items processed`);
    setRunningFlows(prev => {
      const next = new Set(prev);
      next.delete(flow.key);
      return next;
    });
  };

  const categories = ["all", "upload", "download", "sync", "storage", "auth", "integrity"];
  const filtered = categoryFilter === "all" ? repairFlows : repairFlows.filter(f => f.category === categoryFilter);

  const totalAffected = repairFlows.reduce((s, f) => s + f.affectedCount, 0);
  const highSeverity = repairFlows.filter(f => f.severity === "high").length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Repair Flows</p>
            <p className="text-2xl font-bold text-foreground mt-1">{repairFlows.length}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card className={highSeverity > 0 ? "border-red-500/30" : ""}>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">High Severity</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{highSeverity}</p>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Affected Items</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalAffected}</p>
            <p className="text-xs text-muted-foreground">Across all flows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Last Repair</p>
            <p className="text-2xl font-bold text-foreground mt-1">{timeSince(runs[0].startedAt)}</p>
            <p className="text-xs text-muted-foreground">{runs[0].label}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        {categories.map(c => (
          <Button key={c} size="sm" variant={categoryFilter === c ? "default" : "outline"} onClick={() => setCategoryFilter(c)} className="capitalize text-xs">
            {c === "all" ? "All Categories" : c}
          </Button>
        ))}
      </div>

      {/* Repair Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(flow => {
          const Icon = flow.icon;
          const isRunning = runningFlows.has(flow.key);
          return (
            <Card key={flow.key} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[flow.category]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{flow.label}</h3>
                      <Badge className={`text-[10px] ${severityColors[flow.severity]}`}>{flow.severity}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{flow.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{flow.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {flow.affectedCount} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {flow.estimatedTime}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs" disabled={isRunning} onClick={() => handleRunRepair(flow)}>
                        {isRunning ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running...</>
                        ) : (
                          <><Play className="h-3 w-3 mr-1" /> Run Repair</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Repair History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Repair History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {runs.map(run => (
            <div key={run.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-muted/10">
              <div className="mt-0.5">
                {run.status === "completed" && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                {run.status === "running" && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                {run.status === "failed" && <AlertTriangle className="h-5 w-5 text-red-400" />}
                {run.status === "queued" && <Clock className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{run.label}</span>
                  <Badge variant={run.status === "completed" ? "default" : run.status === "failed" ? "destructive" : "secondary"} className="text-[10px] capitalize">
                    {run.status}
                  </Badge>
                  {run.errors > 0 && (
                    <Badge variant="destructive" className="text-[10px]">{run.errors} error{run.errors > 1 ? "s" : ""}</Badge>
                  )}
                </div>
                {run.status === "running" && (
                  <div className="space-y-1 mb-2">
                    <Progress value={run.progressPct} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">{run.itemsProcessed}/{run.itemsTotal} items · {run.progressPct}%</p>
                  </div>
                )}
                {run.result && (
                  <p className="text-xs text-muted-foreground">{run.result}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-muted-foreground">{timeSince(run.startedAt)}</p>
                {run.completedAt && (
                  <p className="text-[10px] text-muted-foreground">
                    {Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}