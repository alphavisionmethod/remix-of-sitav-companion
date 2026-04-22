import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Layers, RefreshCw, CheckCircle, AlertTriangle, Smartphone, Monitor,
  Tablet, ArrowRight, BarChart3, Zap, Clock, XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const WORKSPACE_METRICS = {
  adoption: 78,
  restoreSuccess: 96.2,
  crossDeviceHandoff: 89.1,
  avgRestoreMs: 340,
  activeWorkspaces: 3412,
  failedRestores24h: 14,
};

const FAILURE_REASONS = [
  { reason: "Schema version mismatch", count: 6, percent: 43 },
  { reason: "State serialization timeout", count: 4, percent: 29 },
  { reason: "Cross-device clock drift", count: 2, percent: 14 },
  { reason: "Namespace conflict", count: 2, percent: 14 },
];

const HANDOFF_STATS = [
  { from: "Desktop", to: "Mobile", success: 94, icon: Monitor, toIcon: Smartphone },
  { from: "Mobile", to: "Tablet", success: 91, icon: Smartphone, toIcon: Tablet },
  { from: "Desktop", to: "Tablet", success: 97, icon: Monitor, toIcon: Tablet },
  { from: "Tablet", to: "Mobile", success: 88, icon: Tablet, toIcon: Smartphone },
];

const MCWorkspacesContinuity = () => {
  ;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Workspaces & Continuity</h1>
          <p className="text-sm text-muted-foreground mt-1">Universal state, workspace restore, and cross-device handoff</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Key Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Workspace Adoption", value: `${WORKSPACE_METRICS.adoption}%`, icon: Layers, color: "text-primary" },
            { label: "Restore Success", value: `${WORKSPACE_METRICS.restoreSuccess}%`, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Cross-Device Handoff", value: `${WORKSPACE_METRICS.crossDeviceHandoff}%`, icon: Zap, color: "text-primary" },
            { label: "Avg Restore Time", value: `${WORKSPACE_METRICS.avgRestoreMs}ms`, icon: Clock, color: "text-emerald-400" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cross-Device Handoff */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Cross-Device Handoff</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {HANDOFF_STATS.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/5 border border-border/10">
                    <h.icon className="h-4 w-4 text-muted-foreground" />
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <h.toIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-foreground flex-1">{h.from} → {h.to}</span>
                    <div className="w-20 h-1.5 bg-muted/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${h.success}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${h.success >= 90 ? "text-emerald-400" : "text-amber-400"}`}>{h.success}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Failure Reasons */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Top Failure Reasons (24h)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {FAILURE_REASONS.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <span className="text-xs text-foreground flex-1">{f.reason}</span>
                    <Badge variant="outline" className="text-[9px] h-4">{f.count} failures</Badge>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{f.percent}%</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/10">
                  <p className="text-[10px] text-muted-foreground">Total failed restores: {WORKSPACE_METRICS.failedRestores24h} in last 24h</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Repair Continuity", icon: RefreshCw },
                { label: "Reindex Workspace State", icon: Layers },
                { label: "Simulate Cross-Device Resume", icon: Zap },
                { label: "Disable Problematic Namespace", icon: XCircle },
                { label: "Review State Drift", icon: BarChart3 },
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

export default MCWorkspacesContinuity;
