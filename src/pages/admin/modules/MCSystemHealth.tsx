import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity, Shield, RefreshCw, CheckCircle, AlertTriangle, XCircle,
  TrendingUp, TrendingDown, Clock, Eye, Bot, Lock, Bell, Layers,
  HardDrive, Zap, Cpu, Settings, Server
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

type HealthState = "healthy" | "degraded" | "unhealthy";
interface Subsystem {
  id: string; name: string; icon: React.ElementType; score: number; state: HealthState;
  trend: "up" | "down" | "stable"; lastIncident: string; latencyP95: string; errorRate: string; description: string;
}

const STATE_CFG: Record<HealthState, { color: string; bg: string; icon: React.ElementType }> = {
  healthy: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle },
  degraded: { color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertTriangle },
  unhealthy: { color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
};
const TREND_CFG: Record<string, { icon: React.ElementType; color: string }> = {
  up: { icon: TrendingUp, color: "text-emerald-400" }, down: { icon: TrendingDown, color: "text-red-400" }, stable: { icon: Activity, color: "text-muted-foreground" },
};

const SUBSYSTEMS: Subsystem[] = [
  { id: "auth", name: "Authentication", icon: Lock, score: 99.8, state: "healthy", trend: "stable", lastIncident: "14 days ago", latencyP95: "45ms", errorRate: "0.01%", description: "Login, token refresh, MFA, device trust" },
  { id: "sync", name: "Sync Service", icon: RefreshCw, score: 97.2, state: "healthy", trend: "up", lastIncident: "3 days ago", latencyP95: "180ms", errorRate: "0.3%", description: "Real-time and background sync across all platforms" },
  { id: "storage", name: "Storage Service", icon: HardDrive, score: 99.5, state: "healthy", trend: "stable", lastIncident: "21 days ago", latencyP95: "95ms", errorRate: "0.02%", description: "Blob storage, metadata, lifecycle, archival" },
  { id: "devices", name: "Device Registry", icon: Cpu, score: 99.9, state: "healthy", trend: "stable", lastIncident: "30+ days ago", latencyP95: "12ms", errorRate: "0.00%", description: "Device enrollment, trust, capabilities, mesh" },
  { id: "trust", name: "Trust Engine", icon: Shield, score: 96.8, state: "healthy", trend: "up", lastIncident: "5 days ago", latencyP95: "35ms", errorRate: "0.1%", description: "Risk scoring, behavioral analysis, anomaly detection" },
  { id: "ai-router", name: "AI Router", icon: Bot, score: 94.5, state: "degraded", trend: "down", lastIncident: "1 hour ago", latencyP95: "2400ms", errorRate: "1.2%", description: "Model selection, budget gating, inference routing" },
  { id: "releases", name: "Release Service", icon: Layers, score: 99.1, state: "healthy", trend: "stable", lastIncident: "7 days ago", latencyP95: "28ms", errorRate: "0.00%", description: "Canary management, rollout, rollback" },
  { id: "notifications", name: "Notifications", icon: Bell, score: 98.7, state: "healthy", trend: "stable", lastIncident: "12 days ago", latencyP95: "120ms", errorRate: "0.05%", description: "Push, in-app, email delivery pipeline" },
  { id: "admin", name: "Admin Platform", icon: Server, score: 99.6, state: "healthy", trend: "stable", lastIncident: "30+ days ago", latencyP95: "55ms", errorRate: "0.01%", description: "Admin BFF, command execution, governance" },
  { id: "automation", name: "Automation Engine", icon: Zap, score: 97.8, state: "healthy", trend: "up", lastIncident: "4 days ago", latencyP95: "340ms", errorRate: "0.2%", description: "Scheduled tasks, triggers, workflows" },
];

