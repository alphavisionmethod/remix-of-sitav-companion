import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flag, RefreshCw, CheckCircle, AlertTriangle, Eye, Play,
  Pause, RotateCcw, Settings, BarChart3, Shield, Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const POLICIES = [
  { id: "p1", name: "trust-prompt-threshold", status: "active", environment: "production", dryRun: false, value: "0.65", lastChanged: "3d ago", changedBy: "System" },
  { id: "p2", name: "ai-budget-hard-cap", status: "active", environment: "production", dryRun: false, value: "$25/day", lastChanged: "1w ago", changedBy: "Admin" },
  { id: "p3", name: "canary-auto-expand", status: "staged", environment: "staging", dryRun: true, value: "true", lastChanged: "2h ago", changedBy: "AI Optimizer" },
  { id: "p4", name: "sync-retry-max", status: "active", environment: "production", dryRun: false, value: "5", lastChanged: "5d ago", changedBy: "System" },
  { id: "p5", name: "preview-gen-aggressive", status: "draft", environment: "none", dryRun: true, value: "false", lastChanged: "1h ago", changedBy: "AI Cost Optimizer" },
];

const FLAGS = [
  { key: "new-sync-engine", rollout: 25, target: "beta", enabled: true },
  { key: "ai-workspace-restore", rollout: 100, target: "all", enabled: true },
  { key: "mesh-sync-v2", rollout: 10, target: "internal", enabled: true },
  { key: "advanced-conflict-resolution", rollout: 0, target: "none", enabled: false },
];

const MCPoliciesFlags = () => {
  ;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Policies & Flags</h1>
          <p className="text-sm text-muted-foreground mt-1">Policy bundles, feature flags, dry-run simulation, and rollout control</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Policies */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Policy Bundles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {POLICIES.map(pol => (
                <div key={pol.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/10 hover:bg-muted/10 transition-colors group">
                  <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground font-mono">{pol.name}</span>
                      <Badge variant="outline" className={`text-[9px] h-4 ${pol.status === "active" ? "text-emerald-400 border-emerald-500/20" : pol.status === "staged" ? "text-blue-400 border-blue-500/20" : "text-muted-foreground"}`}>
                        {pol.status}
                      </Badge>
                      {pol.dryRun && <Badge variant="outline" className="text-[9px] h-4 text-amber-400 border-amber-500/20">dry-run</Badge>}
                      <Badge variant="outline" className="text-[9px] h-4">{pol.environment}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                      <span>Value: <code className="text-foreground">{pol.value}</code></span>
                      <span>Changed: {pol.lastChanged} by {pol.changedBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Edit</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Simulate</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Flags */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Flag className="h-4 w-4 text-primary" /> Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {FLAGS.map(flag => (
                <div key={flag.key} className="flex items-center gap-3 p-3 rounded-lg border border-border/10 hover:bg-muted/10 transition-colors group">
                  <Flag className={`h-4 w-4 ${flag.enabled ? "text-emerald-400" : "text-muted-foreground"} shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground font-mono">{flag.key}</span>
                      <Badge variant="outline" className={`text-[9px] h-4 ${flag.enabled ? "text-emerald-400 border-emerald-500/20" : "text-muted-foreground"}`}>
                        {flag.enabled ? "enabled" : "disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span>Rollout: {flag.rollout}%</span>
                      <span>Target: {flag.target}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Edit</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-red-400">Kill Switch</Button>
                  </div>
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
                { label: "Edit Draft Policy", icon: Settings },
                { label: "Simulate Policy Impact", icon: BarChart3 },
                { label: "Rollout Flag to 10%", icon: Zap },
                { label: "Kill Switch Feature", icon: Pause },
                { label: "Revert to Previous", icon: RotateCcw },
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

export default MCPoliciesFlags;
