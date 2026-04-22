import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Server, Rocket, Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, Cpu, TrendingUp, Clock, Shield, Wrench } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const DEMO_FLEET = [
  { id: "rt-1", name: "edge-node-eu-west-1", status: "healthy" as const, cpu: 34, memory: 52, uptime: "42d 3h", version: "v2.13.0", lastHealthCheck: "2026-04-05T10:20:00Z", failureProbability: 2, segment: "EU" },
  { id: "rt-2", name: "edge-node-us-east-1", status: "healthy" as const, cpu: 28, memory: 41, uptime: "42d 3h", version: "v2.13.0", lastHealthCheck: "2026-04-05T10:20:00Z", failureProbability: 1, segment: "US" },
  { id: "rt-3", name: "edge-node-ap-southeast-1", status: "warning" as const, cpu: 78, memory: 82, uptime: "12d 8h", version: "v2.13.0", lastHealthCheck: "2026-04-05T10:18:00Z", failureProbability: 24, segment: "APAC" },
  { id: "rt-4", name: "worker-projection-01", status: "degraded" as const, cpu: 92, memory: 89, uptime: "2d 1h", version: "v2.12.9", lastHealthCheck: "2026-04-05T10:15:00Z", failureProbability: 67, segment: "EU" },
  { id: "rt-5", name: "worker-workflow-01", status: "healthy" as const, cpu: 45, memory: 38, uptime: "42d 3h", version: "v2.13.0", lastHealthCheck: "2026-04-05T10:20:00Z", failureProbability: 3, segment: "EU" },
  { id: "rt-6", name: "gateway-primary", status: "healthy" as const, cpu: 15, memory: 22, uptime: "90d 0h", version: "v2.13.0", lastHealthCheck: "2026-04-05T10:20:00Z", failureProbability: 0, segment: "Global" },
];

const DEMO_ANOMALIES = [
  { id: "an-1", node: "edge-node-ap-southeast-1", type: "CPU spike", severity: "warning" as const, detected: "2026-04-05T09:45:00Z", pattern: "Recurring daily at peak hours", recommendation: "Scale to 2 replicas during 09:00-18:00 APAC" },
  { id: "an-2", node: "worker-projection-01", type: "Memory leak", severity: "critical" as const, detected: "2026-04-05T08:00:00Z", pattern: "Gradual increase over 48h", recommendation: "Restart with memory profiling enabled" },
];

const DEMO_PREDICTIONS = [
  { node: "worker-projection-01", prediction: "OOM crash within 6h", confidence: 89, horizon: "6h", impact: "Projection rebuilds will stall", preventive: "Restart now + increase memory limit" },
  { node: "edge-node-ap-southeast-1", prediction: "Latency degradation during peak", confidence: 72, horizon: "3h", impact: "APAC users experience >500ms latency", preventive: "Add replica before 09:00 SGT" },
];

const DEMO_MAINTENANCE = [
  { id: "mt-1", action: "Restart worker-projection-01", reason: "Memory leak detected", status: "pending" as const, scheduledFor: "2026-04-05T11:00:00Z", risk: "low" },
  { id: "mt-2", action: "Scale APAC edge to 2 replicas", reason: "Peak-hour CPU pressure", status: "scheduled" as const, scheduledFor: "2026-04-06T01:00:00Z", risk: "low" },
  { id: "mt-3", action: "Upgrade worker-projection-01 to v2.13.0", reason: "Version drift from fleet", status: "pending" as const, scheduledFor: "2026-04-05T12:00:00Z", risk: "medium" },
];

