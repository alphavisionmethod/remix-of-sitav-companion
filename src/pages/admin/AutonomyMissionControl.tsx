// ═══════════════════════════════════════════════════════════════
// SITA OS — Autonomy Mission Control (Phase 9 admin)
// Live ops console for the autonomy stack:
//  • per-advisor controller state + breaker status
//  • queue depth + JIT approval list
//  • global kill-switch (resets all breakers)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  CircuitBoard,
  Clock,
  Inbox,
  Power,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import { useAutonomyFleet, resetCircuitBreaker, type FleetAdvisor } from "@/hooks/useAutonomyFleet";
import { AutonomyApprovalQueue } from "@/components/autonomy/AutonomyApprovalQueue";
import {
  runControllersForAdvisors,
  DEFAULT_CONTROLLED_ADVISORS,
} from "@/lib/autonomy/controller";
import { cn } from "@/lib/utils";

const STATE_TONE: Record<string, string> = {
  idle: "bg-muted text-muted-foreground",
  observing: "bg-primary/10 text-primary",
  proposing: "bg-primary/15 text-primary",
  dry_run: "bg-accent/15 text-accent-foreground",
  awaiting_approval: "bg-accent/20 text-accent-foreground",
  executing: "bg-primary text-primary-foreground",
  cooling_down: "bg-muted text-muted-foreground",
  circuit_open: "bg-destructive/15 text-destructive",
};

export default function AutonomyMissionControl() {
  const { advisors, totals, loading, reload } = useAutonomyFleet();
  const [busy, setBusy] = useState(false);

  const triggerCycleNow = async () => {
    setBusy(true);
    try {
      const results = await runControllersForAdvisors(DEFAULT_CONTROLLED_ADVISORS);
      const queued = results.reduce((s, r) => s + r.queued, 0);
      const auto = results.reduce((s, r) => s + r.autoExecuted, 0);
      const trips = results.reduce((s, r) => s + (r.budgetTrips ?? 0), 0);
      toast.success(`Cycle complete — ${queued} queued, ${auto} auto, ${trips} breaker trips`);
      void reload();
    } catch (err) {
      toast.error(`Cycle failed: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  };

  const resetAll = async () => {
    setBusy(true);
    try {
      const tripped = advisors.filter((a) => a.currentState === "circuit_open");
      for (const a of tripped) await resetCircuitBreaker(a.advisorId);
      toast.success(`Reset ${tripped.length} breaker${tripped.length === 1 ? "" : "s"}`);
      void reload();
    } catch (err) {
      toast.error(`Reset failed: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CircuitBoard className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold">Autonomy Mission Control</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Live state of every advisor controller. L3 ceiling: only reversible-safe plans auto-execute.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void reload()} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} /> Refresh
          </Button>
          <Button size="sm" onClick={() => void triggerCycleNow()} disabled={busy}>
            <Zap className="mr-2 h-4 w-4" /> Run cycle now
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => void resetAll()}
            disabled={busy || totals.circuitOpen === 0}
          >
            <Power className="mr-2 h-4 w-4" /> Reset all breakers
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat icon={<Shield className="h-4 w-4" />} label="Advisors" value={totals.totalAdvisors} />
        <Stat icon={<Activity className="h-4 w-4" />} label="In flight" value={totals.inFlight} tone="primary" />
        <Stat icon={<Inbox className="h-4 w-4" />} label="Awaiting approval" value={totals.awaitingApproval} tone="warning" />
        <Stat icon={<AlertOctagon className="h-4 w-4" />} label="Breakers open" value={totals.circuitOpen} tone="destructive" />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Queue depth" value={totals.totalQueued} />
      </section>

      <Tabs defaultValue="fleet" className="w-full">
        <TabsList>
          <TabsTrigger value="fleet">Fleet state</TabsTrigger>
          <TabsTrigger value="approvals">JIT approvals ({totals.awaitingApproval})</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Controller fleet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              )}
              {!loading && advisors.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
                  No advisor controllers have run yet. Click <em>Run cycle now</em> to seed state.
                </div>
              )}
              {!loading &&
                advisors.map((a) => <FleetRow key={a.advisorId} advisor={a} onReset={() => void reload()} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <AutonomyApprovalQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "primary" | "warning" | "destructive";
}) {
  const toneCls =
    tone === "primary"
      ? "text-primary"
      : tone === "warning"
      ? "text-accent"
      : tone === "destructive"
      ? "text-destructive"
      : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">{icon} {label}</span>
        </div>
        <div className={cn("mt-1 text-2xl font-semibold tabular-nums", toneCls)}>{value}</div>
      </CardContent>
    </Card>
  );
}

function FleetRow({ advisor, onReset }: { advisor: FleetAdvisor; onReset: () => void }) {
  const tone = STATE_TONE[advisor.currentState] ?? STATE_TONE.idle;
  const breakerActive =
    advisor.currentState === "circuit_open" &&
    advisor.circuitOpenUntil &&
    new Date(advisor.circuitOpenUntil) > new Date();
  const breakerReason =
    typeof advisor.metadata?.breaker_reason === "string"
      ? (advisor.metadata.breaker_reason as string)
      : null;

  const handleReset = async () => {
    try {
      await resetCircuitBreaker(advisor.advisorId);
      toast.success(`Breaker reset for ${advisor.advisorId}`);
      onReset();
    } catch (err) {
      toast.error(`Reset failed: ${err instanceof Error ? err.message : "unknown"}`);
    }
  };

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{advisor.advisorId}</span>
            <Badge className={cn("text-[10px]", tone)}>{advisor.currentState}</Badge>
            {advisor.queuedCount > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {advisor.queuedCount} queued
              </Badge>
            )}
            {advisor.consecutiveFailures > 0 && (
              <Badge variant="outline" className="border-destructive/50 text-[10px] text-destructive">
                {advisor.consecutiveFailures} fails
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> changed {timeAgo(advisor.lastStateChangeAt)}
            </span>
            {breakerActive && advisor.circuitOpenUntil && (
              <span className="text-destructive">
                breaker resets {timeAgo(advisor.circuitOpenUntil, { future: true })}
              </span>
            )}
            {breakerReason && <span>reason: {breakerReason}</span>}
          </div>
        </div>
        {breakerActive && (
          <Button size="sm" variant="outline" onClick={() => void handleReset()}>
            Reset breaker
          </Button>
        )}
      </div>
      {advisor.awaitingApprovalCount > 0 && (
        <>
          <Separator className="my-3" />
          <AutonomyApprovalQueue advisorId={advisor.advisorId} compact />
        </>
      )}
    </div>
  );
}

function timeAgo(iso: string, opts: { future?: boolean } = {}): string {
  const ms = opts.future ? new Date(iso).getTime() - Date.now() : Date.now() - new Date(iso).getTime();
  const m = Math.floor(Math.abs(ms) / 60_000);
  const prefix = opts.future ? "in " : "";
  if (m < 1) return opts.future ? "soon" : "just now";
  if (m < 60) return `${prefix}${m}m${opts.future ? "" : " ago"}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${prefix}${h}h${opts.future ? "" : " ago"}`;
  return `${prefix}${Math.floor(h / 24)}d${opts.future ? "" : " ago"}`;
}