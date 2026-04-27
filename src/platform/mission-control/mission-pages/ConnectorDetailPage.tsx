// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Drill-Down Page
// Deep investigation: summary, health, logs, incidents, workflows
// ═══════════════════════════════════════════════════════════════

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useConnectorDetail, useConnectorHealth, useConnectorLogs } from "@/platform/mission-control/hooks/use-mission-control-views";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Wifi, WifiOff, AlertTriangle, ArrowLeft, Shield, Activity,
  Clock, RefreshCw, Eye, ChevronRight, Database, Lock, Zap, Server,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    connected: "bg-trust-verified/10 text-trust-safe border-trust-verified/20",
    degraded: "bg-accent/10 text-accent border-accent/20",
    disconnected: "bg-destructive/10 text-destructive border-destructive/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return <Badge variant="outline" className={cn("text-[10px]", styles[status] || "")}>{status}</Badge>;
}

export default function ConnectorDetailPage() {
  const { connectorId } = useParams<{ connectorId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const detail = useConnectorDetail(connectorId || "");
  const health = useConnectorHealth(connectorId || "");
  const logs = useConnectorLogs(connectorId || "");

  if (!detail) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
<button onClick={() => navigate("/mission-control")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Mission Control
        </button>
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <WifiOff className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Connector not found</p>
          <p className="text-xs text-muted-foreground mt-1">The connector "{connectorId}" does not exist or has been removed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-5">
      {/* Breadcrumb */}
      <button onClick={() => navigate("/mission-control")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Mission Control
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
              detail.status === "connected" ? "bg-trust-verified/10 shadow-trust-verified/10" : "bg-accent/10 shadow-accent/10"
            )}>
              <Wifi className={cn("h-7 w-7", detail.status === "connected" ? "text-trust-safe" : "text-accent")} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-xl font-bold text-foreground">{detail.name}</h1>
                <StatusBadge status={detail.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {detail.environment} · {detail.scopes.join(", ")} · Trust: {detail.trustScore}/100
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-all">
              <RefreshCw className="h-3 w-3 inline mr-1" /> Reconnect
            </button>
            <button className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-all">
              Pause
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-5">
          {[
            { label: "Health Score", value: `${detail.healthScore}`, accent: detail.healthScore < 70 },
            { label: "Uptime", value: `${detail.uptimePercent.toFixed(1)}%` },
            { label: "Latency", value: `${detail.latencyMs}ms` },
            { label: "Error Rate", value: `${(detail.errorRate * 100).toFixed(1)}%`, accent: detail.errorRate > 0.03 },
            { label: "Retry Queue", value: `${detail.retryQueue}`, accent: detail.retryQueue > 3 },
            { label: "Workflows", value: `${detail.affectedWorkflows}` },
          ].map(m => (
            <div key={m.label} className={cn("rounded-xl border px-3 py-2.5 text-center", m.accent ? "border-accent/20 bg-accent/5" : "border-border bg-card/50")}>
              <p className={cn("font-display text-lg font-bold", m.accent ? "text-accent" : "text-foreground")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5">
          <TabsTrigger value="overview" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="health" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">Health</TabsTrigger>
          <TabsTrigger value="logs" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">Logs</TabsTrigger>
        </TabsList>

        <div className="mt-5">
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Permissions */}
              <SitaCard hover={false}>
                <SitaCardTitle sub="Granted API scopes">Permissions</SitaCardTitle>
                <div className="mt-3 space-y-1.5">
                  {detail.scopes.map(s => (
                    <div key={s} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-1.5">
                      <Lock className="h-3 w-3 text-primary" />
                      <span className="text-xs text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </SitaCard>

              {/* Recent Failures */}
              <SitaCard hover={false}>
                <SitaCardTitle sub={`${detail.recentFailures.length} events`}>Recent Issues</SitaCardTitle>
                <div className="mt-3 space-y-2">
                  {detail.recentFailures.map(f => (
                    <div key={f.id} className="flex items-start gap-2 rounded-lg bg-secondary/20 px-3 py-2">
                      <div className={cn("h-2 w-2 rounded-full mt-1 shrink-0",
                        f.severity === "error" ? "bg-destructive" : f.severity === "warning" ? "bg-accent" : "bg-primary/50"
                      )} />
                      <div>
                        <p className="text-xs text-foreground">{f.message}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(f.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SitaCard>

              {/* Sync Quality */}
              <SitaCard hover={false}>
                <SitaCardTitle sub="Data quality indicator">Sync Quality</SitaCardTitle>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Quality Score</span>
                    <span className="font-semibold text-foreground">{detail.syncQuality}/100</span>
                  </div>
                  <Progress value={detail.syncQuality} className="h-2" />
                </div>
              </SitaCard>

              {/* Trust */}
              <SitaCard hover={false}>
                <SitaCardTitle sub="Connector trust assessment">Trust Level</SitaCardTitle>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-trust-verified/10">
                    <Shield className={cn("h-7 w-7", detail.trustScore >= 80 ? "text-trust-safe" : "text-accent")} />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-foreground">{detail.trustScore}</p>
                    <p className="text-[10px] text-muted-foreground">{detail.trustScore >= 80 ? "High trust" : "Needs attention"}</p>
                  </div>
                </div>
              </SitaCard>
            </div>
          </TabsContent>

          <TabsContent value="health">
            {health && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Latency P50", value: `${health.latencyP50.toFixed(0)}ms` },
                    { label: "Latency P99", value: `${health.latencyP99.toFixed(0)}ms`, accent: health.latencyP99 > 500 },
                    { label: "Retry Queue", value: `${health.retryQueueDepth}`, accent: health.retryQueueDepth > 3 },
                    { label: "Failure Rate", value: `${(health.syncFailureRate * 100).toFixed(1)}%`, accent: health.syncFailureRate > 0.03 },
                  ].map(m => (
                    <div key={m.label} className={cn("rounded-xl border px-3 py-2.5 text-center", m.accent ? "border-accent/20 bg-accent/5" : "border-border bg-card/50")}>
                      <p className={cn("font-display text-lg font-bold", m.accent ? "text-accent" : "text-foreground")}>{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                <SitaCard hover={false}>
                  <SitaCardTitle sub={`Auth expires in ${health.authExpiresIn}`}>Auth & Idempotency</SitaCardTitle>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-[10px] text-muted-foreground">Auth Expiry</p>
                      <p className="text-sm font-semibold text-foreground">{health.authExpiresIn}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-[10px] text-muted-foreground">Idempotency Issues</p>
                      <p className="text-sm font-semibold text-foreground">{health.idempotencyIssues}</p>
                    </div>
                  </div>
                </SitaCard>

                {health.trustWarnings.length > 0 && (
                  <SitaCard hover={false} className="border-accent/20 bg-accent/3">
                    <SitaCardTitle>Trust Warnings</SitaCardTitle>
                    <div className="mt-3 space-y-1.5">
                      {health.trustWarnings.map((w, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-accent">
                          <AlertTriangle className="h-3 w-3" /> {w}
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                )}

                <SitaCard hover={false}>
                  <SitaCardTitle sub="Trend direction">Degradation Trend</SitaCardTitle>
                  <div className="mt-3 flex items-center gap-3">
                    <div className={cn("rounded-lg px-3 py-1.5 text-xs font-medium",
                      health.degradationTrend === "stable" ? "bg-trust-verified/10 text-trust-safe" :
                      health.degradationTrend === "improving" ? "bg-trust-verified/10 text-trust-safe" :
                      "bg-accent/10 text-accent"
                    )}>
                      {health.degradationTrend}
                    </div>
                  </div>
                </SitaCard>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <SitaCard hover={false}>
              <div className="flex items-center justify-between mb-4">
                <SitaCardTitle sub={`${logs.length} recent entries`}>Connector Logs</SitaCardTitle>
                <button className="rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
                  <Database className="h-3 w-3 inline mr-1" /> Export
                </button>
              </div>
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/30 transition-colors"
                  >
                    <div className={cn("h-2 w-2 rounded-full shrink-0",
                      log.severity === "error" ? "bg-destructive" : log.severity === "warning" ? "bg-accent" : "bg-primary/50"
                    )} />
                    <Badge variant="outline" className="text-[9px] shrink-0 w-20 justify-center">{log.type}</Badge>
                    <span className="text-xs text-foreground flex-1">{log.message}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </motion.div>
                ))}
              </div>
            </SitaCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