const statusColor: Record<string, string> = {
  healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  degraded: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function FleetHealthPage() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("inventory");
  const healthyCount = (isDemoMode ? DEMO_FLEET : [] as typeof DEMO_FLEET).filter(n => n.status === "healthy").length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" /> Fleet Health Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Fleet inventory · Failure prediction · Anomaly clustering · Maintenance actions</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Fleet Healthy", value: `${healthyCount}/${(isDemoMode ? DEMO_FLEET : [] as typeof DEMO_FLEET).length}`, color: healthyCount === (isDemoMode ? DEMO_FLEET : [] as typeof DEMO_FLEET).length ? "text-emerald-500" : "text-amber-500" },
            { label: "Active Anomalies", value: String((isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).length), color: (isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).length === 0 ? "text-emerald-500" : "text-amber-500" },
            { label: "Predicted Risks", value: String((isDemoMode ? DEMO_PREDICTIONS : [] as typeof DEMO_PREDICTIONS).length), color: (isDemoMode ? DEMO_PREDICTIONS : [] as typeof DEMO_PREDICTIONS).length === 0 ? "text-emerald-500" : "text-orange-500" },
            { label: "Pending Maintenance", value: String((isDemoMode ? DEMO_MAINTENANCE : [] as typeof DEMO_MAINTENANCE).filter(m => m.status === "pending").length), color: "text-blue-500" },
          ].map(m => (
            <Card key={m.label}><CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          ))}
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="inventory">Fleet Inventory</TabsTrigger>
            <TabsTrigger value="predictions">Failure Predictions</TabsTrigger>
            <TabsTrigger value="anomalies">Anomaly Clusters</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(isDemoMode ? DEMO_FLEET : [] as typeof DEMO_FLEET).map(node => (
                <Card key={node.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground font-mono">{node.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={`text-[9px] capitalize ${statusColor[node.status]}`}>{node.status}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{node.segment}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground mb-2">
                      <div>CPU: <span className={node.cpu > 80 ? "text-red-500" : node.cpu > 60 ? "text-amber-500" : "text-foreground"}>{node.cpu}%</span></div>
                      <div>Memory: <span className={node.memory > 80 ? "text-red-500" : node.memory > 60 ? "text-amber-500" : "text-foreground"}>{node.memory}%</span></div>
                      <div>Uptime: <span className="text-foreground">{node.uptime}</span></div>
                      <div>Version: <span className="text-foreground font-mono">{node.version}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Failure risk:</span>
                      <Progress value={node.failureProbability} className="h-1.5 flex-1" />
                      <span className={`text-[10px] font-medium ${node.failureProbability > 50 ? "text-red-500" : node.failureProbability > 20 ? "text-amber-500" : "text-emerald-500"}`}>{node.failureProbability}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-4 space-y-2">
            {(isDemoMode ? DEMO_PREDICTIONS : [] as typeof DEMO_PREDICTIONS).map((p, i) => (
              <Card key={i} className="border-orange-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-foreground">{p.prediction}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-orange-500/10 text-orange-500 border-orange-500/20">Confidence: {p.confidence}%</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] mb-2">
                    <div><span className="text-muted-foreground">Node: </span><span className="text-foreground font-mono">{p.node}</span></div>
                    <div><span className="text-muted-foreground">Horizon: </span><span className="text-foreground">{p.horizon}</span></div>
                    <div><span className="text-muted-foreground">Impact: </span><span className="text-foreground">{p.impact}</span></div>
                    <div><span className="text-muted-foreground">Preventive: </span><span className="text-emerald-500">{p.preventive}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="anomalies" className="mt-4 space-y-2">
            {(isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).map(a => (
              <Card key={a.id} className={a.severity === "critical" ? "border-red-500/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${a.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                      <span className="text-sm font-medium text-foreground">{a.type} on {a.node}</span>
                      <Badge variant="outline" className={`text-[9px] ${a.severity === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{a.severity}</Badge>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-1">
                    <div>Pattern: <span className="text-foreground">{a.pattern}</span></div>
                    <div>Recommendation: <span className="text-emerald-500">{a.recommendation}</span></div>
                    <div>Detected: {new Date(a.detected).toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="maintenance" className="mt-4 space-y-2">
            {(isDemoMode ? DEMO_MAINTENANCE : [] as typeof DEMO_MAINTENANCE).map(m => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{m.action}</span>
                      <Badge variant="outline" className={`text-[9px] ${m.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>{m.status}</Badge>
                      <Badge variant="outline" className={`text-[9px] ${m.risk === "low" ? "text-emerald-500" : "text-amber-500"}`}>Risk: {m.risk}</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]">Execute</Button>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Reason: <span className="text-foreground">{m.reason}</span></span>
                    <span>Scheduled: {new Date(m.scheduledFor).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
