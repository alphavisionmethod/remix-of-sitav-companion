import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Cloud, RefreshCw, CheckCircle, AlertTriangle, Activity, Zap,
  Clock, BarChart3, Search, TrendingUp, XCircle, Wifi
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const SYNC_METRICS = {
  successRate: 99.2,
  avgLatencyMs: 142,
  activeCheckpoints: 847,
  conflictsOpen: 3,
  retryStormRisk: "low",
  backlogItems: 28,
};

const PLATFORM_SYNC = [
  { platform: "iOS", success: 99.4, latency: 128, conflicts: 1 },
  { platform: "Android", success: 98.9, latency: 156, conflicts: 1 },
  { platform: "macOS", success: 99.7, latency: 98, conflicts: 0 },
  { platform: "Windows", success: 98.2, latency: 187, conflicts: 1 },
  { platform: "Web", success: 99.1, latency: 134, conflicts: 0 },
];

const RECENT_CONFLICTS = [
  { id: "c1", type: "Schema Version", entities: "2 workspaces", time: "12m ago", resolution: "auto-merge" },
  { id: "c2", type: "Concurrent Edit", entities: "1 document", time: "34m ago", resolution: "last-write-wins" },
  { id: "c3", type: "Clock Drift", entities: "1 device", time: "2h ago", resolution: "manual review needed" },
];

const MCSyncCloud = () => {
  ;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Sync Cloud</h1>
          <p className="text-sm text-muted-foreground mt-1">Sync status, conflicts, repair tools, and performance</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Top Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Success Rate", value: `${SYNC_METRICS.successRate}%`, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Avg Latency", value: `${SYNC_METRICS.avgLatencyMs}ms`, icon: Clock, color: "text-primary" },
            { label: "Checkpoints", value: SYNC_METRICS.activeCheckpoints.toLocaleString(), icon: Activity, color: "text-primary" },
            { label: "Open Conflicts", value: String(SYNC_METRICS.conflictsOpen), icon: AlertTriangle, color: SYNC_METRICS.conflictsOpen > 0 ? "text-amber-400" : "text-emerald-400" },
            { label: "Retry Storm", value: SYNC_METRICS.retryStormRisk, icon: Zap, color: "text-emerald-400" },
            { label: "Backlog", value: String(SYNC_METRICS.backlogItems), icon: BarChart3, color: "text-primary" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Wifi className="h-4 w-4 text-primary" /> Platform Sync Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {PLATFORM_SYNC.map(p => (
                  <div key={p.platform} className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                    <p className="text-xs font-medium text-foreground">{p.platform}</p>
                    <p className={`text-lg font-bold mt-1 ${p.success >= 99 ? "text-emerald-400" : "text-amber-400"}`}>{p.success}%</p>
                    <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>{p.latency}ms</span>
                      {p.conflicts > 0 && <Badge variant="outline" className="text-[8px] h-3.5 text-amber-400 border-amber-500/20">{p.conflicts} conflict</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conflicts */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Recent Conflicts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {RECENT_CONFLICTS.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/10 bg-muted/5">
                  <XCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{c.type}</span>
                      <Badge variant="outline" className="text-[9px] h-4">{c.entities}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span>{c.time}</span>
                      <span>· Resolution: {c.resolution}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Resolve</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Optimize Sync", icon: Zap },
                { label: "Force Reindex", icon: RefreshCw },
                { label: "Run Simulation", icon: Activity },
                { label: "Pause Risky Rollout", icon: AlertTriangle },
                { label: "Review Hotspots", icon: Search },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="h-8 text-xs gap-1.5"><a.icon className="h-3 w-3" /> {a.label}</Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MCSyncCloud;
