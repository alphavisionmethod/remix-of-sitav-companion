import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, CheckCircle, Clock, AlertTriangle, Upload, RefreshCw,
  Zap, Download, Loader2, XCircle, FileSearch, GitBranch, LogIn,
  LifeBuoy, ScrollText, Sparkles, ArrowUpRight, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import {
  useBackgroundJobs,
  useBackgroundJobsRealtime,
  useRetryBackgroundJob,
  useCancelBackgroundJob,
} from "@/hooks/use-background-tasks";
import type {
  BackgroundJobVM,
  BackgroundJobKind,
  BackgroundJobStatus,
} from "@/modules/business/domain/background-tasks/types";

const typeIcons: Record<BackgroundJobKind, React.ElementType> = {
  import: Upload,
  sync: RefreshCw,
  automation: Zap,
  export: Download,
  ingestion: FileSearch,
  workflow: GitBranch,
  recovery: LifeBuoy,
  audit: ScrollText,
  "ai-invocation": Sparkles,
};

const statusConfig: Record<BackgroundJobStatus, { icon: React.ElementType; color: string; bg: string }> = {
  running:   { icon: Loader2,     color: "text-[hsl(var(--sita-purple))]",     bg: "border-[hsl(265_55%_58%/0.15)]" },
  completed: { icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]",      bg: "border-[hsl(var(--trust-safe))]/15" },
  failed:    { icon: XCircle,     color: "text-[hsl(var(--destructive))]",     bg: "border-[hsl(var(--destructive))]/15" },
  cancelled: { icon: XCircle,     color: "text-foreground/40",                 bg: "border-[hsl(0_0%_100%/0.06)]" },
  queued:    { icon: Clock,       color: "text-foreground/30",                 bg: "border-[hsl(0_0%_100%/0.06)]" },
};

type FilterKey = "all" | BackgroundJobStatus;

function formatTime(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleDateString();
}

function formatDuration(ms?: number): string | undefined {
  if (!ms || ms <= 0) return undefined;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem ? `${min}m ${rem}s` : `${min}m`;
}

export default function BackgroundTaskCenter() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const { navigateTo } = useBusinessNavigation();

  const {
    jobs,
    summary,
    partial,
    failedSources,
    isLoading,
    isError,
    error,
    refetch,
    isUnauthenticated,
  } = useBackgroundJobs();
  useBackgroundJobsRealtime();

  const retry = useRetryBackgroundJob();
  const cancel = useCancelBackgroundJob();
  const mutating = retry.isPending || cancel.isPending;

  const filtered = useMemo(
    () => (filter === "all" ? jobs : jobs.filter(j => j.status === filter)),
    [filter, jobs],
  );

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--sita-purple))] to-[hsl(280_50%_45%)] flex items-center justify-center">
            <Activity size={20} className="text-[hsl(0_0%_100%)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Background Tasks</h1>
            <p className="text-[10px] text-foreground/30">
              {summary.running} running · {jobs.length} total
            </p>
          </div>
        </div>
        <PageTruthBanner truthState={partial ? "partial" : undefined} />
      </motion.div>

      {/* Auth required */}
      {isUnauthenticated && (
        <EmptyStateCard
          icon={LogIn}
          title="Sign in to view background tasks"
          description="Live job activity is scoped to your account. Switch to Demo mode to explore the surface with sample data."
          ctaLabel="Open sign-in"
          ctaPath="/auth"
        />
      )}

      {/* Error */}
      {!isUnauthenticated && isError && (
        <EmptyStateCard
          icon={AlertTriangle}
          title="Couldn't load tasks"
          description={error?.message ?? "Something went wrong while reading background jobs."}
          ctaLabel="Retry"
          onAction={() => refetch()}
        />
      )}

      {/* Loading */}
      {!isUnauthenticated && !isError && isLoading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      )}

      {/* Ready */}
      {!isUnauthenticated && !isError && !isLoading && (
        <>
          {partial && failedSources.length > 0 && (
            <div className="rounded-lg border border-[hsl(38_85%_58%/0.25)] bg-[hsl(38_85%_58%/0.06)] p-3 text-[11px] text-foreground/70">
              Some sources failed to load: {failedSources.join(", ")}. Showing partial data.
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            {(["all", "running", "queued", "completed", "failed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-colors",
                  filter === f
                    ? "bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))]"
                    : "text-foreground/30 hover:text-foreground/50 hover:bg-[hsl(0_0%_100%/0.03)]",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {jobs.length === 0 ? (
              <EmptyStateCard
                icon={Activity}
                title="No background activity"
                description="Imports, syncs, automations, and exports will appear here as they run."
              />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-foreground/30 text-xs">No tasks matching filter</div>
            ) : (
              filtered.map((task, idx) => {
                const TypeIcon = typeIcons[task.kind];
                const cfg = statusConfig[task.status];
                const StatusIcon = cfg.icon;
                const duration = formatDuration(task.durationMs);

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx, 10) * 0.03 }}
                    className={cn("rounded-xl border bg-[hsl(0_0%_100%/0.02)] p-4", cfg.bg)}
                  >
                    <div className="flex items-center gap-3">
                      <TypeIcon size={14} className="text-foreground/30 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-medium text-foreground/80 truncate">{task.title}</p>
                          <StatusIcon
                            size={12}
                            className={cn("shrink-0", cfg.color, task.status === "running" && "animate-spin")}
                          />
                        </div>
                        {(task.details || task.error) && (
                          <p className={cn("text-[10px] mt-0.5 truncate", task.error ? "text-[hsl(var(--destructive))]/80" : "text-foreground/35")}>
                            {task.error ?? task.details}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] text-foreground/30">{formatTime(task.startedAt)}</p>
                        {duration && <p className="text-[9px] text-foreground/30">{duration}</p>}
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

                    <div className="mt-2.5 flex items-center gap-2 justify-end">
                      {task.navigationTarget && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-2 text-foreground/60 hover:text-foreground"
                          onClick={() => navigateTo(task.navigationTarget!.module)}
                          aria-label={task.navigationTarget.label}
                          title={task.navigationTarget.label}
                        >
                          {task.navigationTarget.label}
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                      {task.canRetry ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          disabled={mutating}
                          onClick={() => retry.mutate(task)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      ) : task.retryUnavailableReason ? (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 text-[10px] text-foreground/30 px-2 h-6 rounded border border-[hsl(0_0%_100%/0.06)]">
                                <Info className="h-3 w-3" /> No retry
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[220px] text-[10px]">
                              {task.retryUnavailableReason}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                      {task.canCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          disabled={mutating}
                          onClick={() => cancel.mutate(task)}
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
