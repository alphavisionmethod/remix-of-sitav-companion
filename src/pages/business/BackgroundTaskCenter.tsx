import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, CheckCircle, Clock, AlertTriangle, Upload, RefreshCw,
  Zap, Download, Loader2, XCircle, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "@/contexts/DataModeContext";

interface BGTask {
  id: string;
  title: string;
  type: "import" | "sync" | "automation" | "export";
  status: "running" | "completed" | "failed" | "queued";
  progress: number;
  startedAt: string;
  duration?: string;
  details?: string;
}

const DEMO_TASKS: BGTask[] = [
  { id: "1", title: "CSV Import — contacts_q1.csv", type: "import", status: "running", progress: 67, startedAt: "2 min ago", details: "1,340 of 2,000 rows processed" },
  { id: "2", title: "Sync with Google Contacts", type: "sync", status: "running", progress: 45, startedAt: "5 min ago", details: "Syncing 450 records" },
  { id: "3", title: "Automation: Follow-up sequence", type: "automation", status: "completed", progress: 100, startedAt: "15 min ago", duration: "3m 42s", details: "12 emails sent, 0 errors" },
  { id: "4", title: "Pipeline report export", type: "export", status: "completed", progress: 100, startedAt: "1 hour ago", duration: "28s", details: "pipeline_report_q1.pdf" },
  { id: "5", title: "Automation: Lead scoring batch", type: "automation", status: "failed", progress: 34, startedAt: "2 hours ago", duration: "1m 15s", details: "Rate limit exceeded" },
  { id: "6", title: "Import — deals_backfill.xlsx", type: "import", status: "queued", progress: 0, startedAt: "Queued" },
];

const typeIcons: Record<string, React.ElementType> = {
  import: Upload,
  sync: RefreshCw,
  automation: Zap,
  export: Download,
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  running: { icon: Loader2, color: "text-[hsl(var(--sita-purple))]", bg: "border-[hsl(265_55%_58%/0.15)]" },
  completed: { icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]", bg: "border-[hsl(var(--trust-safe))]/15" },
  failed: { icon: XCircle, color: "text-[hsl(var(--destructive))]", bg: "border-[hsl(var(--destructive))]/15" },
  queued: { icon: Clock, color: "text-foreground/30", bg: "border-[hsl(0_0%_100%/0.06)]" },
};

export default function BackgroundTaskCenter() {
  const { isDemoMode } = useDataMode();
  const [filter, setFilter] = useState<"all" | "running" | "completed" | "failed">("all");

  const filtered = DEMO_TASKS.filter(t => filter === "all" || t.status === filter);
  const runningCount = DEMO_TASKS.filter(t => t.status === "running").length;

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--sita-purple))] to-[hsl(280_50%_45%)] flex items-center justify-center">
            <Activity size={20} className="text-[hsl(0_0%_100%)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Background Tasks</h1>
            <p className="text-[10px] text-foreground/30">{runningCount} running · {(isDemoMode ? DEMO_TASKS : [] as typeof DEMO_TASKS).length} total</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-1">
        {(["all", "running", "completed", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-colors",
              filter === f
                ? "bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))]"
                : "text-foreground/30 hover:text-foreground/50 hover:bg-[hsl(0_0%_100%/0.03)]"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task, idx) => {
          const TypeIcon = typeIcons[task.type];
          const cfg = statusConfig[task.status];
          const StatusIcon = cfg.icon;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn("rounded-xl border bg-[hsl(0_0%_100%/0.02)] p-4", cfg.bg)}
            >
              <div className="flex items-center gap-3">
                <TypeIcon size={14} className="text-foreground/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-medium text-foreground/80 truncate">{task.title}</p>
                    <StatusIcon size={12} className={cn("shrink-0", cfg.color, task.status === "running" && "animate-spin")} />
                  </div>
                  {task.details && <p className="text-[10px] text-foreground/35 mt-0.5">{task.details}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] text-foreground/20">{task.startedAt}</p>
                  {task.duration && <p className="text-[9px] text-foreground/30">{task.duration}</p>}
                </div>
              </div>
              {(task.status === "running" || task.status === "queued") && (
                <div className="mt-2.5 w-full h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[hsl(var(--sita-purple))]"
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-foreground/20 text-xs">No tasks matching filter</div>
        )}
      </div>
    </div>
  );
}
