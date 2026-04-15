import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Wifi, Activity } from "lucide-react";
import { cloudSyncService } from "@/lib/cloud-backbone/cloud-sync-service";
import { toast } from "sonner";

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  return `${Math.floor(ms / 3600000)}h ago`;
}

export function CloudSyncAdmin() {
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);
  const health = cloudSyncService.getHealthReport();
  const conflicts = cloudSyncService.getConflicts();
  const delayed = cloudSyncService.getDelayedUsers();
  const namespaces = cloudSyncService.getNamespaceStatuses();
  const jobs = cloudSyncService.getJobs();

  const handleTriggerRepair = async (type: string) => {
    setTriggeringJob(type);
    await cloudSyncService.triggerJob(type);
    toast.success(`Job "${type}" started`);
    setTriggeringJob(null);
  };

  return (
    <div className="space-y-4">
      {/* Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Queue Depth", value: health.queueDepth, icon: Activity, warn: health.queueDepth > 30 },
          { label: "Conflicts", value: health.conflictBacklog, icon: AlertTriangle, warn: health.conflictBacklog > 5 },
          { label: "WebSocket", value: health.websocketHealthy ? "Healthy" : "Degraded", icon: Wifi, warn: !health.websocketHealthy },
          { label: "Avg Latency", value: `${health.avgSyncLatencyMs}ms`, icon: Clock, warn: health.avgSyncLatencyMs > 200 },
        ].map(({ label, value, icon: Icon, warn }) => (
          <Card key={label} className={warn ? "border-amber-500/30" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${warn ? "text-amber-400" : "text-primary"}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Namespace Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Namespace Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-auto">
            {namespaces.map(ns => (
              <div key={ns.namespace} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  {ns.healthy ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <AlertTriangle className="h-3 w-3 text-amber-400" />}
                  <span className="text-sm font-mono">{ns.namespace}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{ns.objectCount.toLocaleString()} obj</span>
                  {ns.conflicts > 0 && <Badge variant="destructive" className="text-[10px]">{ns.conflicts} conflicts</Badge>}
                  {ns.pendingChanges > 0 && <Badge variant="secondary" className="text-[10px]">{ns.pendingChanges} pending</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Conflict Backlog */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Conflict Backlog
              <Badge variant="secondary" className="text-xs">{conflicts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflicts.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">{c.userName}</TableCell>
                    <TableCell className="text-xs font-mono">{c.namespace}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "resolved" ? "default" : c.status === "escalated" ? "destructive" : "secondary"} className="text-[10px] capitalize">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeSince(c.detectedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Delayed Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Delayed Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {delayed.map(u => (
              <div key={u.userId} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{u.userName}</p>
                  <p className="text-xs text-muted-foreground">{u.reason} · {u.pendingChanges} pending</p>
                </div>
                <span className="text-xs text-muted-foreground">{timeSince(u.lastSyncAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Repair Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" /> Quick Repairs
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {["reindex", "rebuild-quota", "retry-sync", "clear-sessions"].map(type => (
              <Button key={type} size="sm" variant="outline" className="text-xs capitalize"
                disabled={triggeringJob === type}
                onClick={() => handleTriggerRepair(type)}>
                {triggeringJob === type ? "Running..." : type.replace("-", " ")}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
