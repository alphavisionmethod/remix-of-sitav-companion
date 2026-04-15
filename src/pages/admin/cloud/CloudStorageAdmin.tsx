import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HardDrive, AlertTriangle, CheckCircle, RefreshCw, Database } from "lucide-react";
import { cloudStorageService } from "@/lib/cloud-backbone/cloud-storage-service";
import { toast } from "sonner";

export function CloudStorageAdmin() {
  const [reconciling, setReconciling] = useState(false);
  const health = cloudStorageService.getHealthReport();
  const buckets = cloudStorageService.getBucketStats();
  const topUsers = health.topUsers;

  const handleReconcile = async () => {
    setReconciling(true);
    const result = await cloudStorageService.runReconciliation();
    toast.success(`Reconciliation complete: ${result.found} issues found, ${result.fixed} fixed`);
    setReconciling(false);
  };

  return (
    <div className="space-y-4">
      {/* Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Used</span>
            </div>
            <p className="text-xl font-bold">{cloudStorageService.formatBytes(health.totalUsedBytes)}</p>
            <Progress value={health.avgUsagePct} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Orphaned Blobs</span>
            </div>
            <p className="text-xl font-bold">{health.orphanedBlobsTotal}</p>
            <p className="text-xs text-muted-foreground mt-1">Unlinked objects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Backend Health</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium">Healthy</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Last Reconciliation</span>
            </div>
            <p className="text-sm font-medium mt-1">{health.lastReconciliation ? new Date(health.lastReconciliation).toLocaleTimeString() : "Never"}</p>
            <Button size="sm" variant="outline" className="mt-2 text-xs w-full" disabled={reconciling} onClick={handleReconcile}>
              {reconciling ? "Running..." : "Run Reconciliation"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bucket Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Bucket / Object Stats</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Objects</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Avg Object</TableHead>
                  <TableHead>Largest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buckets.map(b => (
                  <TableRow key={b.name}>
                    <TableCell className="font-mono text-xs">{b.name}</TableCell>
                    <TableCell className="text-sm">{b.objectCount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{cloudStorageService.formatBytes(b.totalBytes)}</TableCell>
                    <TableCell className="text-sm">{cloudStorageService.formatBytes(b.avgObjectSize)}</TableCell>
                    <TableCell className="text-sm">{cloudStorageService.formatBytes(b.largestObject)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Users by Storage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Largest Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topUsers.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">User #{u.user_id.slice(0, 8)}</span>
                    <span className="text-xs text-muted-foreground">{cloudStorageService.formatBytes(u.used_bytes)}</span>
                  </div>
                  <Progress value={u.usage_pct} className="h-1.5" />
                </div>
                {u.usage_pct > 90 && <Badge variant="destructive" className="text-[10px]">{u.usage_pct}%</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quota Anomalies */}
      {health.quotaAnomalies.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Quota Anomalies ({health.quotaAnomalies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.quotaAnomalies.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded bg-amber-500/5 border border-amber-500/20">
                  <div>
                    <p className="text-sm font-medium">User #{a.user_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{cloudStorageService.formatBytes(a.used_bytes)} / {cloudStorageService.formatBytes(a.quota_bytes)}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">{a.usage_pct}% used</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
