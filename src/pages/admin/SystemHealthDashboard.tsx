// ═══════════════════════════════════════════════════════════════
// SITA OS — System Health Dashboard
// Real-time display of health probes, service heartbeat, and observability data
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, Shield, Database, HardDrive, HeartPulse } from "lucide-react";
import { runAllProbes, getOverallHealth, type ProbeResult } from "@/lib/observability/health-probes";
import { getCostSummary, type CostSummary } from "@/lib/observability/cost-governance";
import { getLogBuffer, type LogEntry } from "@/lib/observability/structured-logger";
import { serviceHeartbeat, type HeartbeatSummary } from "@/lib/services/service-registry/heartbeat";
import { createServiceRegistry } from "@/lib/services/service-registry";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const statusColor = (s: string) => {
  switch (s) {
    case "healthy": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "degraded": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "unhealthy":
    case "down": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function SystemHealthDashboard() {
  const [probes, setProbes] = useState<ProbeResult[]>([]);
  const [overallHealth, setOverallHealth] = useState<string>("unknown");
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [heartbeat, setHeartbeat] = useState<HeartbeatSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [results, summary, hb] = await Promise.all([
        runAllProbes(),
        getCostSummary(),
        serviceHeartbeat.runHeartbeat(createServiceRegistry().getAll()),
      ]);
      setProbes(results);
      setOverallHealth(getOverallHealth(results));
      setCostSummary(summary);
      setHeartbeat(hb);
      setRecentLogs(getLogBuffer().slice(-20));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const probeIcons: Record<string, typeof Activity> = {
    supabase: Database,
    auth: Shield,
    storage: HardDrive,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health</h1>
          <p className="text-muted-foreground text-sm">Real-time observability dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusColor(overallHealth)}>
            {overallHealth.toUpperCase()}
          </Badge>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Probe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {probes.map((probe) => {
          const Icon = probeIcons[probe.name] ?? Activity;
          return (
            <Card key={probe.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {probe.name}
                  </CardTitle>
                  <Badge variant="outline" className={statusColor(probe.status)}>
                    {probe.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{probe.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Latency: {probe.latencyMs}ms
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Service Heartbeat */}
      {heartbeat && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              Service Registry Heartbeat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Checked</p>
                <p className="font-mono font-bold">{heartbeat.totalChecked}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Healthy</p>
                <p className="font-mono font-bold text-green-400">{heartbeat.healthy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Degraded</p>
                <p className="font-mono font-bold text-yellow-400">{heartbeat.degraded}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Down</p>
                <p className="font-mono font-bold text-red-400">{heartbeat.down}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Latency</p>
                <p className="font-mono font-bold">{heartbeat.avgLatencyMs}ms</p>
              </div>
            </div>
            {heartbeat.results.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {heartbeat.results.map((r) => (
                  <div key={r.serviceId} className="flex items-center justify-between text-xs py-1 border-b border-border/50">
                    <span className="font-medium">{r.serviceName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{r.latencyMs}ms</span>
                      <Badge variant="outline" className={`text-[10px] h-4 ${statusColor(r.status)}`}>
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cost Summary */}
      {costSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI Cost Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Cost</p>
                <p className="font-mono font-bold">${(costSummary.totalCostCents / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Tokens</p>
                <p className="font-mono font-bold">{(costSummary.totalInputTokens + costSummary.totalOutputTokens).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Records</p>
                <p className="font-mono font-bold">{costSummary.recordCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Structured Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No logs yet. Logs appear as services emit structured events.</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
              {recentLogs.map((log, i) => (
                <div key={i} className="flex gap-2 py-0.5">
                  <span className="text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-4">
                    {log.level}
                  </Badge>
                  <span className="truncate">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
