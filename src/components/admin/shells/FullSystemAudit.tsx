import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search, CheckCircle, AlertTriangle, XCircle, Loader2, Shield,
  Wrench, Beaker, FileDown, ChevronDown, ChevronRight,
  Activity, Cloud, HardDrive, Lock, Brain, Rocket, Smartphone,
  Layers, DollarSign, Bell
} from "lucide-react";

interface AuditCheck {
  id: string;
  subsystem: string;
  icon: React.ElementType;
  status: "pass" | "warning" | "fail" | "checking";
  detail: string;
  fixAvailable?: boolean;
  fixLabel?: string;
}

const AUDIT_RESULTS: AuditCheck[] = [
  { id: "ac1", subsystem: "Sync Reliability", icon: Cloud, status: "pass", detail: "99.4% success rate — within SLO" },
  { id: "ac2", subsystem: "Storage Integrity", icon: HardDrive, status: "pass", detail: "All checksums valid. No orphaned blobs" },
  { id: "ac3", subsystem: "Authentication", icon: Lock, status: "pass", detail: "Session health normal. No token anomalies" },
  { id: "ac4", subsystem: "Trust & Security", icon: Shield, status: "warning", detail: "Trust false-positive rate at 4.2% (target: <3%)", fixAvailable: true, fixLabel: "Recalibrate thresholds" },
  { id: "ac5", subsystem: "Release Health", icon: Rocket, status: "pass", detail: "Canary v2.14.0-rc3 stable. No regressions" },
  { id: "ac6", subsystem: "Device Fleet", icon: Smartphone, status: "pass", detail: "All cohorts reporting. No stale devices" },
  { id: "ac7", subsystem: "Workspace Continuity", icon: Layers, status: "pass", detail: "No stuck or orphaned workspaces" },
  { id: "ac8", subsystem: "AI Budget", icon: Brain, status: "warning", detail: "Cost trending 12% above weekly average", fixAvailable: true, fixLabel: "Optimize model routing" },
  { id: "ac9", subsystem: "Queue & Workers", icon: Activity, status: "pass", detail: "No backlog. All workers healthy" },
  { id: "ac10", subsystem: "Incident Risk", icon: AlertTriangle, status: "pass", detail: "No predicted incidents in next 24h" },
  { id: "ac11", subsystem: "Rollback Readiness", icon: Wrench, status: "pass", detail: "All active deployments have rollback points" },
  { id: "ac12", subsystem: "AI Cost Efficiency", icon: DollarSign, status: "pass", detail: "91% efficiency. Cache hit rate optimal" },
];

const STATUS_CFG = {
  pass: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  fail: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  checking: { icon: Loader2, color: "text-primary", bg: "bg-primary/10" },
};

export function FullSystemAudit() {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const runAudit = useCallback(() => {
    setRunning(true);
    setComplete(false);
    setProgress(0);
    const steps = AUDIT_RESULTS.length;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.round((step / steps) * 100));
      if (step >= steps) {
        clearInterval(interval);
        setRunning(false);
        setComplete(true);
      }
    }, 200);
  }, []);

  const passes = AUDIT_RESULTS.filter(c => c.status === "pass").length;
  const warnings = AUDIT_RESULTS.filter(c => c.status === "warning").length;
  const failures = AUDIT_RESULTS.filter(c => c.status === "fail").length;
  const safeFixes = AUDIT_RESULTS.filter(c => c.fixAvailable).length;
  const overallScore = Math.round(((passes + warnings * 0.7) / AUDIT_RESULTS.length) * 100);

  if (!complete) {
    return (
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Full System Audit</h3>
            </div>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={runAudit}
              disabled={running}
            >
              {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
              {running ? "Auditing…" : "Run Full Audit"}
            </Button>
          </div>
          {running && (
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground">
                Checking {Math.round(progress / (100 / AUDIT_RESULTS.length))}/{AUDIT_RESULTS.length} subsystems…
              </p>
            </div>
          )}
          {!running && (
            <p className="text-xs text-muted-foreground">
              Check sync, storage, auth, trust, releases, devices, AI budget, queues, and incident risk in one sweep.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.06] bg-white/[0.03]">
      <CardContent className="p-4 space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">Audit Complete</h3>
          </div>
          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={runAudit}>
            <Search className="h-2.5 w-2.5" /> Re-run
          </Button>
        </div>

        {/* Score + Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-center">
            <p className="text-2xl font-bold text-emerald-400">{overallScore}%</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Overall Score</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-lg font-bold text-foreground">{warnings}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Warnings</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-lg font-bold text-foreground">{safeFixes}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Safe Fixes Available</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-lg font-bold text-foreground">{passes}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Checks Passed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {safeFixes > 0 && (
            <Button size="sm" className="h-7 text-xs gap-1.5">
              <Wrench className="h-3 w-3" /> Fix All Safe Issues ({safeFixes})
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Review Individually
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Beaker className="h-3 w-3" /> Run Deep Simulation
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 ml-auto">
            <FileDown className="h-3 w-3" /> Export Report
          </Button>
        </div>

        {/* Detailed Results */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 pt-2 border-t border-border/10">
                {AUDIT_RESULTS.map(check => {
                  const cfg = STATUS_CFG[check.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={check.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className={cn("p-1.5 rounded", cfg.bg)}>
                        <StatusIcon className={cn("h-3 w-3", cfg.color, check.status === "checking" && "animate-spin")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <check.icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">{check.subsystem}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{check.detail}</p>
                      </div>
                      {check.fixAvailable && (
                        <Button variant="outline" size="sm" className="h-6 text-[9px] px-2 gap-1 shrink-0">
                          <Wrench className="h-2.5 w-2.5" /> {check.fixLabel}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
