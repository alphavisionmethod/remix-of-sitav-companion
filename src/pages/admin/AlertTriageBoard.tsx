import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, AlertTriangle, Clock, CheckCircle, XCircle, Play, Eye, VolumeX, User, RefreshCw, Users, Layers, Search } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_ADMIN_ALERTS_ALERT_TRIAGE_BOARD as DEMO_ALERTS } from "@/lib/demo-data/admin-platform";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type AlertSeverity = "critical" | "high" | "medium" | "low";
type AlertStatus = "active" | "acknowledged" | "suppressed" | "resolved";

const sevConfig: Record<AlertSeverity, { color: string; bg: string }> = {
  critical: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  high: { color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  medium: { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  low: { color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
};

interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  cluster?: string;
  timeToBreachMin?: number;
  runbookId?: string;
  assignee?: string;
  createdAt: string;
  likelyImpact: string;
}

// Derive clusters from demo data
const getClusters = (alerts: Alert[]) => {
  const map = new Map<string, Alert[]>();
  alerts.forEach(a => {
    const key = a.cluster || "Unclustered";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  });
  return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
};

const AlertTriageBoard = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("severity");
  const [statusFilter, setStatusFilter] = useState<"all" | AlertStatus>("all");

  const alerts = statusFilter === "all" ? DEMO_ALERTS : DEMO_ALERTS.filter(a => a.status === statusFilter);
  const criticalCount = DEMO_ALERTS.filter(a => a.severity === "critical" && a.status === "active").length;
  const clusters = getClusters(alerts);
  const suppressed = DEMO_ALERTS.filter(a => a.status === "suppressed");
  const assigned = DEMO_ALERTS.filter(a => a.assignee);
  const unassigned = DEMO_ALERTS.filter(a => !a.assignee && a.status === "active");

  const renderAlertCard = (a: Alert) => {
    const sev = sevConfig[a.severity];
    return (
      <motion.div key={a.id} variants={fadeUp}>
        <Card className={`hover:bg-muted/30 transition-colors ${a.severity === "critical" ? "border-red-500/30" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${sev.color}`} />
                <span className="text-sm font-medium text-foreground">{a.title}</span>
                <Badge variant="outline" className={`text-[9px] ${sev.color} ${sev.bg}`}>{a.severity}</Badge>
                <Badge variant="outline" className="text-[9px]">{a.status}</Badge>
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(a.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
              <span>Source: <span className="text-foreground">{a.source}</span></span>
              {a.cluster && <span>Cluster: <span className="text-foreground">{a.cluster}</span></span>}
              <span>Impact: <span className="text-foreground">{a.likelyImpact}</span></span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {a.timeToBreachMin != null && (
                <Badge variant="outline" className={`text-[9px] ${a.timeToBreachMin < 15 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                  <Clock className="h-2.5 w-2.5 mr-0.5" /> Breach in {a.timeToBreachMin}m
                </Badge>
              )}
              {a.assignee && <Badge variant="outline" className="text-[9px]"><User className="h-2.5 w-2.5 mr-0.5" /> {a.assignee}</Badge>}
              {a.runbookId && <Button variant="outline" size="sm" className="h-6 text-[10px]"><Play className="h-3 w-3 mr-1" /> Runbook</Button>}
              {a.status !== "suppressed" && <Button variant="ghost" size="sm" className="h-6 text-[10px]"><VolumeX className="h-3 w-3 mr-1" /> Suppress</Button>}
              {!a.assignee && <Button variant="ghost" size="sm" className="h-6 text-[10px]"><User className="h-3 w-3 mr-1" /> Assign</Button>}
              <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Eye className="h-3 w-3 mr-1" /> Investigate</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Alert Triage Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Severity clustering, ownership, suppression, and investigation launch</p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && <Badge className="bg-red-500 text-white animate-pulse">{criticalCount} Critical</Badge>}
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
        </div>
      </div>

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Alerts", value: DEMO_ALERTS.length, color: "text-primary" },
          { label: "Critical Active", value: criticalCount, color: "text-red-500" },
          { label: "Clusters", value: getClusters(DEMO_ALERTS).length, color: "text-blue-500" },
          { label: "Suppressed", value: suppressed.length, color: "text-muted-foreground" },
          { label: "Unassigned", value: unassigned.length, color: "text-amber-500" },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Status filter */}
      <div className="flex gap-1.5">
        {(["all", "active", "acknowledged", "suppressed", "resolved"] as const).map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" className="text-[10px] h-7" onClick={() => setStatusFilter(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="severity"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Severity Lanes</TabsTrigger>
          <TabsTrigger value="clusters"><Layers className="h-3.5 w-3.5 mr-1" /> Clusters</TabsTrigger>
          <TabsTrigger value="suppression"><VolumeX className="h-3.5 w-3.5 mr-1" /> Suppression</TabsTrigger>
          <TabsTrigger value="ownership"><Users className="h-3.5 w-3.5 mr-1" /> Ownership</TabsTrigger>
        </TabsList>

        <TabsContent value="severity" className="mt-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
            {(["critical", "high", "medium", "low"] as AlertSeverity[]).map(sev => {
              const sevAlerts = alerts.filter(a => a.severity === sev);
              if (sevAlerts.length === 0) return null;
              return (
                <div key={sev}>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${sevConfig[sev].color}`}>
                    {sev} ({sevAlerts.length})
                  </h3>
                  <div className="space-y-1.5">{sevAlerts.map(renderAlertCard)}</div>
                </div>
              );
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="clusters" className="mt-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {clusters.map(([name, clusterAlerts]) => (
              <div key={name}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground">{name}</h3>
                  <Badge variant="outline" className="text-[9px]">{clusterAlerts.length} alerts</Badge>
                  <Badge variant="outline" className={`text-[9px] ${sevConfig[clusterAlerts.sort((a, b) => {
                    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                    return order[a.severity] - order[b.severity];
                  })[0].severity].color}`}>
                    Peak: {clusterAlerts[0].severity}
                  </Badge>
                </div>
                <div className="space-y-1.5">{clusterAlerts.map(renderAlertCard)}</div>
              </div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="suppression" className="mt-4">
          {suppressed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <VolumeX className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No suppressed alerts
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
              {suppressed.map(renderAlertCard)}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="ownership" className="mt-4 space-y-4">
          {unassigned.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Unassigned ({unassigned.length})</h3>
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1.5">
                {unassigned.map(renderAlertCard)}
              </motion.div>
            </div>
          )}
          {assigned.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Assigned ({assigned.length})</h3>
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1.5">
                {assigned.map(renderAlertCard)}
              </motion.div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertTriageBoard;
