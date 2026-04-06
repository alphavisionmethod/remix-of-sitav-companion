import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, AlertTriangle, Zap, Clock, Target, Server, BarChart3, Bell, CheckCircle, ArrowRight, RefreshCw, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const ALERTS = [
  { id: "a1", title: "Connector Slack sync lag >15m", severity: "high" as const, source: "connector-monitor", time: "2m ago", runbook: "connector-resync", status: "active" },
  { id: "a2", title: "Workflow engine p99 latency >200ms", severity: "medium" as const, source: "apm-agent", time: "8m ago", runbook: "workflow-perf", status: "active" },
  { id: "a3", title: "Event bus consumer group rebalance", severity: "low" as const, source: "kafka-monitor", time: "12m ago", status: "suppressed" },
  { id: "a4", title: "Memory pressure on projection-worker", severity: "medium" as const, source: "infra-monitor", time: "22m ago", runbook: "scale-projection", status: "active" },
];

const SLOS = [
  { name: "API Availability", target: 99.95, current: 99.98, burnRate: 0.8 },
  { name: "API Latency p99", target: 500, current: 320, burnRate: 0.3, unit: "ms" },
  { name: "Incident Response", target: 15, current: 8, burnRate: 0.5, unit: "min" },
  { name: "Deployment Success", target: 99.0, current: 100, burnRate: 0.0 },
];

const RUNBOOKS = [
  { id: "rb1", name: "Connector Resync", steps: 4, avgTime: "3m", lastUsed: "1d ago" },
  { id: "rb2", name: "Workflow Perf Triage", steps: 6, avgTime: "8m", lastUsed: "3d ago" },
  { id: "rb3", name: "Scale Projection Worker", steps: 3, avgTime: "2m", lastUsed: "5d ago" },
  { id: "rb4", name: "Database Failover", steps: 8, avgTime: "15m", lastUsed: "30d ago" },
];

const sevColor = { high: "text-red-500", medium: "text-amber-500", low: "text-blue-500" };

const OperationsCommandCenter = () => {
  const [tab, setTab] = useState("alerts");

  const { data: incidentCount } = useQuery({
    queryKey: ["ops-incidents"],
    queryFn: async () => {
      const { count } = await supabase.from("incidents").select("*", { count: "exact", head: true }).in("status", ["open", "investigating"]);
      return count || 0;
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> Operations Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Unified operational response — turn observability into action</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        {/* Top metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Alerts", value: String(ALERTS.filter(a => a.status === "active").length), icon: Bell, color: "text-amber-500" },
            { label: "Open Incidents", value: String(incidentCount ?? 0), icon: AlertTriangle, color: "text-red-500" },
            { label: "SLO Budget OK", value: `${SLOS.filter(s => s.burnRate < 1).length}/${SLOS.length}`, icon: Target, color: "text-emerald-500" },
            { label: "Runbooks Available", value: String(RUNBOOKS.length), icon: Play, color: "text-primary" },
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
            <TabsTrigger value="alerts">Alert Triage</TabsTrigger>
            <TabsTrigger value="slos">SLO Burn</TabsTrigger>
            <TabsTrigger value="runbooks">Runbooks</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-4 space-y-2">
            {ALERTS.map(a => (
              <motion.div key={a.id} variants={fadeUp}>
                <Card className="hover:bg-muted/30 transition-colors">
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
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="slos" className="mt-4 space-y-2">
            {SLOS.map(slo => (
              <motion.div key={slo.name} variants={fadeUp}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{slo.name}</span>
                      <Badge variant="outline" className={`text-[9px] ${slo.burnRate < 0.5 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : slo.burnRate < 1 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"}`}>
                        Burn: {(slo.burnRate * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
                      <span>Target: {slo.target}{slo.unit ? slo.unit : "%"}</span>
                      <span>Current: {slo.current}{slo.unit ? slo.unit : "%"}</span>
                    </div>
                    <Progress value={Math.min((1 - slo.burnRate) * 100, 100)} className="h-1.5" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="runbooks" className="mt-4 space-y-2">
            {RUNBOOKS.map(rb => (
              <motion.div key={rb.id} variants={fadeUp}>
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{rb.name}</p>
                      <p className="text-[10px] text-muted-foreground">{rb.steps} steps · ~{rb.avgTime} · Last used {rb.lastUsed}</p>
                    </div>
                    <Button size="sm" className="h-7 text-xs"><Play className="h-3 w-3 mr-1" /> Launch</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default OperationsCommandCenter;
