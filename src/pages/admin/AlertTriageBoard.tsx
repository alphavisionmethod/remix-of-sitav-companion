// ═══════════════════════════════════════════════════════════════
// SITA OS — Alert Triage Board (Phase 20.D — DE-DEMOIZED)
// Live alerts queried from public.alerts; ack/suppress/assign/
// resolve actions wired to alert-actions edge function.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, AlertTriangle, Clock, Play, Eye, VolumeX, User, RefreshCw, Users, Layers, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ackAlert, suppressAlert, resolveAlert } from "@/lib/services/alerting/alert-client";
import { useToast } from "@/hooks/use-toast";
import { AlertSuppressionRulesPanel } from "@/components/admin/alerts/AlertSuppressionRulesPanel";
import { AlertDedupStats } from "@/components/admin/alerts/AlertDedupStats";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";
type AlertStatus = "active" | "acknowledged" | "suppressed" | "resolved";

interface AlertRow {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  subsystem: string;
  runbook_id: string | null;
  assignee_user_id: string | null;
  count: number;
  first_seen_at: string;
  last_seen_at: string;
  metadata: Record<string, unknown>;
}

const sevConfig: Record<AlertSeverity, { color: string; bg: string }> = {
  critical: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  high:     { color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  medium:   { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  low:      { color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  info:     { color: "text-muted-foreground", bg: "bg-muted/30 border-border" },
};

const SEVERITIES: AlertSeverity[] = ["critical", "high", "medium", "low", "info"];

const AlertTriageBoard = () => {
  const [tab, setTab] = useState("severity");
  const [statusFilter, setStatusFilter] = useState<"all" | AlertStatus>("all");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: alertsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["alerts", "triage", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("alerts")
        .select("*")
        .order("last_seen_at", { ascending: false })
        .limit(200);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AlertRow[];
    },
    refetchInterval: 15_000,
  });

  const alerts = alertsData ?? [];
  const allAlerts = useMemo(() => alerts, [alerts]);

  const criticalCount = allAlerts.filter((a) => a.severity === "critical" && a.status === "active").length;
  const suppressed    = allAlerts.filter((a) => a.status === "suppressed");
  const assigned      = allAlerts.filter((a) => a.assignee_user_id);
  const unassigned    = allAlerts.filter((a) => !a.assignee_user_id && a.status === "active");

  const clusters = useMemo(() => {
    const map = new Map<string, AlertRow[]>();
    for (const a of allAlerts) {
      const key = a.subsystem || "unclustered";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [allAlerts]);

  const ackMut = useMutation({
    mutationFn: (id: string) => ackAlert(id),
    onSuccess: () => { toast({ title: "Alert acknowledged" }); qc.invalidateQueries({ queryKey: ["alerts"] }); },
    onError: (e) => toast({ title: "Ack failed", description: String(e), variant: "destructive" }),
  });
  const suppressMut = useMutation({
    mutationFn: (id: string) => suppressAlert(id, new Date(Date.now() + 60 * 60_000).toISOString(), "manual suppress 1h"),
    onSuccess: () => { toast({ title: "Alert suppressed for 1h" }); qc.invalidateQueries({ queryKey: ["alerts"] }); },
    onError: (e) => toast({ title: "Suppress failed", description: String(e), variant: "destructive" }),
  });
  const resolveMut = useMutation({
    mutationFn: (id: string) => resolveAlert(id),
    onSuccess: () => { toast({ title: "Alert resolved" }); qc.invalidateQueries({ queryKey: ["alerts"] }); },
    onError: (e) => toast({ title: "Resolve failed", description: String(e), variant: "destructive" }),
  });

  const renderAlertCard = (a: AlertRow) => {
    const sev = sevConfig[a.severity] ?? sevConfig.info;
    return (
      <motion.div key={a.id} variants={fadeUp}>
        <Card className={`hover:bg-muted/30 transition-colors ${a.severity === "critical" ? "border-red-500/30" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <AlertTriangle className={`h-4 w-4 ${sev.color}`} />
                <span className="text-sm font-medium text-foreground">{a.title}</span>
                <Badge variant="outline" className={`text-[9px] ${sev.color} ${sev.bg}`}>{a.severity}</Badge>
                <Badge variant="outline" className="text-[9px]">{a.status}</Badge>
                {a.count > 1 && <Badge variant="outline" className="text-[9px]">×{a.count}</Badge>}
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(a.last_seen_at).toLocaleTimeString()}</span>
            </div>
            {a.description && <p className="text-xs text-muted-foreground mb-2">{a.description}</p>}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
              <span>Source: <span className="text-foreground">{a.source}</span></span>
              <span>Subsystem: <span className="text-foreground">{a.subsystem}</span></span>
              <span><Clock className="h-2.5 w-2.5 inline" /> {new Date(a.first_seen_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {a.runbook_id && (
                <Button variant="outline" size="sm" className="h-6 text-[10px]" asChild>
                  <a href={`/admin/support/runbooks/${a.runbook_id}`}><Play className="h-3 w-3 mr-1" /> Runbook</a>
                </Button>
              )}
              {a.status === "active" && (
                <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => ackMut.mutate(a.id)} disabled={ackMut.isPending}>
                  {ackMut.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Eye className="h-3 w-3 mr-1" />} Acknowledge
                </Button>
              )}
              {a.status !== "suppressed" && a.status !== "resolved" && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => suppressMut.mutate(a.id)} disabled={suppressMut.isPending}>
                  <VolumeX className="h-3 w-3 mr-1" /> Suppress 1h
                </Button>
              )}
              {a.status !== "resolved" && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => resolveMut.mutate(a.id)} disabled={resolveMut.isPending}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Alert Triage Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live alerts from <code>public.alerts</code> · severity clustering, ownership, suppression, investigation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && <Badge className="bg-red-500 text-foreground animate-pulse">{criticalCount} Critical</Badge>}
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />} Refresh
          </Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Alerts",    value: allAlerts.length, color: "text-primary" },
          { label: "Critical Active", value: criticalCount,    color: "text-red-500" },
          { label: "Subsystems",      value: clusters.length,  color: "text-blue-500" },
          { label: "Suppressed",      value: suppressed.length, color: "text-muted-foreground" },
          { label: "Unassigned",      value: unassigned.length, color: "text-amber-500" },
        ].map((m) => (
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

      <div className="flex gap-1.5">
        {(["all", "active", "acknowledged", "suppressed", "resolved"] as const).map((s) => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" className="text-[10px] h-7" onClick={() => setStatusFilter(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="severity"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Severity</TabsTrigger>
          <TabsTrigger value="clusters"><Layers className="h-3.5 w-3.5 mr-1" /> Subsystems</TabsTrigger>
          <TabsTrigger value="suppression"><VolumeX className="h-3.5 w-3.5 mr-1" /> Suppression</TabsTrigger>
          <TabsTrigger value="ownership"><Users className="h-3.5 w-3.5 mr-1" /> Ownership</TabsTrigger>
        </TabsList>

        <TabsContent value="severity" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No alerts. System is calm.
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
              {SEVERITIES.map((sev) => {
                const sevAlerts = alerts.filter((a) => a.severity === sev);
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
          )}
        </TabsContent>

        <TabsContent value="clusters" className="mt-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {clusters.map(([name, clusterAlerts]) => (
              <div key={name}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground">{name}</h3>
                  <Badge variant="outline" className="text-[9px]">{clusterAlerts.length} alerts</Badge>
                </div>
                <div className="space-y-1.5">{clusterAlerts.map(renderAlertCard)}</div>
              </div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="suppression" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {suppressed.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <VolumeX className="h-8 w-8 mx-auto mb-2 opacity-30" /> No suppressed alerts
                </div>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                  {suppressed.map(renderAlertCard)}
                </motion.div>
              )}
            </div>
            <div className="space-y-4">
              <AlertSuppressionRulesPanel />
              <AlertDedupStats />
            </div>
          </div>
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
          {assigned.length === 0 && unassigned.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <User className="h-8 w-8 mx-auto mb-2 opacity-30" /> No active alerts to assign
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertTriageBoard;
