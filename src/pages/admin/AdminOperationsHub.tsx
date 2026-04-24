import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, AlertTriangle, Zap, Clock, Target, Server, BarChart3, Bell, CheckCircle, RefreshCw, Play, Gauge, Database, ArrowRight, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const sevColor: Record<string, string> = { high: "text-red-500", medium: "text-amber-500", low: "text-blue-500" };

const SERVICES = [
  { name: "brain-core", status: "healthy" as const, latency: 12, errorRate: 0, uptime: 99.99 },
  { name: "approval-service", status: "healthy" as const, latency: 8, errorRate: 0, uptime: 99.98 },
  { name: "workflow-engine", status: "warning" as const, latency: 185, errorRate: 0.2, uptime: 99.91 },
  { name: "connector-gateway", status: "degraded" as const, latency: 450, errorRate: 1.5, uptime: 99.42 },
  { name: "event-bus", status: "healthy" as const, latency: 3, errorRate: 0, uptime: 99.99 },
  { name: "projection-worker", status: "warning" as const, latency: 95, errorRate: 0.1, uptime: 99.88 },
  { name: "notification-center", status: "healthy" as const, latency: 22, errorRate: 0, uptime: 99.97 },
  { name: "receipt-service", status: "healthy" as const, latency: 5, errorRate: 0, uptime: 100 },
];

const QUEUES = [
  { name: "Approval Queue", depth: 12, avgWait: "3.2m", owner: "approval-service", pressure: "normal" as const },
  { name: "Event Bus Consumer", depth: 2847, avgWait: "1.1s", owner: "event-bus", pressure: "normal" as const },
  { name: "Projection Rebuild", depth: 3, avgWait: "45s", owner: "projection-worker", pressure: "elevated" as const },
  { name: "Notification Dispatch", depth: 0, avgWait: "0s", owner: "notification-center", pressure: "normal" as const },
  { name: "Workflow Retry", depth: 7, avgWait: "12m", owner: "workflow-engine", pressure: "high" as const },
];

const INCIDENTS = [
  { id: "inc-1", title: "Connector Slack sync delay >15m", severity: "high" as const, status: "investigating", startedAt: "2026-04-05T10:05:00Z", assignee: "ops-team" },
  { id: "inc-2", title: "Workflow engine p99 latency spike", severity: "medium" as const, status: "open", startedAt: "2026-04-05T09:50:00Z", assignee: "platform-eng" },
];

const ACTION_LOG = [
  { time: "10:22", actor: "ops-team", action: "Acknowledged incident inc-1", surface: "IncidentCommand" },
  { time: "10:18", actor: "admin@sita.os", action: "Launched runbook: Connector Resync", surface: "RunbookLauncher" },
  { time: "10:15", actor: "system", action: "Auto-scaled projection-worker to 3 replicas", surface: "AutoScaler" },
  { time: "10:10", actor: "admin@sita.os", action: "Suppressed alert: Event bus rebalance", surface: "AlertTriage" },
  { time: "10:05", actor: "monitor-agent", action: "Detected connector lag anomaly", surface: "AnomalyDetector" },
];

const statusColor: Record<string, string> = {
  healthy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  degraded: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  critical: "text-red-500 bg-red-500/10 border-red-500/20",
};

const pressureColor: Record<string, string> = {
  normal: "text-emerald-500",
  elevated: "text-amber-500",
  high: "text-red-500",
};

