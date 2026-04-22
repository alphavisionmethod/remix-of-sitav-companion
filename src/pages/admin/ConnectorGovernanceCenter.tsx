import { useState } from "react";
import { motion } from "framer-motion";
import { Plug, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Shield, Key, Activity, Eye, Search, Settings, Database, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { ConnectorSyncDashboard } from "@/components/sita/ConnectorSyncDashboard";
import { toast } from "sonner";
import { DEMO_FALLBACK_SYNC_HISTORY, DEMO_POLICIES } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_CONNECTORS: any[] = [];

interface ConnectorStatus {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "degraded" | "stale" | "critical" | "disconnected";
  lastSyncAt: string;
  staleness: "fresh" | "warning" | "stale" | "critical";
  errorRate: number;
  syncCount24h: number;
  credentialStatus: "valid" | "expiring" | "expired" | "missing";
  credentialExpiresIn?: string;
  affectedDomains: string[];
  latencyMs: number;
  dataFreshness: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  healthy: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  degraded: { color: "text-amber-400", bg: "bg-amber-500/10" },
  stale: { color: "text-orange-400", bg: "bg-orange-500/10" },
  critical: { color: "text-red-400", bg: "bg-red-500/10" },
  disconnected: { color: "text-muted-foreground", bg: "bg-muted/30" },
};

const CRED_CONFIG: Record<string, { color: string }> = {
  valid: { color: "text-emerald-400" },
  expiring: { color: "text-amber-400" },
  expired: { color: "text-red-400" },
  missing: { color: "text-muted-foreground" },
};

export default function ConnectorGovernanceCenter() {
  const [tab, setTab] = useState("connectors");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch real sync history from audit_logs
  const { data: syncHistory = DEMO_FALLBACK_SYNC_HISTORY } = useQuery({
    queryKey: ["connector-sync-history", user?.id],
    enabled: !!user,
    refetchInterval: tab === "history" ? 5000 : false,
    queryFn: async () => {
      const { data, error } = await db.from("audit_logs")
        .select("*")
        .or("category.eq.connector,action.ilike.sync%")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error || !data || data.length === 0) return DEMO_FALLBACK_SYNC_HISTORY;
      return data.map((log: Record<string, any>) => ({
        connector: log.details?.connector_type || log.target_type || "Unknown",
        time: new Date(log.created_at).toLocaleString(),
        status: log.details?.status || (log.action?.includes("fail") ? "failed" : "success"),
        records: log.details?.records_synced ?? log.details?.record_count ?? 0,
        duration: log.details?.duration_ms ? `${(log.details.duration_ms / 1000).toFixed(1)}s` : "—",
      }));
    },
    staleTime: 5000,
  });

  // Fetch real connectors from DB, fallback to hardcoded
  const { data: dbConnectors } = useQuery({
    queryKey: ["governance-connectors", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: registry } = await fromTable("connector_registry").select("*").eq("user_id", user!.id);
      const { data: accounts } = await fromTable("connector_accounts").select("*").eq("user_id", user!.id);
      if ((!registry || registry.length === 0) && (!accounts || accounts.length === 0)) return null;
      return { registry: registry || [], accounts: accounts || [] };
    },
    staleTime: 30000,
  });

  const activeConnectors = dbConnectors ? ([] as typeof DEMO_CONNECTORS).map(c => {
    const acc = dbConnectors.accounts.find((a: Record<string, any>) => a.connector_type === c.id);
    return acc ? { ...c, status: acc.status === "active" ? "healthy" as const : c.status, lastSyncAt: acc.connected_at ? new Date(acc.connected_at).toLocaleTimeString() : c.lastSyncAt } : c;
  }) : DEMO_CONNECTORS;

  const healthy = activeConnectors.filter(c => c.status === "healthy").length;
  const issues = activeConnectors.filter(c => !["healthy"].includes(c.status)).length;

  const handleDiscover = async () => {
    try {
      await supabase.functions.invoke("connector-discover", { body: { action: "scan" } });
      toast.success("Discovery scan started");
    } catch {
      toast.error("Discovery failed");
    }
  };

  const handleSyncAll = async () => {
    try {
      await supabase.functions.invoke("connector-batch", {
        body: { action: "submit", operations: activeConnectors.filter(c => c.status !== "disconnected").map(c => ({ type: "sync", connector_type: c.id })) },
      });
      toast.success("Sync All triggered");
      queryClient.invalidateQueries({ queryKey: ["connector-sync-history"] });
      queryClient.invalidateQueries({ queryKey: ["governance-connectors"] });
      queryClient.invalidateQueries({ queryKey: ["connector-sync-dashboard"] });
    } catch {
      toast.error("Sync failed");
    }
  };

  const handleSyncOne = async (connectorId: string) => {
    try {
      await supabase.functions.invoke("connector-batch", {
        body: { action: "submit", connector_type: connectorId, operations: [{ type: "sync", payload: {} }] },
      });
      toast.success(`Sync triggered for ${connectorId}`);
      queryClient.invalidateQueries({ queryKey: ["connector-sync-history"] });
      queryClient.invalidateQueries({ queryKey: ["governance-connectors"] });
      queryClient.invalidateQueries({ queryKey: ["connector-sync-dashboard"] });
    } catch {
      toast.error("Sync failed");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Connector Governance Center</h1>
            <p className="text-sm text-muted-foreground">Health monitoring, credential governance, staleness policies, and sync history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSyncAll}><RefreshCw className="w-3.5 h-3.5" />Sync All</Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDiscover}><Search className="w-3.5 h-3.5" />Discover</Button>
            <Button size="sm" className="gap-1.5"><Plug className="w-3.5 h-3.5" />Add Connector</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Connectors", value: activeConnectors.length },
          { label: "Healthy", value: healthy, color: "text-emerald-400" },
          { label: "Issues", value: issues, color: issues > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Syncs (24h)", value: activeConnectors.reduce((s, c) => s + c.syncCount24h, 0) },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color || "text-foreground")}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "connectors", label: "Connectors", icon: Plug },
            { value: "history", label: "Sync History", icon: Activity },
            { value: "credentials", label: "Credentials", icon: Key },
            { value: "policies", label: "Freshness Policies", icon: Shield },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="connectors">
            <div className="space-y-3">
              {activeConnectors.map((conn, idx) => {
                const sCfg = STATUS_CONFIG[conn.status];
                return (
                  <motion.div key={conn.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                    <Card className={cn("bg-card/50 border-border/50", conn.status === "critical" && "border-red-500/20", conn.status === "disconnected" && "opacity-60")}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-2.5 h-2.5 rounded-full", sCfg.bg.replace("/10", "").replace("bg-", "bg-"))}><div className={cn("w-2.5 h-2.5 rounded-full", conn.status === "healthy" ? "bg-emerald-400" : conn.status === "degraded" ? "bg-amber-400" : conn.status === "stale" ? "bg-orange-400" : conn.status === "critical" ? "bg-red-400" : "bg-muted-foreground")} /></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{conn.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[8px]">{conn.type}</Badge>
                                <Badge variant="outline" className={cn("text-[8px] capitalize", sCfg.color)}>{conn.status}</Badge>
                                <Badge variant="outline" className={cn("text-[8px]", CRED_CONFIG[conn.credentialStatus].color)}>Cred: {conn.credentialStatus}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-xs">
                            <div className="text-center"><p className="font-bold text-foreground">{conn.lastSyncAt}</p><p className="text-[9px] text-muted-foreground">Last Sync</p></div>
                            <div className="text-center"><p className="font-bold text-foreground">{conn.syncCount24h}</p><p className="text-[9px] text-muted-foreground">Syncs/24h</p></div>
                            <div className="text-center"><p className={cn("font-bold", conn.errorRate > 1 ? "text-amber-400" : "text-emerald-400")}>{conn.errorRate}%</p><p className="text-[9px] text-muted-foreground">Error Rate</p></div>
                            <div className="text-center"><p className="font-bold text-foreground">{conn.latencyMs}ms</p><p className="text-[9px] text-muted-foreground">Latency</p></div>
                            <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => handleSyncOne(conn.id)}><RefreshCw className="w-3 h-3 mr-1" />Sync</Button>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2">{conn.affectedDomains.map(d => <Badge key={d} variant="outline" className="text-[8px]">{d}</Badge>)}</div>
                        {conn.dataFreshness !== "Real-time" && conn.dataFreshness !== "Near real-time" && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <p className="text-[10px] text-amber-400">⚠ Data freshness: {conn.dataFreshness}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ConnectorSyncDashboard compact />
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs">
                <thead><tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-2 px-2">Connector</th>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Records</th>
                  <th className="text-right py-2">Duration</th>
                </tr></thead>
                <tbody>
                  {syncHistory.map((s: any, i: number) => (
                    <tr key={i} className="border-t border-border/20">
                      <td className="py-2 px-2 font-medium text-foreground capitalize">{s.connector}</td>
                      <td className="py-2 text-muted-foreground">{s.time}</td>
                      <td className="py-2">
                        <Badge variant={s.status === "success" ? "default" : s.status === "partial" ? "secondary" : "destructive"} className="text-[9px]">{s.status}</Badge>
                      </td>
                      <td className="py-2 text-right text-foreground">{s.records}</td>
                      <td className="py-2 text-right text-muted-foreground">{s.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="credentials">
            <div className="space-y-3">
              {activeConnectors.map(conn => (
                <Card key={conn.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className={cn("w-4 h-4", CRED_CONFIG[conn.credentialStatus].color)} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{conn.name}</p>
                          <Badge variant="outline" className={cn("text-[9px] capitalize", CRED_CONFIG[conn.credentialStatus].color)}>{conn.credentialStatus}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {conn.credentialExpiresIn && <span className="text-[10px] text-amber-400">Expires in {conn.credentialExpiresIn}</span>}
                        {conn.credentialStatus !== "valid" && <Button variant="outline" size="sm" className="text-[10px] h-7">Re-authenticate</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policies">
            <div className="space-y-3">
              {([] as typeof DEMO_POLICIES).map(pol => (
                <Card key={pol.connector} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-foreground capitalize mb-2">{pol.connector}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-muted-foreground">Max Staleness</p><p className="text-foreground font-medium">{pol.maxStaleness}</p></div>
                      <div><p className="text-muted-foreground">Sync Interval</p><p className="text-foreground font-medium">{pol.syncInterval}</p></div>
                      <div><p className="text-muted-foreground">Retry Policy</p><p className="text-foreground font-medium">{pol.retryPolicy}</p></div>
                      <div><p className="text-muted-foreground">Affected Fields</p><div className="flex gap-1 flex-wrap mt-0.5">{pol.affectedFields.map(f => <Badge key={f} variant="outline" className="text-[8px]">{f}</Badge>)}</div></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
