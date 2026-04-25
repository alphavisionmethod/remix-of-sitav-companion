// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agents Operator Board (Phase 4)
//
// Real, operator-grade view of all 40 internal AI workforce agents.
// Reads internal_agent_definitions LEFT JOIN internal_agent_runtime_state
// and provides drilldown + supervisor controls.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { AITruthDisclosure } from "@/components/primitives/status/AITruthDisclosure";
import { OperatorActionPanel } from "@/components/primitives/actions/OperatorActionPanel";
import { agentStatusTone } from "@/platform/admin/components/admin/ai-runtime/_shared/status-tone-maps";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AIRuntimeDrilldownPanel,
  NightlyProofBadge,
} from "@/platform/admin/components/admin/ai-runtime/AIRuntimeDrilldownPanel";
import {
  loadAllAgentsWithState,
  loadAgentDetail,
  type AgentRuntimeView,
} from "@/lib/internal-agents/runtime/internal-agent-registry";
import {
  suspendAgent,
  resumeAgent,
  downgradeAutonomy,
  triggerAgentRun,
} from "@/lib/internal-agents/runtime/supervisor-actions";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  ShieldAlert,
  TrendingDown,
  Zap,
} from "lucide-react";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";

const COUNCIL_LABEL: Record<string, string> = {
  "product-build": "Product Build",
  "reliability-ops": "Reliability Ops",
  "security-trust": "Security Trust",
  "runtime-cost": "Runtime Cost",
  "architecture-governance": "Architecture",
  "knowledge-coordination": "Knowledge",
};

