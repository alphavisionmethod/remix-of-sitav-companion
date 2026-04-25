import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import {
  Activity, Upload, Download, AlertTriangle, HardDrive, GitMerge,
  Wifi, RotateCcw, Clock, CheckCircle, Gauge, TrendingUp,
  ArrowUpRight, ArrowDownRight, Bell
} from "lucide-react";
import { cloudSyncService } from "@/platform/cloud/cloud-sync-service";
import { cloudStorageService } from "@/platform/cloud/cloud-storage-service";

const spark = () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));

interface MetricRow {
  label: string;
  value: string;
  target: string;
  pct: number;
  status: "healthy" | "warning" | "critical";
  sparkline: number[];
  icon: React.ElementType;
}

export function CloudMonitoringAdmin() {
  const syncHealth = cloudSyncService.getHealthReport();
  const storageHealth = cloudStorageService.getHealthReport();

  const metrics: MetricRow[] = [
    { label: "Upload Success Rate", value: "99.2%", target: "≥99%", pct: 99.2, status: "healthy", sparkline: spark(), icon: Upload },
    { label: "Download Success Rate", value: "99.8%", target: "≥99.5%", pct: 99.8, status: "healthy", sparkline: spark(), icon: Download },
    { label: "Sync Conflict Rate", value: "0.3%", target: "<1%", pct: 70, status: "healthy", sparkline: spark(), icon: GitMerge },
    { label: "WebSocket Connections", value: String(syncHealth.websocketConnections), target: ">50", pct: Math.min(100, (syncHealth.websocketConnections / 300) * 100), status: syncHealth.websocketHealthy ? "healthy" : "critical", sparkline: spark(), icon: Wifi },
    { label: "Reconnect Frequency", value: "2.1/hr", target: "<5/hr", pct: 42, status: "healthy", sparkline: spark(), icon: RotateCcw },
    { label: "Quota Errors", value: "3", target: "<10", pct: 30, status: "healthy", sparkline: spark(), icon: AlertTriangle },
    { label: "Storage Growth", value: "+2.4 GB/day", target: "<5 GB/day", pct: 48, status: "healthy", sparkline: spark(), icon: HardDrive },
    { label: "Active Sync Clients", value: "187", target: ">100", pct: 93, status: "healthy", sparkline: spark(), icon: Activity },
    { label: "Admin Job Success", value: "96%", target: "≥95%", pct: 96, status: "healthy", sparkline: spark(), icon: CheckCircle },
    { label: "Storage Backend P95", value: `${Math.floor(Math.random() * 200 + 100)}ms`, target: "<500ms", pct: 35, status: "healthy", sparkline: spark(), icon: Gauge },
  ];

  const alertRules = [
    { name: "Upload Failure Spike", condition: "Failure rate >5% for 5m", status: "armed", lastFired: "3d ago", icon: Upload },
    { name: "Storage Backend Latency", condition: "P95 >500ms for 10m", status: "armed", lastFired: "1d ago", icon: Clock },
    { name: "WebSocket Disconnects", condition: ">50 disconnects/min", status: "armed", lastFired: "Never", icon: Wifi },
    { name: "Conflict Rate Surge", condition: "Conflict rate >5% for 15m", status: "armed", lastFired: "7d ago", icon: GitMerge },
    { name: "Quota Exceeded Burst", condition: ">10 quota errors/hr", status: "muted", lastFired: "14d ago", icon: AlertTriangle },
    { name: "Mass Deletion Alert", condition: ">500 deletes in 5m by single user", status: "armed", lastFired: "1h ago", icon: AlertTriangle },
  ];

  const traces = [
    { traceId: "t-a8f3c1", operation: "file.upload", duration: "342ms", spans: 5, status: "ok", timestamp: "2m ago" },
    { traceId: "t-b2d4e7", operation: "sync.push", duration: "128ms", spans: 3, status: "ok", timestamp: "5m ago" },
    { traceId: "t-c9a1f0", operation: "file.download", duration: "1.2s", spans: 7, status: "slow", timestamp: "8m ago" },
    { traceId: "t-d3e8b2", operation: "auth.refresh", duration: "89ms", spans: 2, status: "ok", timestamp: "12m ago" },
    { traceId: "t-e5f7c4", operation: "sync.conflict_resolve", duration: "567ms", spans: 6, status: "ok", timestamp: "15m ago" },
    { traceId: "t-f1d9a3", operation: "storage.reconcile", duration: "4.3s", spans: 12, status: "slow", timestamp: "22m ago" },
  ];

  const statusColor = (s: string) => s === "healthy" ? "text-emerald-400" : s === "warning" ? "text-amber-400" : "text-red-400";
  const statusBg = (s: string) => s === "healthy" ? "bg-emerald-500/10" : s === "warning" ? "bg-amber-500/10" : "bg-red-500/10";

  return (
    <div className="space-y-6">
      {/* Top-level Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "System Health", value: "98.7%", trend: "+0.3%", up: true, icon: Activity },
          { label: "Uptime (30d)", value: "99.97%", trend: "3m downtime", up: true, icon: TrendingUp },
          { label: "Failed Ops", value: String(storageHealth.failedUploadsTotal + storageHealth.failedDownloadsTotal), trend: "-2 vs yesterday", up: true, icon: AlertTriangle },
          { label: "Avg Latency", value: `${syncHealth.avgSyncLatencyMs}ms`, trend: syncHealth.avgSyncLatencyMs < 150 ? "Within SLA" : "Above SLA", up: syncHealth.avgSyncLatencyMs < 150, icon: Clock },
          { label: "Alerts Active", value: "2", trend: "1 critical", up: false, icon: Bell },
        ].map(({ label, value, trend, up, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <div className={`flex items-center gap-1 text-[10px] font-medium ${up ? "text-emerald-400" : "text-amber-400"}`}>
                {up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                {trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Platform Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="flex items-center gap-4 p-3 rounded-lg bg-muted/10 border border-border/20">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusBg(m.status)}`}>
                    <Icon className={`h-4 w-4 ${statusColor(m.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{m.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Target: {m.target}</span>
                        <span className={`text-sm font-bold ${statusColor(m.status)}`}>{m.value}</span>
                      </div>
                    </div>
                    <Progress value={m.pct} className="h-1" />
                  </div>
                  <div className="flex-shrink-0 hidden md:block">
                    <SparklineChart data={m.sparkline} width={80} height={24} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alert Rules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Alert Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertRules.map(rule => {
              const Icon = rule.icon;
              return (
                <div key={rule.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{rule.name}</span>
                      <Badge variant={rule.status === "armed" ? "default" : "outline"} className="text-[10px] capitalize">{rule.status}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{rule.condition}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">Fired: {rule.lastFired}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Traces */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Traces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {traces.map(trace => (
              <div key={trace.traceId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${trace.status === "ok" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground">{trace.operation}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{trace.traceId}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-[10px] font-medium ${trace.status === "ok" ? "text-emerald-400" : "text-amber-400"}`}>{trace.duration}</span>
                    <span className="text-[10px] text-muted-foreground">{trace.spans} spans</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{trace.timestamp}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}