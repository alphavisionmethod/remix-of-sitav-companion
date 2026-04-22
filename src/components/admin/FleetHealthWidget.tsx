import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity, AlertTriangle, CheckCircle, XCircle, Shield,
  Zap, Clock, Server, ArrowRight, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FleetHealthService, createFleetHealthService } from "@/lib/core-services/self-healing/fleet-health";
import type {
  ServiceHealthRecord, ServiceHealthStatus, DegradedService,
  SelfHealingIncidentSeverity, RootCauseCategory,
} from "@/lib/core-services/self-healing/types";

// ── Demo fleet data (shared module) ─────────────────────────────
import { DEMO_FLEET_SERVICES } from "@/data/fixtures/mock-data/fleet-health";
import { useDataMode } from "@/contexts/DataModeContext";
const DEMO_SERVICES = [...DEMO_FLEET_SERVICES];

interface AutoIncident {
  id: string;
  serviceId: string;
  severity: SelfHealingIncidentSeverity;
  rootCause: RootCauseCategory;
  status: ServiceHealthStatus;
  healthScore: number;
  declaredAt: number;
  message: string;
}

// ── Status helpers ──────────────────────────────────────────────

const STATUS_CONFIG: Record<ServiceHealthStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
  healthy: { color: "text-emerald-500", icon: CheckCircle, label: "Healthy" },
  degraded: { color: "text-amber-500", icon: AlertTriangle, label: "Degraded" },
  unhealthy: { color: "text-red-500", icon: XCircle, label: "Unhealthy" },
  quarantined: { color: "text-purple-500", icon: Shield, label: "Quarantined" },
};

function severityBadge(severity: SelfHealingIncidentSeverity) {
  const map: Record<SelfHealingIncidentSeverity, string> = {
    P0: "bg-red-600 text-white", P1: "bg-red-500 text-white", P2: "bg-amber-500 text-white",
    P3: "bg-yellow-400 text-black", P4: "bg-muted text-muted-foreground",
  };
  return <Badge className={`${map[severity]} text-xs font-mono`}>{severity}</Badge>;
}

function inferSeverity(status: ServiceHealthStatus, score: number): SelfHealingIncidentSeverity {
  if (status === "unhealthy" && score < 20) return "P0";
  if (status === "unhealthy") return "P1";
  if (status === "degraded" && score < 40) return "P2";
  return "P3";
}

function inferRootCause(metrics: { errorRate: number; p99LatencyMs: number; uptimePercent: number }): RootCauseCategory {
  if (metrics.errorRate > 50) return "dependency-failure";
  if (metrics.p99LatencyMs > 5000) return "resource-exhaustion";
  if (metrics.errorRate > 20) return "connector-failure";
  if (metrics.uptimePercent < 90) return "dependency-failure";
  return "unknown";
}

// ── Widget Component ────────────────────────────────────────────

export default function FleetHealthWidget() {
  const { isDemoMode } = useDataMode();
  const [fleet, setFleet] = useState<FleetHealthService | null>(null);
  const [services, setServices] = useState<ServiceHealthRecord[]>([]);
  const [degraded, setDegraded] = useState<DegradedService[]>([]);
  const [incidents, setIncidents] = useState<AutoIncident[]>([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Initialize fleet with demo data
  useEffect(() => {
    const fhs = createFleetHealthService();

    // Register services
    for (const svc of DEMO_SERVICES) {
      fhs.registerService(svc.id, svc.name, svc.deps);
    }

    // Run health checks and collect auto-incidents
    const autoIncidents: AutoIncident[] = [];
    for (const svc of DEMO_SERVICES) {
      const result = fhs.recordHealthCheck(svc.id, svc.passed, svc.metrics);
      if (result && (result.status === "degraded" || result.status === "unhealthy")) {
        autoIncidents.push({
          id: crypto.randomUUID(),
          serviceId: svc.id,
          severity: inferSeverity(result.status, result.healthScore),
          rootCause: inferRootCause(svc.metrics),
          status: result.status,
          healthScore: result.healthScore,
          declaredAt: Date.now(),
          message: `Auto-declared: ${svc.name} entered ${result.status} (score=${result.healthScore})`,
        });
      }
    }

    setFleet(fhs);
    setServices(fhs.getAllServices());
    setDegraded(fhs.getDegradedServices());
    setIncidents(autoIncidents);
  }, [lastRefresh]);

  const summary = useMemo(() => fleet?.getFleetSummary() ?? {
    total: 0, healthy: 0, degraded: 0, unhealthy: 0, quarantined: 0, avgHealthScore: 0, degradedModeCount: 0,
  }, [fleet]);

  const healthPct = summary.total > 0 ? Math.round((summary.healthy / summary.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Fleet Overview */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Fleet Health Monitor
            </CardTitle>
            <Button
              variant="ghost" size="sm"
              onClick={() => setLastRefresh(Date.now())}
              className="gap-1 text-xs text-muted-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fleet Health Score</span>
              <span className="font-mono font-semibold">{summary.avgHealthScore}/100</span>
            </div>
            <Progress
              value={summary.avgHealthScore}
              className="h-2.5"
            />
          </div>

          {/* Status counts */}
          <div className="grid grid-cols-4 gap-2">
            {(["healthy", "degraded", "unhealthy", "quarantined"] as ServiceHealthStatus[]).map(status => {
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              const count = summary[status] ?? 0;
              return (
                <div key={status} className="flex flex-col items-center rounded-lg border border-border bg-card p-2">
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                  <span className="mt-1 text-lg font-bold">{count}</span>
                  <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Server className="h-3.5 w-3.5" />
            <span>{summary.total} services monitored · {healthPct}% fleet availability</span>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Declared Incidents */}
      {incidents.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-destructive" />
              Auto-Declared Incidents
              <Badge variant="destructive" className="ml-auto text-xs">{incidents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {incidents.map(inc => (
                  <div
                    key={inc.id}
                    className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
                  >
                    <div className="mt-0.5">
                      {severityBadge(inc.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{inc.serviceId}</span>
                        <Badge variant="outline" className="text-[10px]">{inc.rootCause}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{inc.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(inc.declaredAt).toLocaleTimeString()}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>Self-healing pipeline triggered</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Service Grid */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Service Status Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-1">
              {services.map(svc => {
                const cfg = STATUS_CONFIG[svc.status];
                const Icon = cfg.icon;
                const isDeg = degraded.some(d => d.serviceId === svc.serviceId);
                return (
                  <div
                    key={svc.serviceId}
                    className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50 transition-colors"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{svc.name}</span>
                        {isDeg && (
                          <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-500">
                            degraded-mode
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>Score: {svc.healthScore}</span>
                        <span>Uptime: {svc.metrics.uptimePercent}%</span>
                        <span>p99: {svc.metrics.p99LatencyMs}ms</span>
                        <span>Err: {svc.metrics.errorRate}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Progress value={svc.healthScore} className="h-1.5 w-16" />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Degraded Services */}
      {degraded.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Active Degraded Modes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {degraded.map(d => (
                <div key={d.serviceId} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <span className="text-sm font-medium">{d.serviceId}</span>
                    <p className="text-xs text-muted-foreground">{d.reason}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Recovery: {d.consecutiveHealthyChecks}/{d.requiredHealthyChecks} checks</div>
                    <div>Since {new Date(d.enteredAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