function relTime(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

export default function InternalAgentsBoard() {
  const qc = useQueryClient();
  const [council, setCouncil] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const { data: agents, isLoading } = useQuery({
    queryKey: ["internal-agents", council],
    queryFn: () => loadAllAgentsWithState(council === "all" ? undefined : { council }),
    refetchInterval: 15_000,
  });

  // Realtime updates on runtime_state
  useEffect(() => {
    const channel = supabase
      .channel("internal-agents-state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "internal_agent_runtime_state" },
        () => qc.invalidateQueries({ queryKey: ["internal-agents"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "internal_agent_definitions" },
        () => qc.invalidateQueries({ queryKey: ["internal-agents"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const filtered = useMemo(() => {
    const all = agents ?? [];
    return all.filter((a) => {
      if (statusFilter !== "all" && a.state?.current_status !== statusFilter) return false;
      if (search && !a.definition.name.toLowerCase().includes(search.toLowerCase()) &&
          !a.definition.agent_id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [agents, statusFilter, search]);

  const counts = useMemo(() => {
    const all = agents ?? [];
    return {
      total: all.length,
      idle: all.filter((a) => a.state?.current_status === "idle").length,
      running: all.filter((a) => a.state?.current_status === "running").length,
      suspended: all.filter((a) => a.state?.current_status === "suspended").length,
      error: all.filter((a) => a.state?.current_status === "error").length,
    };
  }, [agents]);

  return (
    <div className="space-y-3">
      {/* Header strip with nightly proof */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Internal AI workforce — 40 agents · live runtime state
        </p>
        <div className="flex items-center gap-2">
          <AITruthDisclosure mode="live-gateway" to="/admin/ai-runtime" />
          <NightlyProofBadge />
        </div>
      </div>
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <KpiCard icon={<Activity className="h-3.5 w-3.5" />} label="Total" value={counts.total} />
        <KpiCard icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Idle" value={counts.idle} tone="success" />
        <KpiCard icon={<Zap className="h-3.5 w-3.5" />} label="Running" value={counts.running} tone="info" />
        <KpiCard icon={<Pause className="h-3.5 w-3.5" />} label="Suspended" value={counts.suspended} tone="muted" />
        <KpiCard icon={<AlertCircle className="h-3.5 w-3.5" />} label="Error" value={counts.error} tone="danger" />
      </div>

      {/* Filters */}
      <Card className="p-2 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search agent…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 max-w-xs text-xs"
        />
        <Select value={council} onValueChange={setCouncil}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Council" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All councils</SelectItem>
            {Object.entries(COUNCIL_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="cooldown">Cooldown</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {filtered.length} of {agents?.length ?? 0} • Live
        </span>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Agent</TableHead>
              <TableHead className="text-xs">Council</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Autonomy</TableHead>
              <TableHead className="text-xs text-right">Trust</TableHead>
              <TableHead className="text-xs text-right">Runs</TableHead>
              <TableHead className="text-xs text-right">Failures</TableHead>
              <TableHead className="text-xs">Last run</TableHead>
              <TableHead className="text-xs"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <>
                {[0, 1, 2].map((i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={9} className="py-2">
                      <div className="h-4 w-full bg-muted/40 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-2">
                  <EmptyState
                    icon={<ShieldAlert className="h-5 w-5" />}
                    title="No agents match the current filter"
                    description="Adjust the search term or council filter to see agents in another scope. The full registry contains 40 internal agents across 6 councils."
                  />
                  <OperatorActionPanel
                    primary={{ label: "Clear filters", onClick: () => { setSearch(""); setCouncil("all"); setStatusFilter("all"); } }}
                    next={[{ label: "Open Councils", href: "/admin/ai-runtime?tab=councils" }]}
                    evidence={[{ label: "Open Trust Ladder", href: "/admin/ai-runtime?tab=trust-ladder" }]}
                  />
                </TableCell>
              </TableRow>
            )}
            {filtered.map((a) => (
              <AgentRow key={a.definition.agent_id} agent={a} onSelect={() => setSelectedAgentId(a.definition.agent_id)} />
            ))}
          </TableBody>
        </Table>
      </Card>

      <AgentDetailSheet
        agentId={selectedAgentId}
        open={!!selectedAgentId}
        onOpenChange={(o) => !o && setSelectedAgentId(null)}
      />
    </div>
  );
}

function KpiCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone?: "success" | "info" | "muted" | "danger" }) {
  const toneCls = tone === "success" ? "text-[hsl(152_55%_55%)]"
    : tone === "info" ? "text-[hsl(214_85%_60%)]"
    : tone === "muted" ? "text-muted-foreground"
    : tone === "danger" ? "text-destructive"
    : "text-foreground";
  return (
    <Card className="p-2.5">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wide ${tone ? toneCls : "text-muted-foreground"}`}>
        {icon}{label}
      </div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </Card>
  );
}

function AgentRow({ agent, onSelect }: { agent: AgentRuntimeView; onSelect: () => void }) {
  const status = agent.state?.current_status ?? "idle";
  const trust = Number(agent.state?.trust_score ?? 0.5);
  return (
    <TableRow className="cursor-pointer hover:bg-accent/50" onClick={onSelect}>
      <TableCell className="text-xs font-medium">
        <div>{agent.definition.name}</div>
        <div className="text-[10px] text-muted-foreground font-mono">{agent.definition.agent_id}</div>
      </TableCell>
      <TableCell className="text-xs">{COUNCIL_LABEL[agent.definition.council] ?? agent.definition.council}</TableCell>
      <TableCell>
        <StatusBadge tone={agentStatusTone(status)} size="xs">
          {status}
        </StatusBadge>
      </TableCell>
      <TableCell className="text-xs">
        <span className="font-medium">{agent.definition.current_autonomy_level}</span>
        <span className="text-muted-foreground"> / {agent.definition.max_autonomy_level}</span>
      </TableCell>
      <TableCell className="text-xs text-right tabular-nums">{(trust * 100).toFixed(0)}%</TableCell>
      <TableCell className="text-xs text-right tabular-nums">
        {agent.state?.total_successes ?? 0}<span className="text-muted-foreground">/{agent.state?.total_runs ?? 0}</span>
      </TableCell>
      <TableCell className="text-xs text-right tabular-nums">
        {(agent.state?.consecutive_failures ?? 0) > 0 ? (
          <span className="text-destructive">{agent.state?.consecutive_failures}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{relTime(agent.state?.last_run_at ?? null)}</TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="ghost" className="h-6 text-[10px]">Open</Button>
      </TableCell>
    </TableRow>
  );
}

function AgentDetailSheet({
  agentId,
  open,
  onOpenChange,
}: {
  agentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [rationale, setRationale] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["internal-agent-detail", agentId],
    queryFn: () => (agentId ? loadAgentDetail(agentId) : null),
    enabled: !!agentId,
    refetchInterval: 10_000,
  });

  const def = data?.view?.definition;
  const state = data?.view?.state;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["internal-agent-detail", agentId] });
    qc.invalidateQueries({ queryKey: ["internal-agents"] });
  };

  const handleTrigger = async () => {
    if (!def) return;
    try {
      const res = await triggerAgentRun(def.agent_id);
      toast.success(`Triggered ${def.name}`, { description: JSON.stringify(res?.result?.status ?? res) });
      refresh();
    } catch (e) {
      toast.error(`Trigger failed`, { description: e instanceof Error ? e.message : String(e) });
    }
  };

  const handleSuspend = async () => {
    if (!def) return;
    if (!rationale || rationale.length < 10) {
      toast.error("Rationale required (min 10 chars)");
      return;
    }
    try {
      await suspendAgent({
        supervisorKey: def.primary_escalation_target,
        decisionType: "suspend",
        targetAgentId: def.agent_id,
        rationale,
      });
      toast.success(`${def.name} suspended`);
      setRationale("");
      refresh();
    } catch (e) {
      toast.error("Suspend failed", { description: e instanceof Error ? e.message : String(e) });
    }
  };

  const handleResume = async () => {
    if (!def) return;
    try {
      await resumeAgent({
        supervisorKey: def.primary_escalation_target,
        decisionType: "resume",
        targetAgentId: def.agent_id,
        rationale: rationale || "Manual resume by operator",
      });
      toast.success(`${def.name} resumed`);
      refresh();
    } catch (e) {
      toast.error("Resume failed", { description: e instanceof Error ? e.message : String(e) });
    }
  };

  const handleDowngrade = async () => {
    if (!def) return;
    if (!rationale || rationale.length < 10) {
      toast.error("Rationale required (min 10 chars)");
      return;
    }
    try {
      await downgradeAutonomy({
        supervisorKey: def.primary_escalation_target,
        decisionType: "downgrade",
        targetAgentId: def.agent_id,
        rationale,
      });
      toast.success(`${def.name} autonomy downgraded`);
      setRationale("");
      refresh();
    } catch (e) {
      toast.error("Downgrade failed", { description: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">{def?.name ?? "Agent"}</SheetTitle>
          <p className="text-[11px] text-muted-foreground font-mono">{def?.agent_id}</p>
        </SheetHeader>

        {isLoading && (
          <div className="py-6 space-y-2" aria-busy="true">
            <div className="h-4 w-3/4 bg-muted/40 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted/40 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted/40 rounded animate-pulse" />
          </div>
        )}

        {def && (
          <div className="space-y-4 mt-4">
            {/* Mission */}
            <section>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">Mission</p>
              <p className="text-xs">{def.mission}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{def.special_ability}</p>
            </section>

            {/* Runtime state */}
            <section>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">Runtime state</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Stat label="Status" value={state?.current_status ?? "idle"} />
                <Stat label="Autonomy" value={`${def.current_autonomy_level} / ${def.max_autonomy_level}`} />
                <Stat label="Schedule" value={def.schedule_cron} />
                <Stat label="Trust" value={`${((Number(state?.trust_score ?? 0.5)) * 100).toFixed(0)}%`} />
                <Stat label="Runs" value={`${state?.total_successes ?? 0} ok / ${state?.total_runs ?? 0} total`} />
                <Stat label="Consecutive failures" value={String(state?.consecutive_failures ?? 0)} />
                <Stat label="Last run" value={relTime(state?.last_run_at ?? null)} />
                <Stat label="Last success" value={relTime(state?.last_success_at ?? null)} />
              </div>
              {state?.suspension_reason && (
                <Card className="p-2 mt-2 bg-zinc-500/5 border-zinc-500/30">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Suspension reason</p>
                  <p className="text-xs">{state.suspension_reason}</p>
                </Card>
              )}
              {state?.last_error_message && (
                <Card className="p-2 mt-2 bg-destructive/5 border-destructive/30">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Last error</p>
                  <p className="text-xs">{state.last_error_message}</p>
                </Card>
              )}
            </section>

            {/* Operator actions */}
            <section className="space-y-2">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Operator actions</p>
              <Textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Rationale (required for suspend/downgrade, ≥ 10 chars)…"
                className="text-xs h-16"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleTrigger}>
                  <Play className="h-3 w-3 mr-1" /> Run now
                </Button>
                {state?.current_status === "suspended" ? (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleResume}>
                    <Play className="h-3 w-3 mr-1" /> Resume
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSuspend}>
                    <Pause className="h-3 w-3 mr-1" /> Suspend
                  </Button>
                )}
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleDowngrade}>
                  <TrendingDown className="h-3 w-3 mr-1" /> Downgrade autonomy
                </Button>
              </div>
            </section>

            {/* Canonical drilldown — Actions / Budget / Health */}
            <AIRuntimeDrilldownPanel agentId={def.agent_id} userId={user?.id ?? null} />

            {/* Open escalations */}
            {(data?.openEscalations.length ?? 0) > 0 && (
              <section>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-destructive" /> Open escalations
                </p>
                <div className="space-y-1.5">
                  {(data?.openEscalations ?? []).map((e) => (
                    <Card key={e.id} className="p-2 text-[11px] border-destructive/30">
                      <div className="flex items-center justify-between">
                        <StatusBadge tone="danger" size="xs">{e.severity}</StatusBadge>
                        <span className="text-muted-foreground">→ {e.target_supervisor}</span>
                      </div>
                      <p className="mt-1">{e.escalation_reason}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</p>
      <p className="text-xs font-medium tabular-nums">{value}</p>
    </div>
  );
}
