import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { StateBadge, ExecutionState } from "@/components/sita/StateBadge";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/hooks/useAction";
import { Workflow, CheckCircle2, Clock, AlertTriangle, ChevronRight, Eye, RotateCcw, Shield, Plus, Trash2 } from "lucide-react";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { DataFreshnessBadge } from "@/components/sita/DataFreshnessBadge";
import { useQueryFreshness } from "@/hooks/use-query-freshness";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

const statusToState = (status: string): ExecutionState => {
  const map: Record<string, ExecutionState> = {
    running: "executing",
    completed: "completed",
    failed: "escalated",
    pending: "queued",
    paused: "approval-requested",
  };
  return (map[status] || "proposed") as ExecutionState;
};

const WorkflowsCenter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { confirmation, confirm } = useConfirmation();
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("manual");

  const runsQuery = useQuery({
    queryKey: ["workflow_runs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("workflow_runs").select("*, workflows(name, trigger_event)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const runs = runsQuery.data ?? [];
  const isLoading = runsQuery.isLoading;
  const freshness = useQueryFreshness(runsQuery);

  const { data: steps = [] } = useQuery({
    queryKey: ["workflow_steps", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await fromTable("workflow_steps").select("*").eq("run_id", selectedId!).order("step_index");
      if (error) throw error;
      return data;
    },
  });

  const createWorkflow = useAction("system", "workflow.create", {
    successMessage: "Workflow created",
    invalidateKeys: [["workflow_runs"]],
    onSuccess: () => { setShowCreate(false); setNewName(""); },
  });

  const deleteRun = useAction("system", "workflow-run.delete", {
    successMessage: "Run deleted",
    invalidateKeys: [["workflow_runs"]],
    onSuccess: () => { setSelectedId(null); },
  });

  const filtered = filter === "all" ? runs : runs.filter(r => r.status === filter);
  const selected = runs.find(r => r.id === selectedId);
  const runningCount = runs.filter(r => r.status === "running").length;
  const completedCount = runs.filter(r => r.status === "completed").length;
  const failedCount = runs.filter(r => r.status === "failed").length;

  // Detect stuck workflows (running > 1 hour)
  const stuckCount = runs.filter(r => {
    if (r.status !== "running") return false;
    return Date.now() - new Date(r.started_at).getTime() > 3600000;
  }).length;

  const timeInState = (run: typeof runs[0]) => {
    const start = new Date(run.started_at).getTime();
    const end = run.completed_at ? new Date(run.completed_at).getTime() : Date.now();
    const mins = Math.floor((end - start) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <PageShell>
    <div className="mx-auto max-w-7xl space-y-6">
<ConfirmationDialog state={confirmation} />
      <SitaPageHeader title="Workflows" subtitle="Actions, approvals, and execution tracking — live from workflow engine"
        actions={<div className="flex items-center gap-3"><DataFreshnessBadge {...freshness} /><SitaButton variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> New Workflow</SitaButton></div>}
      />

      {showCreate && (
        <SitaCard hover={false} glow className="p-5">
          <SitaCardTitle>Create Workflow</SitaCardTitle>
          <div className="mt-3 space-y-3">
            <input className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground" placeholder="Workflow name" value={newName} onChange={e => setNewName(e.target.value)} />
            <select className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground" value={newTrigger} onChange={e => setNewTrigger(e.target.value)}>
              <option value="manual">Manual</option>
              <option value="schedule">Schedule</option>
              <option value="event">Event</option>
              <option value="webhook">Webhook</option>
            </select>
            <div className="flex gap-2">
              <SitaButton variant="primary" onClick={() => createWorkflow.mutate({ name: newName, trigger_type: newTrigger })} disabled={!newName.trim()}>Create</SitaButton>
              <SitaButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</SitaButton>
            </div>
          </div>
        </SitaCard>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Running" value={runningCount} icon={Clock} />
        <KPITile label="Completed" value={completedCount} icon={CheckCircle2} />
        <KPITile label="Failed" value={failedCount} icon={AlertTriangle} />
        <KPITile label="Stuck (>1h)" value={stuckCount} icon={AlertTriangle} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: runs.length },
          { key: "running", label: "Running", count: runningCount },
          { key: "completed", label: "Completed", count: completedCount },
          { key: "failed", label: "Failed", count: failedCount },
          { key: "pending", label: "Pending", count: runs.filter(r => r.status === "pending").length },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {isLoading ? (
        <SectionSkeleton cards={3} columns={1} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Workflow} title="No workflow runs" description="Workflow runs will appear here as SITA executes automated actions. Set up workflows to get started." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            {filtered.map((run) => {
              const isStuck = run.status === "running" && Date.now() - new Date(run.started_at).getTime() > 3600000;
              return (
                <SitaCard
                  key={run.id}
                  onClick={() => setSelectedId(run.id)}
                  selected={selectedId === run.id}
                  lane={isStuck ? "action" : undefined}
                  className="p-4 pl-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <StateBadge state={statusToState(run.status)} size="sm" />
                        {isStuck && <TrustBadge level="low-confidence" label="Stuck" size="sm" />}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {String((run as Record<string, unknown>).workflows && typeof (run as Record<string, unknown>).workflows === "object" ? ((run as Record<string, unknown>).workflows as Record<string, unknown>)?.name : null) || `Workflow ${run.workflow_id.slice(0, 8)}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Step {run.current_step} · {timeInState(run)} · {String((run as Record<string, unknown>).workflows && typeof (run as Record<string, unknown>).workflows === "object" ? ((run as Record<string, unknown>).workflows as Record<string, unknown>)?.trigger_event : null) || "unknown trigger"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                  </div>
                </SitaCard>
              );
            })}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <SitaCardTitle sub={`Status: ${selected.status}`}>
                    {String((selected as Record<string, unknown>).workflows && typeof (selected as Record<string, unknown>).workflows === "object" ? ((selected as Record<string, unknown>).workflows as Record<string, unknown>)?.name : null) || "Workflow Run"}
                  </SitaCardTitle>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">State</span><StateBadge state={statusToState(selected.status)} /></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Current Step</span><span className="text-foreground">{selected.current_step}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time in State</span><span className="text-foreground">{timeInState(selected)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Started</span><span className="text-foreground">{new Date(selected.started_at).toLocaleString()}</span></div>
                    {selected.completed_at && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Completed</span><span className="text-foreground">{new Date(selected.completed_at).toLocaleString()}</span></div>}
                  </div>
                </SitaCard>

                {steps.length > 0 && (
                  <SitaCard hover={false}>
                    <SitaCardTitle>Execution Steps</SitaCardTitle>
                    <div className="mt-3 space-y-2">
                      {steps.map(step => (
                        <div key={step.id} className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${step.status === "completed" ? "bg-primary" : step.status === "failed" ? "bg-destructive" : step.status === "running" ? "bg-accent animate-pulse" : "bg-muted-foreground"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{step.action}</p>
                            <p className="text-[10px] text-muted-foreground">{step.status}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground">#{step.step_index}</span>
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                )}

                <div className="flex gap-2">
                  <SitaButton variant="primary" className="flex-1"><Eye className="h-3.5 w-3.5" /> Inspect</SitaButton>
                  <SitaButton variant="danger" onClick={async () => { if (await confirm({ title: "Delete this run?", description: "This workflow run record will be permanently removed.", variant: "destructive" })) deleteRun.mutate({ id: selected.id }); }}><Trash2 className="h-3.5 w-3.5" /> Delete</SitaButton>
                </div>
              </>
            ) : (
              <EmptyState icon={Workflow} title="Select a workflow" description="Click on a workflow run to see execution steps, state, and details" />
            )}
          </div>
        </div>
      )}
    </div>
    </PageShell>
  );
};

export default WorkflowsCenter;
