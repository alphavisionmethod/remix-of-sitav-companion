// ═══════════════════════════════════════════════════════
// SITA OS — V06: Verification Evidence Explorer
// Screenshots, traces, receipts, test logs from real runs
// ═══════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSearch, Image, FileText, Terminal, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";



export default function VerificationEvidenceExplorer() {
  const { isDemoMode } = useDataMode();
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>();

  const { data: runs } = useQuery({
    queryKey: ["v06-verification-runs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("journey_verification_runs")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const { data: steps } = useQuery({
    queryKey: ["v06-run-steps", selectedRunId],
    queryFn: async () => {
      if (!selectedRunId) return [];
      const { data } = await supabase
        .from("journey_step_results")
        .select("*")
        .eq("verification_run_id", selectedRunId)
        .order("step_order", { ascending: true });
      return data || [];
    },
    enabled: !!selectedRunId,
  });

  const selectedRun = (runs || []).find((r: Record<string, any>) => r.id === selectedRunId);

  return (
    <div className="space-y-6 p-6" data-testid="verification-evidence-explorer">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSearch className="h-6 w-6 text-primary" />
          V06 — Evidence Explorer
        </h1>
        <p className="text-muted-foreground mt-1">Browse verification evidence: step results, classifications, proof confidence</p>
      </div>

      <div className="flex gap-3">
        <Select value={selectedRunId || ""} onValueChange={(v) => setSelectedRunId(v || undefined)}>
          <SelectTrigger className="w-96"><SelectValue placeholder="Select a verification run..." /></SelectTrigger>
          <SelectContent>
            {(runs || []).map((r: Record<string, any>) => (
              <SelectItem key={r.id} value={r.id}>
                {r.verification_type || "e2e"} — {r.mode || "real"} — {r.status === "pass" ? "✅" : r.status === "partial" ? "⚠️" : "❌"} — {new Date(r.completed_at || r.created_at).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Run Summary */}
      {selectedRun && (
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant={selectedRun.status === "pass" ? "default" : "destructive"}>
                {selectedRun.status}
              </Badge>
              <Badge variant="outline">{selectedRun.proof_confidence || "unknown"}</Badge>
              <Badge variant="outline">{selectedRun.launch_impact || "—"}</Badge>
              {selectedRun.commit_sha && (
                <span className="text-xs font-mono text-muted-foreground">
                  {selectedRun.commit_sha.slice(0, 7)}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                ✅ {selectedRun.steps_passed || 0} · ❌ {selectedRun.steps_failed || 0} · ⏭ {selectedRun.steps_skipped || 0}
              </span>
              {selectedRun.summary && (
                <span className="text-xs text-muted-foreground">{selectedRun.summary}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedRunId ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Select a verification run to view evidence</CardContent></Card>
      ) : (steps || []).length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No step results for this run</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {(steps || []).map((step: Record<string, any>) => {
            const StatusIcon = step.status === "pass" ? CheckCircle2 : step.status === "skipped" ? AlertTriangle : XCircle;
            const statusColor = step.status === "pass" ? "text-emerald-400" : step.status === "skipped" ? "text-amber-400" : "text-destructive";

            return (
              <Card key={step.id} className="border-border">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${statusColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{step.test_title || `Step ${step.step_order}`}</span>
                        <Badge variant="outline" className="text-[10px]">{step.status}</Badge>
                        {step.failure_class && step.failure_class !== "pass_verified" && (
                          <Badge variant="outline" className="text-[10px] text-destructive">{step.failure_class}</Badge>
                        )}
                        {step.flagship_loop && (
                          <Badge variant="outline" className="text-[10px]">{step.flagship_loop}</Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">{step.duration_ms}ms</span>
                      </div>
                      {step.error_summary && (
                        <pre className="mt-1 text-xs bg-muted/50 p-2 rounded max-h-24 overflow-auto text-destructive/80">
                          {step.error_summary}
                        </pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
