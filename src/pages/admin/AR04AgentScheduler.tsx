// ═══════════════════════════════════════════════════════════════
// SITA OS — AR04: Agent Scheduler Control Plane
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bot, CheckCircle, XCircle, Clock, AlertTriangle, Zap } from "lucide-react";
import ARSubNav from "@/platform/admin/components/admin/ARSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


export default function AR04AgentScheduler() {
  const { data: agentJobs = [] } = useQuery({
    queryKey: ["agent-scheduled-jobs"],
    queryFn: async () => {
      const { data } = await fromTable("scheduled_jobs").select("*")
        .in("job_class", ["agent_execution", "agent_heartbeat"])
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["agent-executions"],
    queryFn: async () => {
      const jobIds = agentJobs.map((j: Record<string, any>) => j.id);
      if (jobIds.length === 0) return [];
      const { data } = await fromTable("job_executions").select("*").in("job_id", jobIds).order("started_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: agentJobs.length > 0,
  });

  const heartbeats = agentJobs.filter((j: Record<string, any>) => j.job_class === "agent_heartbeat");
  const execJobs = agentJobs.filter((j: Record<string, any>) => j.job_class === "agent_execution");

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<ARSubNav />
      <SitaPageHeader
        title="Agent Scheduler Control Plane"
        subtitle="Recurring agent execution, heartbeats, and runtime health"
        actions={<Badge variant="outline" className="text-[10px]"><Bot className="h-3 w-3 mr-1" />{agentJobs.length} agent jobs</Badge>}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Heartbeat Jobs", count: heartbeats.length, icon: Zap },
          { label: "Execution Jobs", count: execJobs.length, icon: Bot },
          { label: "Recent Runs", count: executions.length, icon: Clock },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
            <s.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="font-display text-2xl font-bold text-foreground">{s.count}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <SitaCard>
        <SitaCardTitle>Agent Jobs</SitaCardTitle>
        {agentJobs.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-2">No agent scheduler jobs registered</p>
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Name</TableHead>
                <TableHead className="text-[10px]">Class</TableHead>
                <TableHead className="text-[10px]">Cadence</TableHead>
                <TableHead className="text-[10px]">State</TableHead>
                <TableHead className="text-[10px]">Last Run</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
                <TableHead className="text-[10px]">Runs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentJobs.map((j: Record<string, any>) => (
                <TableRow key={j.id}>
                  <TableCell className="text-xs font-medium">{j.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[9px]">{j.job_class}</Badge></TableCell>
                  <TableCell className="text-[10px] font-mono">{j.cron_expression}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">{j.state}</Badge></TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{j.last_run_at ? new Date(j.last_run_at).toLocaleString() : "Never"}</TableCell>
                  <TableCell className="text-[10px]">{j.last_run_status || "—"}</TableCell>
                  <TableCell className="text-[10px]">{j.run_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SitaCard>

      <SitaCard>
        <SitaCardTitle>Agent Run Timeline</SitaCardTitle>
        <div className="space-y-1.5 mt-3 max-h-[300px] overflow-y-auto">
          {executions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No agent executions recorded</p>
          ) : (
            executions.map((e: Record<string, any>) => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2">
                {e.status === "success" ? <CheckCircle className="h-3 w-3 text-trust-safe" /> : <XCircle className="h-3 w-3 text-destructive" />}
                <span className="text-[10px] flex-1">{new Date(e.started_at).toLocaleString()}</span>
                <Badge variant="outline" className="text-[9px]">{e.status}</Badge>
                {e.duration_ms && <span className="text-[10px] text-muted-foreground">{e.duration_ms}ms</span>}
              </div>
            ))
          )}
        </div>
      </SitaCard>
    </div>
  );
}
