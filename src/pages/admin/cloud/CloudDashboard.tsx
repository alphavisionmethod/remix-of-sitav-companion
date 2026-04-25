import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import {
  Users, HardDrive, RefreshCw, Wifi, AlertTriangle, Smartphone,
  ArrowUpRight, ArrowDownRight, CheckCircle, Activity
} from "lucide-react";
import { cloudStorageService } from "@/platform/cloud/cloud-storage-service";
import { cloudSyncService } from "@/platform/cloud/cloud-sync-service";
import { cloudDeviceService } from "@/platform/cloud/cloud-device-service";
import { cloudQuotaService } from "@/platform/cloud/cloud-quota-service";
import { cloudAuditService } from "@/platform/cloud/cloud-audit-service";

const sparkData = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ElementType;
  sparkline?: number[];
}

function MetricCard({ title, value, change, trend, icon: Icon, sparkline }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {change}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            {sparkline && <SparklineChart data={sparkline} width={64} height={20} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CloudDashboard() {
  const storageHealth = cloudStorageService.getHealthReport();
  const syncHealth = cloudSyncService.getHealthReport();
  const deviceFleet = cloudDeviceService.getFleetReport();
  const quotaOverview = cloudQuotaService.getOverview();
  const alerts = cloudAuditService.getSecurityAlerts();
  const unackedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Active Users" value={String(quotaOverview.totalUsers)} change="+12 this week" trend="up" icon={Users} sparkline={sparkData()} />
        <MetricCard title="Storage Used" value={cloudStorageService.formatBytes(storageHealth.totalUsedBytes)} change={`${storageHealth.avgUsagePct}% avg usage`} trend="up" icon={HardDrive} sparkline={sparkData()} />
        <MetricCard title="Sync Health" value={syncHealth.websocketHealthy ? "Healthy" : "Degraded"} change={`${syncHealth.websocketConnections} connections`} trend="up" icon={RefreshCw} sparkline={sparkData()} />
        <MetricCard title="Devices" value={String(deviceFleet.totalDevices)} change={`${deviceFleet.avgDevicesPerUser} avg/user`} trend="up" icon={Smartphone} sparkline={sparkData()} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sync Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Queue Depth</span>
              <span className="font-medium">{syncHealth.queueDepth}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conflict Backlog</span>
              <Badge variant={syncHealth.conflictBacklog > 5 ? "destructive" : "secondary"} className="text-xs">{syncHealth.conflictBacklog}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stuck Queues</span>
              <Badge variant={syncHealth.stuckQueues > 0 ? "destructive" : "default"} className="text-xs">{syncHealth.stuckQueues}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Latency</span>
              <span className="font-medium">{syncHealth.avgSyncLatencyMs}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">WebSocket</span>
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${syncHealth.websocketHealthy ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-xs">{syncHealth.websocketHealthy ? "Connected" : "Degraded"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              Storage Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total Usage</span>
                <span className="font-medium">{storageHealth.avgUsagePct}%</span>
              </div>
              <Progress value={storageHealth.avgUsagePct} className="h-2" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Orphaned Blobs</span>
              <Badge variant={storageHealth.orphanedBlobsTotal > 0 ? "secondary" : "default"} className="text-xs">{storageHealth.orphanedBlobsTotal}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Failed Uploads</span>
              <span className="font-medium">{storageHealth.failedUploadsTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Failed Downloads</span>
              <span className="font-medium">{storageHealth.failedDownloadsTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Backend</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-400" />
                <span className="text-xs">Healthy</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Top Alerts
              {unackedAlerts.length > 0 && (
                <Badge variant="destructive" className="text-xs ml-auto">{unackedAlerts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                  alert.severity === "critical" ? "bg-red-400" : alert.severity === "warning" ? "bg-amber-400" : "bg-blue-400"
                }`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{alert.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{alert.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Free Tier", count: quotaOverview.freeTierUsers, color: "bg-muted" },
              { label: "Pro", count: quotaOverview.proUsers, color: "bg-primary/20" },
              { label: "Enterprise", count: quotaOverview.enterpriseUsers, color: "bg-amber-500/20" },
              { label: "Trial", count: quotaOverview.trialUsers, color: "bg-blue-500/20" },
              { label: "Over Quota", count: quotaOverview.overQuotaUsers, color: "bg-red-500/20" },
            ].map(({ label, count, color }) => (
              <div key={label} className={`rounded-lg p-3 ${color}`}>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
