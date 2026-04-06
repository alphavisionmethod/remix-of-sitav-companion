import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { StateBadge, ExecutionState } from "@/components/sita/StateBadge";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const db: any = supabase;
import { useAuth } from "@/contexts/AuthContext";
import { Workflow, CheckCircle2, Clock, AlertTriangle, ChevronRight, Eye, RotateCcw, Shield } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

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
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ["workflow_runs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("workflow_runs").select("*, workflows(name, trigger_event)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: steps = [] } = useQuery({
    queryKey: ["workflow_steps", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await db.from("workflow_steps").select("*").eq("run_id", selectedId!).order("step_index");
      if (error) throw error;
      return data;
    },
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
    <div className="mx-auto max-w-7xl space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="Workflows" subtitle="Actions, approvals, and execution tracking — live from workflow engine" />

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
                        {(run as any).workflows?.name || `Workflow ${run.workflow_id.slice(0, 8)}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Step {run.current_step} · {timeInState(run)} · {(run as any).workflows?.trigger_event || "unknown trigger"}
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
                    {(selected as any).workflows?.name || "Workflow Run"}
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
                  <SitaButton variant="danger"><RotateCcw className="h-3.5 w-3.5" /> Rollback</SitaButton>
                </div>
              </>
            ) : (
              <EmptyState icon={Workflow} title="Select a workflow" description="Click on a workflow run to see execution steps, state, and details" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsCenter;
