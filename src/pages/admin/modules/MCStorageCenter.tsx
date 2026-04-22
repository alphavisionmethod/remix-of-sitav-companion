import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  HardDrive, Database, Archive, AlertTriangle, CheckCircle, RefreshCw,
  TrendingUp, Search, Trash2, FileWarning, Clock, BarChart3, Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const STORAGE_METRICS = {
  totalUsedGB: 847,
  totalCapacityGB: 2048,
  growthPercent: 3.2,
  orphanedBlobsMB: 124,
  checksumMismatches: 2,
  archiveRestoreQueue: 3,
  uploadFinalizeHealth: 99.4,
  quotaDriftAlerts: 1,
};

const STORAGE_BREAKDOWN = [
  { segment: "Business Documents", sizeGB: 312, percent: 37, color: "bg-primary" },
  { segment: "Media & Attachments", sizeGB: 245, percent: 29, color: "bg-blue-500" },
  { segment: "Backups & Snapshots", sizeGB: 156, percent: 18, color: "bg-amber-500" },
  { segment: "User Uploads", sizeGB: 89, percent: 11, color: "bg-emerald-500" },
  { segment: "System & Cache", sizeGB: 45, percent: 5, color: "bg-muted-foreground" },
];

const LIFECYCLE_JOBS = [
  { id: "lj1", name: "Cold Storage Migration", status: "running", progress: 67, eta: "~2h remaining" },
  { id: "lj2", name: "Orphan Blob Cleanup", status: "queued", progress: 0, eta: "Starts in 4h" },
  { id: "lj3", name: "Checksum Verification", status: "completed", progress: 100, eta: "Completed 1h ago" },
  { id: "lj4", name: "Preview Regeneration", status: "running", progress: 34, eta: "~5h remaining" },
];

const MCStorageCenter = () => {
  ;
  const usagePercent = (STORAGE_METRICS.totalUsedGB / STORAGE_METRICS.totalCapacityGB) * 100;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Storage</h1>
          <p className="text-sm text-muted-foreground mt-1">Blob/object storage health, lifecycle, and integrity</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Top Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Used", value: `${STORAGE_METRICS.totalUsedGB} GB`, sub: `of ${STORAGE_METRICS.totalCapacityGB} GB`, icon: HardDrive, color: "text-primary" },
            { label: "Growth Rate", value: `+${STORAGE_METRICS.growthPercent}%`, sub: "this month", icon: TrendingUp, color: "text-emerald-400" },
            { label: "Orphaned Blobs", value: `${STORAGE_METRICS.orphanedBlobsMB} MB`, sub: "awaiting cleanup", icon: Trash2, color: "text-amber-400" },
            { label: "Upload Health", value: `${STORAGE_METRICS.uploadFinalizeHealth}%`, sub: "finalize success", icon: CheckCircle, color: "text-emerald-400" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Usage Bar */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">{STORAGE_METRICS.totalUsedGB} GB used</span>
                  <span className="text-muted-foreground">{STORAGE_METRICS.totalCapacityGB} GB total</span>
                </div>
                <Progress value={usagePercent} className="h-3" />
              </div>
              <div className="space-y-2">
                {STORAGE_BREAKDOWN.map(seg => (
                  <div key={seg.segment} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${seg.color} shrink-0`} />
                    <span className="text-xs text-foreground flex-1">{seg.segment}</span>
                    <span className="text-xs text-muted-foreground">{seg.sizeGB} GB</span>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{seg.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lifecycle Jobs */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Archive className="h-4 w-4 text-primary" /> Lifecycle Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {LIFECYCLE_JOBS.map(job => (
                  <div key={job.id} className="p-3 rounded-lg border border-border/10 bg-muted/5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground">{job.name}</span>
                      <Badge variant="outline" className={`text-[9px] h-4 ${job.status === "completed" ? "text-emerald-400 border-emerald-500/20" : job.status === "running" ? "text-blue-400 border-blue-500/20" : "text-muted-foreground"}`}>
                        {job.status}
                      </Badge>
                    </div>
                    <Progress value={job.progress} className="h-1.5 mb-1" />
                    <span className="text-[10px] text-muted-foreground">{job.eta}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Integrity Alerts */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Integrity & Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Checksum Mismatches", value: STORAGE_METRICS.checksumMismatches, severity: STORAGE_METRICS.checksumMismatches > 0 ? "warning" : "ok", detail: "2 blobs have hash drift — auto-repair queued" },
                  { label: "Quota Drift", value: STORAGE_METRICS.quotaDriftAlerts, severity: STORAGE_METRICS.quotaDriftAlerts > 0 ? "warning" : "ok", detail: "1 org approaching 95% quota" },
                  { label: "Archive Restore Queue", value: STORAGE_METRICS.archiveRestoreQueue, severity: "info", detail: "3 restore requests pending from cold tier" },
                ].map(alert => (
                  <div key={alert.label} className="p-3 rounded-lg border border-border/10 bg-muted/5 flex items-start gap-3">
                    {alert.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> : <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{alert.label}</span>
                        <Badge variant="outline" className="text-[9px] h-4">{alert.value}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{alert.detail}</p>
                    </div>
                  </div>
                ))}
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
                { label: "Run Reconciliation", icon: RefreshCw },
                { label: "Verify Integrity", icon: Shield },
                { label: "Pause Archive Jobs", icon: Clock },
                { label: "Repair Metadata Drift", icon: FileWarning },
                { label: "Inspect Cost Drivers", icon: BarChart3 },
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

export default MCStorageCenter;
