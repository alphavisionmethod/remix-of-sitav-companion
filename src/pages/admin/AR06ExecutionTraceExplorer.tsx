// ═══════════════════════════════════════════════════════════════
// SITA OS — AR06: Recurring Execution Trace Explorer
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getRelation, parseScheduledJobRef } from "@/lib/types/relation-parsers";
import ARSubNav from "@/platform/admin/components/admin/ARSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function AR06ExecutionTraceExplorer() {
  const [selectedExecId, setSelectedExecId] = useState<string | null>(null);

  const { data: executions = [] } = useQuery({
    queryKey: ["all-executions-trace"],
    queryFn: async () => {
      const { data } = await fromTable("job_executions").select("*, scheduled_jobs(name, domain, job_class, target_function)")
        .order("started_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const selected = executions.find((e: Record<string, unknown>) => e.id === selectedExecId);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<ARSubNav />
      <SitaPageHeader
        title="Execution Trace Explorer"
        subtitle="Inspect any recurring execution from trigger to outcome"
      />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <SitaCard>
            <SitaCardTitle>Executions</SitaCardTitle>
            <div className="space-y-1 mt-3 max-h-[500px] overflow-y-auto">
              {executions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No executions to explore</p>
              ) : (
                executions.map((e: Record<string, unknown>) => {
                  const job = getRelation(e, "scheduled_jobs", parseScheduledJobRef);
                  return (
                  <button key={String(e.id)} onClick={() => setSelectedExecId(String(e.id))}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                      selectedExecId === e.id ? "bg-primary/10 border border-primary/20" : "bg-secondary/10 hover:bg-secondary/20"
                    }`}>
                    {e.status === "success" ? <CheckCircle className="h-3 w-3 text-trust-safe shrink-0" /> :
                     e.status === "failure" ? <XCircle className="h-3 w-3 text-destructive shrink-0" /> :
                     <Clock className="h-3 w-3 text-accent shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium truncate">{job.name || String(e.job_id ?? "").slice(0, 8)}</p>
                      <p className="text-[9px] text-muted-foreground">{new Date(String(e.started_at)).toLocaleString()}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  </button>
                  );
                })
              )}
            </div>
          </SitaCard>
        </div>

        <div className="md:col-span-2">
          {selected ? (() => {
            const selJob = getRelation(selected, "scheduled_jobs", parseScheduledJobRef);
            return (
            <SitaCard>
              <SitaCardTitle>Execution Trace — {selJob.name || String(selected.job_id ?? "").slice(0, 8)}</SitaCardTitle>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Status", value: selected.status },
                    { label: "Triggered By", value: selected.triggered_by },
                    { label: "Mode", value: selected.mode },
                    { label: "Attempt", value: `#${selected.attempt_number}` },
                    { label: "Duration", value: selected.duration_ms ? `${selected.duration_ms}ms` : "—" },
                    { label: "Policy Decision", value: selected.policy_decision || "—" },
                    { label: "Verification", value: selected.verification_result || "—" },
                    { label: "Retryable", value: selected.retryable ? "Yes" : "No" },
                    { label: "Escalated", value: selected.escalated ? "Yes" : "No" },
                    { label: "Domain", value: selJob.domain || "—" },
                    { label: "Job Class", value: selJob.job_class || "—" },
                    { label: "Target", value: selJob.target_function || "—" },
                  ].map((f) => (
                    <div key={f.label} className="rounded-lg bg-secondary/10 px-3 py-2">
                      <p className="text-[9px] text-muted-foreground">{f.label}</p>
                      <p className="text-xs font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>

                {selected.started_at && (
                  <div className="rounded-lg bg-secondary/10 px-3 py-2">
                    <p className="text-[9px] text-muted-foreground">Timeline</p>
                    <p className="text-[10px]">Started: {new Date(selected.started_at).toISOString()}</p>
                    {selected.completed_at && <p className="text-[10px]">Completed: {new Date(selected.completed_at).toISOString()}</p>}
                  </div>
                )}

                {selected.error_message && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                    <p className="text-[9px] text-destructive font-medium">Error</p>
                    <p className="text-[10px] text-destructive">{selected.error_message}</p>
                    {selected.error_class && <Badge variant="destructive" className="text-[9px] mt-1">{selected.error_class}</Badge>}
                  </div>
                )}

                {selected.output && (
                  <div className="rounded-lg bg-secondary/10 px-3 py-2">
                    <p className="text-[9px] text-muted-foreground">Output</p>
                    <pre className="text-[10px] text-foreground mt-1 overflow-x-auto">{JSON.stringify(selected.output, null, 2)}</pre>
                  </div>
                )}
              </div>
            </SitaCard>
            );
          })() : (
            <SitaCard className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select an execution to inspect its trace</p>
              </div>
            </SitaCard>
          )}
        </div>
      </div>
    </div>
  );
}
