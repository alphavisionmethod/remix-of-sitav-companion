import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, CheckCircle, XCircle, Shield, Activity, Users, Zap, ArrowRight, Filter, Search, BarChart3, Eye, RefreshCw, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useIncidentManagement, useEntityScoped } from "@/platform/sita/contexts/SitaKernelContext";
type Incident = { id: string; title: string; severity: string; status: string; assignee?: string; createdAt: string; [k: string]: any };
type Severity = "critical" | "high" | "medium" | "low";
type IncidentStatus = "active" | "investigating" | "mitigating" | "resolved" | "closed" | "open";
import { anomalyAlertSystem, type Anomaly } from "@/lib/services/anomaly-alert";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

const STATUS_CONFIG: Record<IncidentStatus, { color: string; icon: typeof AlertTriangle }> = {
  active: { color: "text-red-400", icon: Zap },
  open: { color: "text-red-400", icon: AlertTriangle },
  investigating: { color: "text-amber-400", icon: Search },
  mitigating: { color: "text-blue-400", icon: Shield },
  resolved: { color: "text-emerald-400", icon: CheckCircle },
  closed: { color: "text-muted-foreground", icon: XCircle },
};



function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function IncidentCommandCenter() {
  const { getActiveIncidents: getKernelIncidents, getIncidentMetrics, getDemoIncidents } = useIncidentManagement();
  const { entityId, entityType, tenantId } = useEntityScoped();
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  // Wire anomaly-alert service — scan on mount
  useEffect(() => {
    const userId = entityId || "system";
    anomalyAlertSystem.scan(userId).then(setAnomalies).catch(() => {});
  }, [entityId]);

  const { data: dbIncidents } = useQuery({
    queryKey: ["admin-incidents-all"],
    queryFn: async () => {
      const { data } = await fromTable("incidents").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const incidents: Incident[] = [];
  const active = incidents.filter(i => !["resolved", "closed"].includes(i.status));
  const resolved = incidents.filter(i => ["resolved", "closed"].includes(i.status));
  const criticalCount = active.filter(i => i.severity === "critical").length;

  const displayed = (tab === "active" ? active : tab === "resolved" ? resolved : incidents)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Incident Command Center</h1>
            <p className="text-sm text-muted-foreground">Severity triage, timeline investigation, root cause analysis, and remediation tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Refresh</Button>
            <Button size="sm" className="gap-1.5"><Bell className="w-3.5 h-3.5" />Declare Incident</Button>
          </div>
        </div>
      </motion.div>

      {criticalCount > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">{criticalCount} critical incident{criticalCount > 1 ? "s" : ""} require immediate attention</span>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Alert Feed */}
      {anomalies.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">Anomaly Detection Feed</span>
              <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20">{anomalies.length} detected</Badge>
            </div>
            {anomalies.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded border border-border/30 bg-card/30">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", a.severity === "critical" ? "bg-red-500" : a.severity === "warning" ? "bg-amber-500" : "bg-blue-500")} />
                  <span className="text-xs text-foreground">{a.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px]">{a.type.replace("_", " ")}</Badge>
                  <span className="text-[9px] text-muted-foreground">Δ {a.metric.deviation.toFixed(1)}σ</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Open", value: active.length, color: active.length > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Critical", value: criticalCount, color: criticalCount > 0 ? "text-red-400" : "text-muted-foreground" },
          { label: "Investigating", value: active.filter(i => i.status === "investigating").length, color: "text-amber-400" },
          { label: "Mitigating", value: active.filter(i => i.status === "mitigating").length, color: "text-blue-400" },
          { label: "Resolved (7d)", value: resolved.length, color: "text-emerald-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
            <TabsTrigger value="active" className="text-[10px] h-7 px-2.5">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="resolved" className="text-[10px] h-7 px-2.5">Resolved</TabsTrigger>
            <TabsTrigger value="all" className="text-[10px] h-7 px-2.5">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {displayed.map((incident, idx) => {
          const sevCfg = SEVERITY_CONFIG[incident.severity];
          const stCfg = STATUS_CONFIG[incident.status];
          const StIcon = stCfg.icon;
          const isExpanded = expanded === incident.id;

          return (
            <motion.div key={incident.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className={cn("border-border/50 hover:border-primary/20 transition-colors cursor-pointer", isExpanded && sevCfg.border)} onClick={() => setExpanded(isExpanded ? null : incident.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn("p-1.5 rounded-lg mt-0.5", sevCfg.bg)}>
                        <AlertTriangle className={cn("w-4 h-4", sevCfg.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{incident.id}</span>
                          <Badge className={cn("text-[9px]", sevCfg.bg, sevCfg.color)} variant="outline">{incident.severity}</Badge>
                          <Badge className={cn("text-[9px]", stCfg.color)} variant="outline"><StIcon className="w-2.5 h-2.5 mr-1" />{incident.status}</Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-1">{incident.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{incident.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(incident.created_at)}</span>
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{incident.source}</span>
                          {incident.assignee && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{incident.assignee}</span>}
                        </div>
                        <div className="flex gap-1 mt-1.5">{incident.affected_services.map(s => <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>)}</div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border/30 space-y-4">
                      {incident.root_cause && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Root Cause</p>
                          <p className="text-xs text-foreground">{incident.root_cause}</p>
                        </div>
                      )}
                      {incident.mitigation && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Mitigation</p>
                          <p className="text-xs text-foreground">{incident.mitigation}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Timeline</p>
                        <div className="space-y-2">
                          {incident.timeline.map((entry, ti) => (
                            <div key={ti} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-foreground">{entry.action}</p>
                                <p className="text-[10px] text-muted-foreground">{entry.time} · {entry.actor}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-[10px] h-7">Acknowledge</Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-7">Escalate</Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-7">Add Note</Button>
                        {incident.status !== "resolved" && <Button size="sm" className="text-[10px] h-7">Resolve</Button>}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {displayed.length === 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-foreground font-medium">No incidents found</p>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