export default function MCSystemHealth() {
  ;
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const overallScore = Math.round(SUBSYSTEMS.reduce((s, sub) => s + sub.score, 0) / SUBSYSTEMS.length * 10) / 10;
  const healthyCount = SUBSYSTEMS.filter(s => s.state === "healthy").length;
  const degradedCount = SUBSYSTEMS.filter(s => s.state === "degraded").length;
  const selected = SUBSYSTEMS.find(s => s.id === selectedId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-400" /> System Health</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete subsystem health with scores, trends, and drill-down diagnostics</p>
      </div>

      {/* Overall hero */}
      <div className="rounded-2xl border border-border/30 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Platform Health</p>
            <div className="flex items-baseline gap-3">
              <span className={cn("text-5xl font-display font-bold", overallScore >= 98 ? "text-emerald-400" : overallScore >= 95 ? "text-amber-400" : "text-red-400")}>{overallScore}%</span>
              <Badge variant="outline" className={cn("text-xs", degradedCount === 0 ? "text-emerald-400 border-emerald-500/20" : "text-amber-400 border-amber-500/20")}>{degradedCount === 0 ? "All Systems Operational" : `${degradedCount} Degraded`}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-display font-bold text-emerald-400">{healthyCount}</p><p className="text-[10px] text-muted-foreground">Healthy</p></div>
            <div><p className="text-2xl font-display font-bold text-amber-400">{degradedCount}</p><p className="text-[10px] text-muted-foreground">Degraded</p></div>
            <div><p className="text-2xl font-display font-bold text-foreground">{SUBSYSTEMS.length}</p><p className="text-[10px] text-muted-foreground">Total</p></div>
          </div>
        </div>
        <Progress value={overallScore} className="h-2" />
      </div>

      {/* Grid + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUBSYSTEMS.map((sub, i) => {
            const stateCfg = STATE_CFG[sub.state]; const trendCfg = TREND_CFG[sub.trend];
            const StateIcon = stateCfg.icon; const TrendIcon = trendCfg.icon;
            return (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelectedId(sub.id)}
                className={cn("rounded-xl border p-4 cursor-pointer transition-all", selectedId === sub.id ? "bg-white/[0.05] border-primary/30 ring-1 ring-primary/10" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><sub.icon className="h-4 w-4 text-muted-foreground" /><h4 className="text-sm font-semibold text-foreground">{sub.name}</h4></div>
                  <div className={cn("rounded-full p-1", stateCfg.bg)}><StateIcon className={cn("h-3 w-3", stateCfg.color)} /></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1"><span className={cn("text-xl font-display font-bold", sub.score >= 98 ? "text-emerald-400" : sub.score >= 95 ? "text-amber-400" : "text-red-400")}>{sub.score}%</span><TrendIcon className={cn("h-3 w-3", trendCfg.color)} /></div>
                  <div className="text-right text-[9px] text-muted-foreground"><div>P95: {sub.latencyP95}</div><div>Err: {sub.errorRate}</div></div>
                </div>
                <div className="mt-2"><Progress value={sub.score} className="h-1" /></div>
              </motion.div>
            );
          })}
        </div>
        <div>
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border/30 bg-white/[0.02] p-5 sticky top-6 space-y-4">
              <div className="flex items-center gap-2"><selected.icon className="h-5 w-5 text-muted-foreground" /><h3 className="text-base font-semibold text-foreground">{selected.name}</h3><Badge variant="outline" className={cn("text-[9px]", STATE_CFG[selected.state].color)}>{selected.state}</Badge></div>
              <p className="text-xs text-muted-foreground">{selected.description}</p>
              <div className="space-y-3">
                {[
                  { label: "Health Score", value: `${selected.score}%`, color: selected.score >= 98 ? "text-emerald-400" : "text-amber-400" },
                  { label: "P95 Latency", value: selected.latencyP95, color: "text-foreground" },
                  { label: "Error Rate", value: selected.errorRate, color: parseFloat(selected.errorRate) > 0.5 ? "text-amber-400" : "text-emerald-400" },
                  { label: "Last Incident", value: selected.lastIncident, color: "text-muted-foreground" },
                  { label: "Trend", value: selected.trend, color: TREND_CFG[selected.trend].color },
                ].map(row => (<div key={row.label} className="flex items-center justify-between text-xs border-b border-white/[0.04] pb-2"><span className="text-muted-foreground">{row.label}</span><span className={cn("font-medium", row.color)}>{row.value}</span></div>))}
              </div>
              <div className="flex gap-2 pt-2"><Button size="sm" variant="outline" className="gap-1 text-xs flex-1"><Eye className="h-3 w-3" />Drill Down</Button><Button size="sm" variant="outline" className="gap-1 text-xs flex-1"><RefreshCw className="h-3 w-3" />Refresh</Button></div>
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/30 bg-white/[0.01] p-8 text-center"><Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Select a subsystem to inspect</p></div>
          )}
        </div>
      </div>
    </div>
  );
}