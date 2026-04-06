import { useState } from "react";
import { motion } from "framer-motion";
import { Plug, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Shield, Key, Activity, Eye, Search, Settings, Database, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

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

const CONNECTORS: ConnectorStatus[] = [
  { id: "plaid", name: "Plaid Banking", type: "finance", status: "healthy", lastSyncAt: "15m ago", staleness: "fresh", errorRate: 0.1, syncCount24h: 48, credentialStatus: "valid", affectedDomains: ["finance", "cash-flow"], latencyMs: 245, dataFreshness: "Real-time" },
  { id: "stripe", name: "Stripe Payments", type: "payments", status: "healthy", lastSyncAt: "5m ago", staleness: "fresh", errorRate: 0, syncCount24h: 96, credentialStatus: "valid", affectedDomains: ["finance", "invoicing"], latencyMs: 120, dataFreshness: "Real-time" },
  { id: "google-cal", name: "Google Calendar", type: "calendar", status: "degraded", lastSyncAt: "2h ago", staleness: "warning", errorRate: 2.1, syncCount24h: 24, credentialStatus: "expiring", credentialExpiresIn: "3 days", affectedDomains: ["concierge", "scheduling"], latencyMs: 890, dataFreshness: "2h stale" },
  { id: "gmail", name: "Gmail", type: "email", status: "healthy", lastSyncAt: "10m ago", staleness: "fresh", errorRate: 0.3, syncCount24h: 72, credentialStatus: "valid", affectedDomains: ["communication", "crm"], latencyMs: 310, dataFreshness: "Near real-time" },
  { id: "crm-hub", name: "CRM Sync", type: "crm", status: "stale", lastSyncAt: "6h ago", staleness: "stale", errorRate: 5.2, syncCount24h: 8, credentialStatus: "valid", affectedDomains: ["sales", "pipeline"], latencyMs: 1200, dataFreshness: "6h stale" },
  { id: "accounting", name: "Accounting Platform", type: "accounting", status: "disconnected", lastSyncAt: "—", staleness: "critical", errorRate: 100, syncCount24h: 0, credentialStatus: "missing", affectedDomains: ["finance", "tax"], latencyMs: 0, dataFreshness: "No data" },
];

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

const SYNC_HISTORY = [
  { connector: "Plaid Banking", time: "15m ago", status: "success", records: 24, duration: "1.2s" },
  { connector: "Stripe Payments", time: "5m ago", status: "success", records: 8, duration: "0.4s" },
  { connector: "Gmail", time: "10m ago", status: "success", records: 15, duration: "2.1s" },
  { connector: "Google Calendar", time: "2h ago", status: "partial", records: 6, duration: "3.8s" },
  { connector: "CRM Sync", time: "6h ago", status: "failed", records: 0, duration: "12s" },
  { connector: "Plaid Banking", time: "1h ago", status: "success", records: 22, duration: "1.1s" },
  { connector: "Stripe Payments", time: "1h ago", status: "success", records: 12, duration: "0.5s" },
];

const POLICIES = [
  { connector: "plaid", maxStaleness: "1 hour", syncInterval: "30 min", retryPolicy: "3 attempts, exponential backoff", affectedFields: ["account-balances", "transaction-records"] },
  { connector: "stripe", maxStaleness: "30 min", syncInterval: "15 min", retryPolicy: "5 attempts, linear", affectedFields: ["payment-confirmations", "invoice-records"] },
  { connector: "google-cal", maxStaleness: "30 min", syncInterval: "30 min", retryPolicy: "3 attempts, exponential", affectedFields: ["calendar-events"] },
  { connector: "gmail", maxStaleness: "15 min", syncInterval: "15 min", retryPolicy: "3 attempts, exponential", affectedFields: ["email-content"] },
  { connector: "crm-hub", maxStaleness: "2 hours", syncInterval: "1 hour", retryPolicy: "3 attempts, linear", affectedFields: ["customer-records", "deal-records"] },
];

export default function ConnectorGovernanceCenter() {
  const [tab, setTab] = useState("connectors");

  const healthy = CONNECTORS.filter(c => c.status === "healthy").length;
  const issues = CONNECTORS.filter(c => !["healthy"].includes(c.status)).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Connector Governance Center</h1>
            <p className="text-sm text-muted-foreground">Health monitoring, credential governance, staleness policies, and sync history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Sync All</Button>
            <Button size="sm" className="gap-1.5"><Plug className="w-3.5 h-3.5" />Add Connector</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Connectors", value: CONNECTORS.length },
          { label: "Healthy", value: healthy, color: "text-emerald-400" },
          { label: "Issues", value: issues, color: issues > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Syncs (24h)", value: CONNECTORS.reduce((s, c) => s + c.syncCount24h, 0) },
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
              {CONNECTORS.map((conn, idx) => {
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
                            <Button variant="outline" size="sm" className="text-[10px] h-7"><RefreshCw className="w-3 h-3 mr-1" />Sync</Button>
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
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-2 px-2">Connector</th>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Records</th>
                  <th className="text-right py-2">Duration</th>
                </tr></thead>
                <tbody>
                  {SYNC_HISTORY.map((s, i) => (
                    <tr key={i} className="border-t border-border/20">
                      <td className="py-2 px-2 font-medium text-foreground">{s.connector}</td>
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
              {CONNECTORS.map(conn => (
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
              {POLICIES.map(pol => (
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
