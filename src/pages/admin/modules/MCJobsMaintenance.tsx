import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wrench, RefreshCw, CheckCircle, AlertTriangle, Clock, Play,
  Pause, RotateCcw, XCircle, BarChart3, Inbox, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const JOBS = [
  { id: "j1", name: "Storage Reconciliation", queue: "maintenance", status: "running", progress: 45, retries: 0, startedAt: "12:04", eta: "~3h" },
  { id: "j2", name: "Orphan Blob Cleanup", queue: "cleanup", status: "queued", progress: 0, retries: 0, startedAt: null, eta: "Starts in 2h" },
  { id: "j3", name: "Schema Migration v2.14", queue: "migration", status: "completed", progress: 100, retries: 0, startedAt: "08:00", eta: "Done" },
  { id: "j4", name: "Reindex User Workspaces", queue: "maintenance", status: "running", progress: 72, retries: 1, startedAt: "10:30", eta: "~45m" },
  { id: "j5", name: "Certificate Rotation", queue: "security", status: "failed", progress: 34, retries: 3, startedAt: "11:15", eta: "Failed" },
  { id: "j6", name: "Analytics Aggregation", queue: "analytics", status: "completed", progress: 100, retries: 0, startedAt: "06:00", eta: "Done" },
  { id: "j7", name: "Push Token Cleanup", queue: "cleanup", status: "queued", progress: 0, retries: 0, startedAt: null, eta: "Starts in 4h" },
  { id: "j8", name: "Sync Checkpoint Prune", queue: "maintenance", status: "stuck", progress: 12, retries: 5, startedAt: "09:00", eta: "Stuck" },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  running: { icon: Loader2, color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  completed: { icon: CheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  queued: { icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted/10 border-border/20" },
  failed: { icon: XCircle, color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
  stuck: { icon: AlertTriangle, color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20" },
};

const MCJobsMaintenance = () => {
  ;

  const running = JOBS.filter(j => j.status === "running").length;
  const stuck = JOBS.filter(j => j.status === "stuck").length;
  const failed = JOBS.filter(j => j.status === "failed").length;
  const queued = JOBS.filter(j => j.status === "queued").length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Jobs & Maintenance</h1>
          <p className="text-sm text-muted-foreground mt-1">Background job queues, retries, and maintenance operations</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Summary */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Running", value: running, icon: Play, color: "text-blue-400" },
            { label: "Queued", value: queued, icon: Clock, color: "text-muted-foreground" },
            { label: "Stuck", value: stuck, icon: AlertTriangle, color: "text-amber-400" },
            { label: "Failed", value: failed, icon: XCircle, color: "text-red-400" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Job List */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> All Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {JOBS.map(job => {
                const config = statusConfig[job.status];
                const StatusIcon = config.icon;
                return (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/10 hover:bg-muted/10 transition-colors group">
                    <StatusIcon className={`h-4 w-4 shrink-0 ${config.color} ${job.status === "running" ? "animate-spin" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{job.name}</span>
                        <Badge variant="outline" className={`text-[9px] h-4 ${config.bgColor}`}>{job.status}</Badge>
                        <Badge variant="outline" className="text-[9px] h-4">{job.queue}</Badge>
                        {job.retries > 0 && <Badge variant="outline" className="text-[9px] h-4 text-amber-400 border-amber-500/20">{job.retries} retries</Badge>}
                      </div>
                      {job.status === "running" || job.status === "stuck" ? (
                        <Progress value={job.progress} className="h-1.5" />
                      ) : null}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{job.eta}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(job.status === "failed" || job.status === "stuck") && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 gap-1"><RotateCcw className="h-2.5 w-2.5" /> Retry</Button>
                      )}
                      {job.status === "running" && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 gap-1"><Pause className="h-2.5 w-2.5" /> Pause</Button>
                      )}
                      {job.status === "queued" && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 gap-1"><XCircle className="h-2.5 w-2.5" /> Cancel</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Retry Failed Jobs", icon: RotateCcw },
                { label: "Cancel Safe Jobs", icon: XCircle },
                { label: "Run Maintenance Now", icon: Wrench },
                { label: "Inspect Dead Letter Queue", icon: Inbox },
                { label: "View Job Analytics", icon: BarChart3 },
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

export default MCJobsMaintenance;
