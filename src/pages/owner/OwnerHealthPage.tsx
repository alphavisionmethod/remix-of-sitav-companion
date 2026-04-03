// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Health Center
// System health by module, service, connector, release, workflow
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useMissionControlSummary, useConnectorSummaries, useTrustSummary,
  useDiagnosticsSummary,
} from "@/hooks/use-mission-control-views";
import {
  Heart, Shield, Wifi, Cpu, CheckCircle, AlertTriangle, XCircle,
  Activity, Server, Database, RefreshCw, Zap, TrendingDown,
} from "lucide-react";

interface ModuleHealth {
  name: string;
  domain: string;
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  latencyP50: number;
  errorRate: number;
  verificationRate: number;
  trustContribution: number;
}

const modules: ModuleHealth[] = [
  { name: "Brain Core", domain: "core", status: "healthy", uptime: 99.99, latencyP50: 45, errorRate: 0.01, verificationRate: 99.8, trustContribution: 25 },
  { name: "Policy Engine", domain: "core", status: "healthy", uptime: 99.95, latencyP50: 12, errorRate: 0.02, verificationRate: 99.5, trustContribution: 20 },
  { name: "Receipt Service", domain: "proof", status: "healthy", uptime: 99.98, latencyP50: 8, errorRate: 0.00, verificationRate: 100, trustContribution: 15 },
  { name: "Workflow Engine", domain: "execution", status: "degraded", uptime: 99.90, latencyP50: 85, errorRate: 0.05, verificationRate: 98.2, trustContribution: 15 },
  { name: "Connector Gateway", domain: "integration", status: "degraded", uptime: 99.85, latencyP50: 120, errorRate: 0.08, verificationRate: 97.5, trustContribution: 10 },
  { name: "Model Router", domain: "ai", status: "healthy", uptime: 99.97, latencyP50: 200, errorRate: 0.03, verificationRate: 99.0, trustContribution: 10 },
  { name: "Memory Service", domain: "state", status: "healthy", uptime: 99.96, latencyP50: 15, errorRate: 0.01, verificationRate: 99.9, trustContribution: 5 },
];

const statusIcon = (s: string) => s === "healthy" ? <CheckCircle className="h-4 w-4 text-trust-safe" /> : s === "degraded" ? <AlertTriangle className="h-4 w-4 text-accent" /> : <XCircle className="h-4 w-4 text-destructive" />;
const statusColor = (s: string) => s === "healthy" ? "border-trust-verified/20" : s === "degraded" ? "border-accent/20" : "border-destructive/20";

export default function OwnerHealthPage() {
  const summary = useMissionControlSummary();
  const connectors = useConnectorSummaries();
  const trust = useTrustSummary();
  const diagnostics = useDiagnosticsSummary();
  const healthyCount = modules.filter(m => m.status === "healthy").length;
  const overallScore = Math.round((healthyCount / modules.length) * 100);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-trust-verified/10 shadow-lg shadow-trust-verified/10">
            <Heart className="h-7 w-7 text-trust-safe" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">System Health</h1>
            <p className="text-sm text-muted-foreground">Module-level health, degradation patterns, trust posture</p>
          </div>
          <Badge variant="outline" className={cn("ml-auto text-sm", overallScore >= 90 ? "bg-trust-verified/10 text-trust-safe" : "bg-accent/10 text-accent")}>
            {overallScore}% Healthy
          </Badge>
        </div>
      </motion.div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Services Healthy", value: `${healthyCount}/${modules.length}`, icon: Server },
          { label: "Connectors Up", value: `${connectors.filter(c => c.status === "healthy").length}/${connectors.length}`, icon: Wifi },
          { label: "Verification Rate", value: `${trust.verificationRate}%`, icon: Shield },
          { label: "Active Incidents", value: `${summary.activeIncidents}`, icon: AlertTriangle },
          { label: "Recovery Queue", value: `${diagnostics.recentFailures}`, icon: RefreshCw },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
            <k.icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Module health grid */}
      <SitaSectionHeader title="Module Health Map" subtitle="Per-service health with trust contribution" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modules.map((m, i) => (
          <motion.div key={m.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <SitaCard hover className={statusColor(m.status)}>
              <div className="flex items-start gap-3">
                {statusIcon(m.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                    <Badge variant="outline" className="text-[9px]">{m.domain}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { l: "Uptime", v: `${m.uptime}%` },
                      { l: "P50 Latency", v: `${m.latencyP50}ms` },
                      { l: "Error Rate", v: `${m.errorRate}%` },
                      { l: "Verification", v: `${m.verificationRate}%` },
                    ].map(s => (
                      <div key={s.l} className="rounded-lg bg-secondary/30 p-2">
                        <p className="font-display text-xs font-bold text-foreground">{s.v}</p>
                        <p className="text-[9px] text-muted-foreground">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Trust contribution</span>
                    <Progress value={m.trustContribution} className="h-1 flex-1" />
                    <span className="text-[10px] font-medium text-foreground">{m.trustContribution}%</span>
                  </div>
                </div>
              </div>
            </SitaCard>
          </motion.div>
        ))}
      </div>

      {/* Degradation patterns */}
      <SitaSectionHeader title="Degradation Patterns" subtitle="Recent performance anomalies" />
      <SitaCard hover={false}>
        <div className="space-y-2">
          {[
            { module: "Connector Gateway", pattern: "Latency spikes during peak hours (2-4 PM UTC)", severity: "medium" },
            { module: "Workflow Engine", pattern: "Retry rate increased 2x in last 24h", severity: "high" },
            { module: "Model Router", pattern: "GPT-4 fallback rate at 3% (within SLO)", severity: "low" },
          ].map(d => (
            <div key={d.module} className={cn("flex items-center gap-3 rounded-xl border p-3",
              d.severity === "high" ? "border-accent/20 bg-accent/5" : d.severity === "medium" ? "border-primary/15 bg-primary/5" : "border-border bg-card/50"
            )}>
              <TrendingDown className={cn("h-4 w-4 shrink-0", d.severity === "high" ? "text-accent" : "text-muted-foreground")} />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{d.module}</p>
                <p className="text-[10px] text-muted-foreground">{d.pattern}</p>
              </div>
              <Badge variant="outline" className="text-[9px]">{d.severity}</Badge>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
}
