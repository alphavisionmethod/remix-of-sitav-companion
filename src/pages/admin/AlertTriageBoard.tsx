import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertTriangle, Clock, CheckCircle, XCircle, Play, Eye, VolumeX, User, RefreshCw } from "lucide-react";

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

const ALERTS: Alert[] = [
  { id: "al-1", title: "Database connection pool exhaustion", severity: "critical", status: "active", source: "db-monitor", cluster: "database", timeToBreachMin: 5, runbookId: "rb-db-pool", createdAt: "2026-04-05T10:22:00Z", likelyImpact: "API failures, user-facing errors" },
  { id: "al-2", title: "Connector Slack OAuth token expiring", severity: "high", status: "active", source: "connector-health", cluster: "connectors", timeToBreachMin: 120, runbookId: "rb-conn-refresh", createdAt: "2026-04-05T10:15:00Z", likelyImpact: "Slack integration failure" },
  { id: "al-3", title: "Workflow engine memory pressure", severity: "medium", status: "acknowledged", source: "k8s-monitor", cluster: "compute", assignee: "ops-team", createdAt: "2026-04-05T09:50:00Z", likelyImpact: "Workflow processing delays" },
  { id: "al-4", title: "SSL certificate renewal due in 14d", severity: "low", status: "active", source: "cert-monitor", createdAt: "2026-04-05T08:00:00Z", likelyImpact: "None if renewed on time" },
  { id: "al-5", title: "Duplicate event bus messages detected", severity: "medium", status: "suppressed", source: "event-bus", cluster: "messaging", createdAt: "2026-04-05T09:30:00Z", likelyImpact: "Idempotency handling required" },
];

const AlertTriageBoard = () => {
  const [filter, setFilter] = useState<"all" | AlertSeverity>("all");

  const filtered = filter === "all" ? ALERTS : ALERTS.filter(a => a.severity === filter);
  const criticalCount = ALERTS.filter(a => a.severity === "critical" && a.status === "active").length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Alert Triage Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Curated alert streams with severity clustering and runbook links</p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && <Badge className="bg-red-500 text-white animate-pulse">{criticalCount} Critical</Badge>}
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp}>
          <Tabs value={filter} onValueChange={v => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All ({ALERTS.length})</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <div className="space-y-2">
          {filtered.map(a => {
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
                    <div className="flex items-center gap-2">
                      {a.timeToBreachMin != null && (
                        <Badge variant="outline" className={`text-[9px] ${a.timeToBreachMin < 15 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                          <Clock className="h-2.5 w-2.5 mr-0.5" /> Breach in {a.timeToBreachMin}m
                        </Badge>
                      )}
                      {a.assignee && <Badge variant="outline" className="text-[9px]"><User className="h-2.5 w-2.5 mr-0.5" /> {a.assignee}</Badge>}
                      {a.runbookId && <Button variant="outline" size="sm" className="h-6 text-[10px]"><Play className="h-3 w-3 mr-1" /> Runbook</Button>}
                      {a.status !== "suppressed" && <Button variant="ghost" size="sm" className="h-6 text-[10px]"><VolumeX className="h-3 w-3 mr-1" /> Suppress</Button>}
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Eye className="h-3 w-3 mr-1" /> Investigate</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default AlertTriageBoard;
