// ═══════════════════════════════════════════════════════════════
// SITA OS — CronStatusPanel (Jarvis Bridge)
// Surfaces the schedule + last run of the daily briefings job
// so operators can see whether proactive intelligence is alive.
// ═══════════════════════════════════════════════════════════════

import { Clock, RefreshCw, CheckCircle2, AlertTriangle, PauseCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { useCronStatus } from "@/lib/sita-jarvis";

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "never";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function CronStatusPanel() {
  const { loading, error, status, refresh } = useCronStatus();

  return (
    <Card data-testid="jarvis-cron-status">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary" /> Briefing schedule
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void refresh()}
          aria-label="Refresh cron status"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {loading && !status ? (
          <Skeleton className="h-16 w-full" />
        ) : error ? (
          <div className="text-xs text-muted-foreground">
            Status unavailable. {error.message}
          </div>
        ) : !status ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <PauseCircle className="h-3.5 w-3.5 mt-0.5" />
            <span>No daily briefing job is scheduled. Proactive briefings will not run automatically.</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Status</span>
              {status.active ? (
                <StatusBadge tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
                  Active
                </StatusBadge>
              ) : (
                <StatusBadge tone="warning" icon={<PauseCircle className="h-3 w-3" />}>
                  Paused
                </StatusBadge>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Schedule</span>
              <code className="text-[11px] font-mono text-foreground">{status.schedule}</code>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Last run</span>
              <span
                className="text-xs"
                title={status.last_run_at ? new Date(status.last_run_at).toLocaleString() : undefined}
              >
                {formatRelative(status.last_run_at)}
              </span>
            </div>
            {status.last_status && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Outcome</span>
                {status.last_status === "succeeded" ? (
                  <StatusBadge tone="success" size="xs">succeeded</StatusBadge>
                ) : (
                  <StatusBadge tone="danger" size="xs" icon={<AlertTriangle className="h-2.5 w-2.5" />}>
                    {status.last_status}
                  </StatusBadge>
                )}
              </div>
            )}
            {status.last_message && status.last_status !== "succeeded" && (
              <div className="rounded-md border border-border/40 bg-muted/30 p-2 text-[11px] text-muted-foreground">
                {status.last_message}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}