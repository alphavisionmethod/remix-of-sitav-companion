import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { DegradedStateBanner } from "@/components/sita/truth/DegradedStateBanner";
import { StalenessIndicator } from "@/components/sita/truth/StalenessIndicator";
import {
  Activity, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Cpu, HardDrive,
  Database, Wifi, Zap, BarChart3, BookOpen, Play, RotateCcw, Server, Gauge, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DEMO_alerts, DEMO_incidents, DEMO_runbooks, DEMO_services, DEMO_slos } from "@/data/seed/atlas";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

export default function OperationsCommandCenter() {
  
  const [tab, setTab] = useState("health");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Operations Command Center" subtitle="Service health, SLO burn rates, alert triage, incident drilldown, and runbook management" />

      {([] as typeof DEMO_alerts).filter(a => !a.acknowledged).length > 0 && (
        <DegradedStateBanner severity="warning" reason={`${([] as typeof DEMO_alerts).filter(a => !a.acknowledged).length} unacknowledged alert(s)`} impact="Operator attention required" dismissible />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Services Healthy", value: `${([] as typeof DEMO_services).filter(s => s.status === "healthy").length}/${([] as typeof DEMO_services).length}`, color: ([] as typeof DEMO_services).every(s => s.status === "healthy") ? "text-green-400" : "text-amber-400" },
          { label: "SLO Budget Avg", value: `${Math.round(([] as typeof DEMO_slos).reduce((s, l) => s + l.budget, 0) / ([] as typeof DEMO_slos).length)}%`, color: "text-green-400" },
          { label: "Active Alerts", value: ([] as typeof DEMO_alerts).filter(a => !a.acknowledged).length, color: ([] as typeof DEMO_alerts).some(a => !a.acknowledged) ? "text-amber-400" : "text-green-400" },
          { label: "Active Incidents", value: ([] as typeof DEMO_incidents).filter(i => i.status !== "resolved").length, color: ([] as typeof DEMO_incidents).some(i => i.status !== "resolved") ? "text-amber-400" : "text-green-400" },
          { label: "Runbooks", value: ([] as typeof DEMO_runbooks).length, color: "text-blue-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "health", label: "Service Health", icon: Activity },
            { value: "slos", label: "SLO Burn", icon: Gauge },
            { value: "alerts", label: "Alert Triage", icon: AlertTriangle },
            { value: "incidents", label: "Incidents", icon: Radio },
            { value: "queues", label: "Queues & Lag", icon: BarChart3 },
            { value: "runbooks", label: "Runbooks", icon: BookOpen },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="health">
            {([] as typeof DEMO_services).map(svc => (
              <div key={svc.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", svc.status === "healthy" ? "bg-green-400" : "bg-amber-400")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{svc.name}</p>
                    <p className="text-[10px] text-muted-foreground">{svc.uptime}% uptime • {svc.latency}ms P95</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={svc.status === "healthy" ? "default" : "secondary"} className="text-[9px] capitalize">{svc.status}</Badge>
                  <StalenessIndicator lastUpdated={svc.lastCheck} thresholdSeconds={300} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="slos">
            {([] as typeof DEMO_slos).map(slo => (
              <Card key={slo.name} className="bg-card/50 border-border/50 mb-2">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">{slo.name}</p>
                      <p className="text-[10px] text-muted-foreground">Target: {slo.target}{slo.unit || "%"} • Current: {slo.current}{slo.unit || "%"} • {slo.window}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", slo.budget > 50 ? "text-green-400" : slo.budget > 20 ? "text-amber-400" : "text-red-400")}>{slo.budget}%</p>
                      <p className="text-[9px] text-muted-foreground">budget remaining</p>
                    </div>
                  </div>
                  <Progress value={slo.budget} className="h-1.5" />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">Burn rate: {slo.burnRate}x</span>
                    {slo.burnRate > 1 && <Badge variant="destructive" className="text-[8px]">Fast burn!</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="alerts">
            {([] as typeof DEMO_alerts).map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={cn("w-4 h-4", alert.severity === "warning" ? "text-amber-400" : "text-blue-400")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{alert.title}</p>
                    <p className="text-[10px] text-muted-foreground">{alert.source}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.runbookId && <Button variant="ghost" size="sm" className="text-[10px] h-5 gap-0.5"><BookOpen className="w-2.5 h-2.5" />Runbook</Button>}
                  <Badge variant={alert.acknowledged ? "secondary" : "destructive"} className="text-[9px]">{alert.acknowledged ? "Ack'd" : "New"}</Badge>
                  <StalenessIndicator lastUpdated={alert.time} thresholdSeconds={3600} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="incidents">
            {([] as typeof DEMO_incidents).map(inc => (
              <Card key={inc.id} className="bg-card/50 border-border/50 mb-2">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium text-foreground">{inc.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] capitalize">{inc.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Severity: {inc.severity}</span>
                    <span>Assignee: {inc.assignee}</span>
                    <StalenessIndicator lastUpdated={inc.started} thresholdSeconds={3600} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="queues">
            <h3 className="text-xs font-semibold mb-3">Queue Depths & Lag</h3>
            {[
              { name: "Approval Queue", depth: 2, lag: "0s", pressure: "low", owner: "approval-engine" },
              { name: "Event Bus", depth: 0, lag: "12ms", pressure: "none", owner: "event-bus" },
              { name: "Notification Queue", depth: 5, lag: "200ms", pressure: "low", owner: "notification-service" },
              { name: "Connector Sync Queue", depth: 1, lag: "0s", pressure: "none", owner: "connector-gateway" },
              { name: "Agent Signal Queue", depth: 0, lag: "0ms", pressure: "none", owner: "agent-runtime" },
              { name: "Projection Rebuild Queue", depth: 0, lag: "0ms", pressure: "none", owner: "projection-engine" },
            ].map(q => (
              <div key={q.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <BarChart3 className={cn("w-4 h-4", q.pressure === "none" ? "text-green-400" : q.pressure === "low" ? "text-blue-400" : "text-amber-400")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{q.name}</p>
                    <p className="text-[10px] text-muted-foreground">Owner: {q.owner} • Lag: {q.lag}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={q.depth === 0 ? "default" : "secondary"} className="text-[9px]">{q.depth} items</Badge>
                  <Badge variant="outline" className={cn("text-[8px] capitalize", q.pressure === "none" ? "text-green-400" : q.pressure === "low" ? "text-blue-400" : "text-amber-400")}>{q.pressure}</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="runbooks">
            <div className="grid gap-2 sm:grid-cols-2">
              {([] as typeof DEMO_runbooks).map(rb => (
                <div key={rb.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{rb.name}</p>
                      <p className="text-[10px] text-muted-foreground">{rb.steps} steps • {rb.lastUsed ? `Used ${Math.round((Date.now() - new Date(rb.lastUsed).getTime()) / 86400000)}d ago` : "Never used"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] h-6 gap-0.5"><Play className="w-2.5 h-2.5" />Launch</Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
