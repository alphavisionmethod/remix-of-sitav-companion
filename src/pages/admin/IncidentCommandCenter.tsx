import { useState } from "react";
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
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

type Severity = "critical" | "high" | "medium" | "low";
type IncidentStatus = "open" | "investigating" | "mitigating" | "resolved" | "closed";

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  source: string;
  description: string;
  created_at: string;
  resolved_at?: string;
  assignee?: string;
  affected_services: string[];
  root_cause?: string;
  mitigation?: string;
  timeline: { time: string; action: string; actor: string }[];
}

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

const STATUS_CONFIG: Record<IncidentStatus, { color: string; icon: typeof AlertTriangle }> = {
  open: { color: "text-red-400", icon: AlertTriangle },
  investigating: { color: "text-amber-400", icon: Search },
  mitigating: { color: "text-blue-400", icon: Shield },
  resolved: { color: "text-emerald-400", icon: CheckCircle },
  closed: { color: "text-muted-foreground", icon: XCircle },
};

const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-001", title: "Connector sync failure — Plaid banking feed", severity: "critical", status: "investigating",
    source: "connector_engine", description: "Plaid connector failing to sync account balances. Affects 3 users. Last successful sync 4h ago.",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(), assignee: "System", affected_services: ["plaid", "finance-advisor", "cash-flow"],
    timeline: [
      { time: "2h ago", action: "Incident auto-created from connector health check", actor: "system" },
      { time: "1h 45m ago", action: "Retry attempt #1 failed — HTTP 503", actor: "connector_engine" },
      { time: "1h 30m ago", action: "Escalated to critical — staleness > 3h", actor: "staleness_monitor" },
      { time: "45m ago", action: "Investigating — checking Plaid API status", actor: "operator" },
    ],
  },
  {
    id: "INC-002", title: "AI advisor latency spike — business council", severity: "high", status: "mitigating",
    source: "telemetry", description: "Business advisor p95 latency exceeded 8s threshold. Avg response time 12.4s over last 30min.",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(), assignee: "AI Team", affected_services: ["business-advisor", "advisor-router"],
    mitigation: "Switched to fallback model (gpt-4o-mini). Monitoring recovery.",
    timeline: [
      { time: "5h ago", action: "Latency threshold breached — p95 > 8s", actor: "telemetry" },
      { time: "4h 30m ago", action: "Auto-downgrade to fallback model initiated", actor: "model_router" },
      { time: "4h ago", action: "Latency stabilized at 2.1s avg", actor: "telemetry" },
    ],
  },
  {
    id: "INC-003", title: "Workflow execution stuck — invoice approval chain", severity: "medium", status: "open",
    source: "workflow_engine", description: "3 workflow runs stuck in 'waiting-approval' state for >48h. No approver action taken.",
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(), affected_services: ["workflow_engine", "approval_queue"],
    timeline: [
      { time: "48h ago", action: "Workflow entered waiting-approval state", actor: "workflow_engine" },
      { time: "24h ago", action: "Staleness warning — no action in 24h", actor: "staleness_monitor" },
      { time: "12h ago", action: "Escalated to incident — 3 workflows stuck", actor: "system" },
    ],
  },
  {
    id: "INC-004", title: "Calendar sync credential expired", severity: "low", status: "resolved",
    source: "connector_engine", description: "Google Calendar OAuth token expired. Re-auth required.",
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(), resolved_at: new Date(Date.now() - 70 * 3600000).toISOString(),
    affected_services: ["google-calendar"], root_cause: "OAuth token TTL expired after 7 days without refresh.",
    timeline: [
      { time: "3d ago", action: "Sync failure detected", actor: "connector_engine" },
      { time: "3d ago", action: "Re-auth notification sent to user", actor: "notification_queue" },
      { time: "2d 22h ago", action: "User re-authenticated — sync restored", actor: "user" },
    ],
  },
];

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function IncidentCommandCenter() {
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Try real incidents from DB
  const { data: dbIncidents } = useQuery({
    queryKey: ["admin-incidents-all"],
    queryFn: async () => {
      const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const incidents = MOCK_INCIDENTS; // Merge with real data when available
  const active = incidents.filter(i => !["resolved", "closed"].includes(i.status));
  const resolved = incidents.filter(i => ["resolved", "closed"].includes(i.status));
  const criticalCount = active.filter(i => i.severity === "critical").length;

  const displayed = (tab === "active" ? active : tab === "resolved" ? resolved : incidents)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
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

      {/* Status banner */}
      {criticalCount > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">{criticalCount} critical incident{criticalCount > 1 ? "s" : ""} require immediate attention</span>
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
