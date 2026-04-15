import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Upload, Clock, Wifi, GitMerge, AlertTriangle,
  Image, Wrench, TrendingUp, CheckCircle, XCircle, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCard {
  key: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  health: "good" | "warning" | "critical";
  icon: typeof Activity;
  description: string;
}

function getDemoMetrics(): MetricCard[] {
  return [
    { key: "upload_success_rate", label: "Upload Success Rate", value: 99.7, unit: "%", trend: "stable", health: "good", icon: Upload, description: "Percentage of uploads completing without error" },
    { key: "finalize_latency_p95", label: "Finalize Latency (P95)", value: 320, unit: "ms", trend: "down", health: "good", icon: Clock, description: "95th percentile time to finalize uploaded objects" },
    { key: "blob_storage_latency", label: "Blob Storage Latency", value: 45, unit: "ms", trend: "stable", health: "good", icon: Clock, description: "Average GET latency from object storage backend" },
    { key: "websocket_active_clients", label: "Active WS Clients", value: 1247, unit: "", trend: "up", health: "good", icon: Wifi, description: "Currently connected real-time sync clients" },
    { key: "reconnect_rate", label: "Reconnect Rate", value: 2.3, unit: "%", trend: "stable", health: "good", icon: Wifi, description: "Percentage of clients reconnecting per hour" },
    { key: "conflict_rate", label: "Conflict Rate", value: 0.4, unit: "%", trend: "down", health: "good", icon: GitMerge, description: "Percentage of sync ops resulting in conflicts" },
    { key: "quota_mismatch_count", label: "Quota Mismatches", value: 3, unit: "", trend: "down", health: "warning", icon: AlertTriangle, description: "Users whose computed usage doesn't match quota record" },
    { key: "orphan_blob_count", label: "Orphaned Blobs", value: 12, unit: "", trend: "down", health: "warning", icon: AlertTriangle, description: "Blobs without a corresponding file record" },
    { key: "preview_queue_depth", label: "Preview Queue Depth", value: 28, unit: " jobs", trend: "stable", health: "good", icon: Image, description: "Pending thumbnail/preview generation jobs" },
    { key: "repair_job_success", label: "Repair Success Rate", value: 97.5, unit: "%", trend: "up", health: "good", icon: Wrench, description: "Percentage of repair/integrity jobs completing successfully" },
  ];
}

const HEALTH_STYLES: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  good: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle },
  warning: { bg: "bg-amber-500/10", text: "text-amber-400", icon: AlertTriangle },
  critical: { bg: "bg-red-500/10", text: "text-red-400", icon: XCircle },
};

const TREND_ARROWS: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

export function CloudObservabilityAdmin() {
  const [metrics] = useState<MetricCard[]>(getDemoMetrics());

  const healthCounts = { good: 0, warning: 0, critical: 0 };
  metrics.forEach(m => healthCounts[m.health]++);

  return (
    <div className="space-y-4">
      {/* Overall Health */}
      <div className="grid grid-cols-3 gap-3">
        {(["good", "warning", "critical"] as const).map(h => {
          const style = HEALTH_STYLES[h];
          const Icon = style.icon;
          return (
            <Card key={h}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", style.bg)}>
                  <Icon className={cn("h-5 w-5", style.text)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{healthCounts[h]}</p>
                  <p className="text-xs text-muted-foreground capitalize">{h}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map(m => {
          const style = HEALTH_STYLES[m.health];
          const Icon = m.icon;
          return (
            <Card key={m.key}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", style.bg)}>
                      <Icon className={cn("h-4 w-4", style.text)} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-xl font-bold">{m.value}</p>
                        <span className="text-sm text-muted-foreground">{m.unit}</span>
                        <span className={cn("text-xs ml-1", m.trend === "up" ? "text-emerald-400" : m.trend === "down" ? "text-blue-400" : "text-muted-foreground")}>
                          {TREND_ARROWS[m.trend]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-xs capitalize", style.text)}>{m.health}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{m.description}</p>
                {/* Mini bar */}
                <div className="mt-2">
                  <Progress
                    value={m.unit === "%" ? m.value : Math.min(m.value / 20, 100)}
                    className="h-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Traces */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Recent Trace Summaries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { flow: "Upload → Finalize → Index", latency: "380ms", status: "ok" },
            { flow: "Sync Push → Conflict Check → Fanout", latency: "120ms", status: "ok" },
            { flow: "Preview Request → Worker → Cache", latency: "1.2s", status: "ok" },
            { flow: "Device Revoke → Session Purge → Notify", latency: "90ms", status: "ok" },
            { flow: "Repair Job → Orphan Scan → Cleanup", latency: "4.5s", status: "warning" },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-mono">{t.flow}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t.latency}</span>
                <Badge variant="outline" className={cn("text-xs", t.status === "ok" ? "text-emerald-400" : "text-amber-400")}>{t.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