const OperationsCommandCenter = () => {
  
  const [tab, setTab] = useState("health");

  const { data: incidentCount } = useQuery({
    queryKey: ["ops-incidents"],
    queryFn: async () => {
      const { count } = await fromTable("incidents").select("*", { count: "exact", head: true }).in("status", ["open", "investigating"]);
      return count || 0;
    },
  });

  // Phase 20.D — live alerts from public.alerts
  const { data: liveAlerts = [] } = useQuery({
    queryKey: ["ops-live-alerts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("alerts")
        .select("id, title, source, severity, status, last_seen_at, runbook_id")
        .in("status", ["active", "acknowledged", "suppressed"])
        .order("last_seen_at", { ascending: false })
        .limit(25);
      return (data ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        source: a.source,
        severity: (a.severity === "critical" || a.severity === "high") ? "high" :
                  a.severity === "medium" ? "medium" : "low",
        status: a.status,
        time: new Date(a.last_seen_at as string).toLocaleTimeString(),
        runbook: !!a.runbook_id,
      }));
    },
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> Operations Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Service health · SLO burn · Alert triage · Queue/lag · Incident queue · Runbooks</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Services Healthy", value: `${([] as any[]).filter(s => s.status === "healthy").length}/${([] as any[]).length}`, icon: Server, color: "text-emerald-500" },
            { label: "Active Alerts", value: String(liveAlerts.filter(a => a.status === "active").length), icon: Bell, color: "text-amber-500" },
            { label: "Open Incidents", value: String(incidentCount ?? ([] as any[]).length), icon: AlertTriangle, color: "text-red-500" },
            { label: "SLO Budget OK", value: `${([] as any[]).filter(s => s.burnRate < 1).length}/${([] as any[]).length}`, icon: Target, color: "text-emerald-500" },
            { label: "Queue Pressure", value: ([] as any[]).some(q => q.pressure === "high") ? "Elevated" : "Normal", icon: Gauge, color: ([] as any[]).some(q => q.pressure === "high") ? "text-amber-500" : "text-emerald-500" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1"><m.icon className={`h-4 w-4 ${m.color}`} /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span></div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="health">Service Health</TabsTrigger>
            <TabsTrigger value="alerts">Alert Triage</TabsTrigger>
            <TabsTrigger value="slos">SLO Burn</TabsTrigger>
            <TabsTrigger value="queues">Queue & Lag</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="runbooks">Runbooks</TabsTrigger>
            <TabsTrigger value="log">Action Log</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {([] as any[]).map(svc => (
                <Card key={svc.name} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground font-mono">{svc.name}</span>
                      </div>
                      <Badge variant="outline" className={`text-[9px] capitalize ${statusColor[svc.status]}`}>{svc.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                      <div>Latency: <span className={svc.latency > 100 ? "text-amber-500" : "text-foreground"}>{svc.latency}ms</span></div>
                      <div>Errors: <span className={svc.errorRate > 0 ? "text-red-500" : "text-foreground"}>{svc.errorRate}%</span></div>
                      <div>Uptime: <span className="text-foreground">{svc.uptime}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-4 space-y-2">
            {liveAlerts.length === 0 && (
              <Card><CardContent className="p-6 text-center text-xs text-muted-foreground">No active alerts.</CardContent></Card>
            )}
            {liveAlerts.map(a => (
              <Card key={a.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${sevColor[a.severity]}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.source} · {a.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[9px] ${a.status === "suppressed" ? "text-muted-foreground" : sevColor[a.severity]}`}>{a.status}</Badge>
                    {a.runbook && <Button variant="outline" size="sm" className="h-6 text-[10px]"><Play className="h-3 w-3 mr-1" /> Runbook</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="slos" className="mt-4 space-y-2">
            {([] as any[]).map(slo => (
              <Card key={slo.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{slo.name}</span>
                    <Badge variant="outline" className={`text-[9px] ${slo.burnRate < 0.5 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : slo.burnRate < 1 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"}`}>
                      Burn: {(slo.burnRate * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
                    <span>Target: {slo.target}{slo.unit || "%"}</span>
                    <span>Current: {slo.current}{slo.unit || "%"}</span>
                  </div>
                  <Progress value={Math.min((1 - slo.burnRate) * 100, 100)} className="h-1.5" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="queues" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Queue & Lag Command</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {([] as any[]).map(q => (
                  <div key={q.name} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{q.name}</span>
                        <Badge variant="outline" className={`text-[9px] capitalize ${pressureColor[q.pressure]}`}>{q.pressure}</Badge>
                      </div>
                      {q.pressure === "high" && <Button variant="outline" size="sm" className="h-6 text-[10px]"><Zap className="h-3 w-3 mr-1" /> Intervene</Button>}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Depth: <span className="text-foreground font-mono">{q.depth.toLocaleString()}</span></span>
                      <span>Avg wait: <span className="text-foreground">{q.avgWait}</span></span>
                      <span>Owner: <span className="text-foreground font-mono">{q.owner}</span></span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="mt-4 space-y-2">
            {([] as any[]).map(inc => (
              <Card key={inc.id} className={inc.severity === "high" ? "border-red-500/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${inc.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
                      <span className="text-sm font-medium text-foreground">{inc.title}</span>
                      <Badge variant="outline" className={`text-[9px] ${inc.severity === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{inc.severity}</Badge>
                      <Badge variant="outline" className="text-[9px]">{inc.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Started: {new Date(inc.startedAt).toLocaleTimeString()}</span>
                    <span>Assignee: <span className="text-foreground">{inc.assignee}</span></span>
                    <Button variant="outline" size="sm" className="h-5 text-[9px] ml-auto">Investigate <ArrowRight className="h-2.5 w-2.5 ml-0.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="runbooks" className="mt-4 space-y-2">
            {([] as any[]).map(rb => (
              <Card key={rb.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{rb.name}</p>
                    <p className="text-[10px] text-muted-foreground">{rb.steps} steps · ~{rb.avgTime} · Last used {rb.lastUsed}</p>
                  </div>
                  <Button size="sm" className="h-7 text-xs"><Play className="h-3 w-3 mr-1" /> Launch</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="log" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> Operator Action Log</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {([] as any[]).map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-muted/20 text-[11px]">
                    <span className="text-muted-foreground font-mono w-10 flex-shrink-0">{entry.time}</span>
                    <span className="text-foreground font-medium w-24 flex-shrink-0">{entry.actor}</span>
                    <span className="text-foreground flex-1">{entry.action}</span>
                    <Badge variant="secondary" className="text-[8px] px-1.5 py-0">{entry.surface}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default OperationsCommandCenter;
