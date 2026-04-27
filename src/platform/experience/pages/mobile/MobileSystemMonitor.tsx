import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu, HardDrive, Wifi, Shield, Activity, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Smartphone, RefreshCw, Clock, Eye,
  Server, Zap, Database, Globe, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface GaugeData {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: any;
  trend: "up" | "down" | "stable";
  trendValue: string;
  status: "healthy" | "warning" | "critical";
}

interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  online: boolean;
  health: number;
  lastSeen: string;
  syncState: string;
  trustLevel: string;
  updateVersion: string;
}

const gauges: GaugeData[] = [
  { label: "CPU", value: 23, max: 100, unit: "%", icon: Cpu, trend: "down", trendValue: "-4%", status: "healthy" },
  { label: "Memory", value: 61, max: 100, unit: "%", icon: Database, trend: "up", trendValue: "+8%", status: "healthy" },
  { label: "Storage", value: 74, max: 100, unit: "%", icon: HardDrive, trend: "up", trendValue: "+2%", status: "warning" },
  { label: "Network", value: 142, max: 200, unit: "ms", icon: Globe, trend: "stable", trendValue: "0ms", status: "healthy" },
];

const devices: DeviceStatus[] = [
  { id: "d1", name: "MacBook Pro", type: "laptop", online: true, health: 98, lastSeen: "Now", syncState: "Current", trustLevel: "Verified", updateVersion: "v2.4.1" },
  { id: "d2", name: "iPad Air", type: "tablet", online: true, health: 72, lastSeen: "Now", syncState: "Syncing", trustLevel: "Verified", updateVersion: "v2.4.0" },
  { id: "d3", name: "iPhone 15", type: "phone", online: true, health: 95, lastSeen: "Now", syncState: "Current", trustLevel: "Primary", updateVersion: "v2.4.1" },
  { id: "d4", name: "Home Server", type: "server", online: false, health: 0, lastSeen: "2h ago", syncState: "Offline", trustLevel: "Verified", updateVersion: "v2.3.9" },
];

const anomalies = [
  { id: "a1", message: "Tablet-02 memory usage elevated (87%)", severity: "warning", time: "12 min ago" },
  { id: "a2", message: "Home Server unreachable since 7:14 AM", severity: "critical", time: "2 hr ago" },
  { id: "a3", message: "Sync latency spike detected (340ms avg)", severity: "warning", time: "45 min ago" },
];

const statusColors: Record<string, string> = {
  healthy: "text-emerald-400",
  warning: "text-amber-400",
  critical: "text-red-400",
};

const GaugeCard = ({ gauge }: { gauge: GaugeData }) => {
  const Icon = gauge.icon;
  const TrendIcon = gauge.trend === "up" ? TrendingUp : gauge.trend === "down" ? TrendingDown : Activity;
  const pct = Math.round((gauge.value / gauge.max) * 100);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (pct / 100) * circumference;
  const strokeColor = gauge.status === "healthy" ? "stroke-emerald-400" : gauge.status === "warning" ? "stroke-amber-400" : "stroke-red-400";

  return (
    <div className="rounded-xl border border-border/40 bg-card p-3 flex flex-col items-center">
      <div className="relative h-16 w-16 mb-2">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="4" />
          <circle cx="32" cy="32" r="28" fill="none" className={strokeColor} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{gauge.value}<span className="text-[9px] text-muted-foreground">{gauge.unit}</span></span>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[11px] font-medium">{gauge.label}</span>
      </div>
      <div className={cn("flex items-center gap-0.5 text-[9px]", statusColors[gauge.status])}>
        <TrendIcon className="h-2.5 w-2.5" />
        <span>{gauge.trendValue}</span>
      </div>
    </div>
  );
};

const MobileSystemMonitor = () => {
  const [tab, setTab] = useState<"overview" | "devices" | "anomalies">("overview");

  const overallHealth = 89;
  const securityScore = 94;
  const syncHealth = 87;

  return (
    <MobileShell title="System Monitor">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      {/* Overall Health Banner */}
      <div className="rounded-xl border border-border/40 bg-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">System Health</p>
            <p className="text-2xl font-bold text-emerald-400">{overallHealth}%</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center">
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-1">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[9px] text-muted-foreground">Security</p>
              <p className="text-xs font-semibold text-primary">{securityScore}%</p>
            </div>
            <div className="text-center">
              <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-1">
                <RefreshCw className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-[9px] text-muted-foreground">Sync</p>
              <p className="text-xs font-semibold text-emerald-400">{syncHealth}%</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>3 devices online · 1 offline · Last check: 30s ago</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["overview", "devices", "anomalies"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors capitalize",
            tab === t ? "bg-primary/20 text-primary" : "text-muted-foreground"
          )}>
            {t}{t === "anomalies" && ` (${anomalies.length})`}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-2">
          {gauges.map((g) => (
            <motion.div key={g.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <GaugeCard gauge={g} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Devices */}
      {tab === "devices" && (
        <div className="space-y-2">
          {devices.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/40 bg-card p-3"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", d.online ? "bg-emerald-500/15" : "bg-muted")}>
                  {d.type === "laptop" ? <Cpu className={cn("h-4 w-4", d.online ? "text-emerald-400" : "text-muted-foreground")} /> :
                   d.type === "tablet" ? <HardDrive className={cn("h-4 w-4", d.online ? "text-emerald-400" : "text-muted-foreground")} /> :
                   d.type === "phone" ? <Smartphone className={cn("h-4 w-4", d.online ? "text-emerald-400" : "text-muted-foreground")} /> :
                   <Server className={cn("h-4 w-4", d.online ? "text-emerald-400" : "text-muted-foreground")} />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.online ? "Online" : `Last seen ${d.lastSeen}`}</p>
                </div>
                {d.online && <span className="text-xs font-bold text-emerald-400">{d.health}%</span>}
                {!d.online && <span className="text-[10px] text-muted-foreground">Offline</span>}
              </div>
              <div className="flex gap-2 text-[9px]">
                <span className="px-1.5 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">{d.syncState}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">{d.trustLevel}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">{d.updateVersion}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Anomalies */}
      {tab === "anomalies" && (
        <div className="space-y-2">
          {anomalies.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-xl border p-3 flex items-start gap-2.5",
                a.severity === "critical" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"
              )}
            >
              <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", a.severity === "critical" ? "text-red-400" : "text-amber-400")} />
              <div className="flex-1">
                <p className="text-xs font-medium">{a.message}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
              </div>
              <button className="px-2 py-1 rounded-lg text-[10px] font-medium bg-card border border-border/40 hover:bg-muted/50 transition-colors">
                Investigate
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </MobileShell>
  );
};

export default MobileSystemMonitor;
