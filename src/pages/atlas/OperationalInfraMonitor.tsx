import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { DegradedStateBanner } from "@/components/sita/truth/DegradedStateBanner";
import { StalenessIndicator } from "@/components/sita/truth/StalenessIndicator";
import {
  Server, Database, HardDrive, Cpu, Clock, CheckCircle, AlertTriangle,
  Activity, Wifi, Lock, BarChart3, RefreshCw, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

const dbPools = [
  { name: "Primary Pool", maxConnections: 100, activeConnections: 38, idleConnections: 12, waitingClients: 0, utilizationPct: 38, status: "healthy" as const },
  { name: "Read Replica Pool", maxConnections: 50, activeConnections: 8, idleConnections: 22, waitingClients: 0, utilizationPct: 16, status: "healthy" as const },
  { name: "Edge Function Pool", maxConnections: 20, activeConnections: 5, idleConnections: 10, waitingClients: 0, utilizationPct: 25, status: "healthy" as const },
];

const replicaLag = [
  { replica: "Read Replica 1 (us-east-1)", lagMs: 12, lagBytes: 1024, status: "healthy" as const, lastCheck: h(0.01) },
  { replica: "Read Replica 2 (eu-west-1)", lagMs: 45, lagBytes: 8192, status: "healthy" as const, lastCheck: h(0.01) },
  { replica: "Realtime Listener", lagMs: 350, lagBytes: 32768, status: "elevated" as const, lastCheck: h(0.01) },
];

const certExpiry = [
  { name: "TLS Certificate (*.lovable.app)", expiresAt: "2026-09-15", daysLeft: 158, autoRenew: true, issuer: "Let's Encrypt" },
  { name: "Supabase API Certificate", expiresAt: "2026-12-01", daysLeft: 235, autoRenew: true, issuer: "AWS ACM" },
  { name: "Edge Function Signing Key", expiresAt: "2027-01-15", daysLeft: 280, autoRenew: false, issuer: "Internal PKI" },
  { name: "VAPID Key Pair", expiresAt: "2027-04-10", daysLeft: 365, autoRenew: false, issuer: "Self-signed" },
  { name: "JWT Signing Key (HS256)", expiresAt: "2027-01-10", daysLeft: 275, autoRenew: false, issuer: "Supabase" },
];

const storagePressure = [
  { resource: "Database (PostgreSQL)", usedGB: 2.4, totalGB: 8, pct: 30, status: "healthy" as const },
  { resource: "Storage Bucket: documents", usedGB: 0.8, totalGB: 5, pct: 16, status: "healthy" as const },
  { resource: "Storage Bucket: avatars", usedGB: 0.1, totalGB: 1, pct: 10, status: "healthy" as const },
  { resource: "WAL Archives", usedGB: 1.2, totalGB: 4, pct: 30, status: "healthy" as const },
  { resource: "Edge Function Logs", usedGB: 0.5, totalGB: 2, pct: 25, status: "healthy" as const },
];

const eventBusLag = [
  { channel: "realtime:public", subscriberCount: 3, avgLatencyMs: 45, peakLatencyMs: 350, status: "elevated" as const },
  { channel: "realtime:notifications", subscriberCount: 1, avgLatencyMs: 12, peakLatencyMs: 80, status: "healthy" as const },
  { channel: "realtime:workflow_events", subscriberCount: 2, avgLatencyMs: 28, peakLatencyMs: 120, status: "healthy" as const },
  { channel: "webhook:connectors", subscriberCount: 5, avgLatencyMs: 200, peakLatencyMs: 450, status: "elevated" as const },
];

const resourceMetrics = [
  { metric: "CPU Usage (Edge Functions)", current: 22, threshold: 80, unit: "%", status: "healthy" as const },
  { metric: "Memory Usage (Edge Functions)", current: 45, threshold: 90, unit: "%", status: "healthy" as const },
  { metric: "API Request Rate", current: 120, threshold: 1000, unit: "req/min", status: "healthy" as const },
  { metric: "Auth Token Refresh Rate", current: 8, threshold: 100, unit: "req/min", status: "healthy" as const },
  { metric: "Cold Start Rate", current: 3, threshold: 20, unit: "%", status: "healthy" as const },
  { metric: "Error Rate (5xx)", current: 0.02, threshold: 0.1, unit: "%", status: "healthy" as const },
];

export default function OperationalInfraMonitor() {
  const [tab, setTab] = useState("pools");
  const elevatedChannels = eventBusLag.filter(c => c.status === "elevated").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Operational Infrastructure Monitor" subtitle="Database pools, replica lag, certificate expiry, storage pressure, event bus latency, and resource utilization" />

      {elevatedChannels > 0 && (
        <DegradedStateBanner severity="info" reason={`${elevatedChannels} event channel(s) with elevated latency`} impact="Realtime updates may be delayed" dismissible />
      )}

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "DB Pool Util", value: `${dbPools[0].utilizationPct}%`, color: dbPools[0].utilizationPct < 70 ? "text-green-400" : "text-amber-400" },
          { label: "Max Replica Lag", value: `${Math.max(...replicaLag.map(r => r.lagMs))}ms`, color: "text-amber-400" },
          { label: "Cert Expiry (min)", value: `${Math.min(...certExpiry.map(c => c.daysLeft))}d`, color: "text-green-400" },
          { label: "Storage Used", value: `${storagePressure.reduce((s, r) => s + r.usedGB, 0).toFixed(1)}GB`, color: "text-foreground" },
          { label: "Event Channels", value: `${eventBusLag.filter(c => c.status === "healthy").length}/${eventBusLag.length}`, color: "text-green-400" },
          { label: "Error Rate", value: "0.02%", color: "text-green-400" },
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
            { value: "pools", label: "DB Pools", icon: Database },
            { value: "replica", label: "Replica Lag", icon: Activity },
            { value: "certs", label: "Cert Expiry", icon: Lock },
            { value: "storage", label: "Storage", icon: HardDrive },
            { value: "eventbus", label: "Event Bus", icon: Wifi },
            { value: "resources", label: "Resources", icon: Cpu },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="pools">
            <h3 className="text-xs font-semibold mb-3">Database Connection Pools</h3>
            {dbPools.map(pool => (
              <div key={pool.name} className="p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-400" />
                    <p className="text-xs font-medium text-foreground">{pool.name}</p>
                  </div>
                  <Badge variant="default" className="text-[9px]">{pool.utilizationPct}% used</Badge>
                </div>
                <Progress value={pool.utilizationPct} className="h-2 mb-2" />
                <div className="flex gap-4 text-[9px] text-muted-foreground">
                  <span>Active: {pool.activeConnections}</span>
                  <span>Idle: {pool.idleConnections}</span>
                  <span>Waiting: {pool.waitingClients}</span>
                  <span>Max: {pool.maxConnections}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="replica">
            <h3 className="text-xs font-semibold mb-3">Replication Lag</h3>
            {replicaLag.map(r => (
              <div key={r.replica} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  {r.status === "healthy" ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">{r.replica}</p>
                    <p className="text-[10px] text-muted-foreground">{(r.lagBytes / 1024).toFixed(1)}KB behind</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm font-bold", r.lagMs < 100 ? "text-green-400" : "text-amber-400")}>{r.lagMs}ms</p>
                  <StalenessIndicator lastUpdated={r.lastCheck} thresholdSeconds={60} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="certs">
            <h3 className="text-xs font-semibold mb-3">Certificate Expiry Countdown</h3>
            {certExpiry.map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <Lock className={cn("w-3.5 h-3.5", c.daysLeft < 30 ? "text-red-400" : c.daysLeft < 90 ? "text-amber-400" : "text-green-400")} />
                  <div>
                    <p className="text-xs text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.issuer} • expires {c.expiresAt}{c.autoRenew ? " • auto-renew" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(100, (c.daysLeft / 365) * 100)} className="w-16 h-1.5" />
                  <Badge variant={c.daysLeft < 30 ? "destructive" : c.daysLeft < 90 ? "secondary" : "default"} className="text-[9px]">{c.daysLeft}d</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="storage">
            <h3 className="text-xs font-semibold mb-3">Storage Pressure</h3>
            {storagePressure.map(s => (
              <div key={s.resource} className="p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-foreground">{s.resource}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{s.usedGB}GB / {s.totalGB}GB</p>
                </div>
                <Progress value={s.pct} className="h-1.5" />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="eventbus">
            <h3 className="text-xs font-semibold mb-3">Event Bus Channel Latency</h3>
            {eventBusLag.map(ch => (
              <div key={ch.channel} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  {ch.status === "healthy" ? <Wifi className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">{ch.channel}</p>
                    <p className="text-[10px] text-muted-foreground">{ch.subscriberCount} subscribers • Peak: {ch.peakLatencyMs}ms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm font-bold", ch.avgLatencyMs < 100 ? "text-green-400" : "text-amber-400")}>{ch.avgLatencyMs}ms</p>
                  <Badge variant={ch.status === "healthy" ? "default" : "secondary"} className="text-[9px] capitalize">{ch.status}</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="resources">
            <h3 className="text-xs font-semibold mb-3">Resource Utilization</h3>
            {resourceMetrics.map(m => (
              <div key={m.metric} className="p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-foreground">{m.metric}</p>
                  <p className="text-[10px] text-muted-foreground">{m.current}{m.unit} / {m.threshold}{m.unit} threshold</p>
                </div>
                <Progress value={(m.current / m.threshold) * 100} className="h-1.5" />
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}