// ═══════════════════════════════════════════════════════════════
// SITA OS — AR03: Self-Healing Execution Board
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import ARSubNav from "@/platform/admin/components/admin/ARSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


export default function AR03SelfHealingBoard() {
  const { data: rules = [] } = useQuery({
    queryKey: ["self-healing-rules"],
    queryFn: async () => {
      const { data } = await fromTable("ai_self_healing_rules").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: healingJobs = [] } = useQuery({
    queryKey: ["self-healing-jobs"],
    queryFn: async () => {
      const { data } = await fromTable("scheduled_jobs").select("*").eq("job_class", "self_heal").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["self-healing-executions"],
    queryFn: async () => {
      const jobIds = healingJobs.map((j: Record<string, any>) => j.id);
      if (jobIds.length === 0) return [];
      const { data } = await fromTable("job_executions").select("*").in("job_id", jobIds).order("started_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: healingJobs.length > 0,
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<ARSubNav />
      <SitaPageHeader
        title="Self-Healing Execution Board"
        subtitle="Inspect actual self-healing behavior — rules, schedules, and execution results"
        actions={<Badge variant="outline" className="text-[10px]"><Heart className="h-3 w-3 mr-1" />{rules.length} rules</Badge>}
      />

      <SitaCard>
        <SitaCardTitle>Self-Healing Rules</SitaCardTitle>
        {rules.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-2">No self-healing rules configured</p>
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Rule</TableHead>
                <TableHead className="text-[10px]">Trigger</TableHead>
                <TableHead className="text-[10px]">Action</TableHead>
                <TableHead className="text-[10px]">Risk</TableHead>
                <TableHead className="text-[10px]">Enabled</TableHead>
                <TableHead className="text-[10px]">Triggers</TableHead>
                <TableHead className="text-[10px]">Last Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((r: Record<string, any>) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-medium">{r.rule_name}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{r.trigger_condition}</TableCell>
                  <TableCell className="text-[10px]">{r.action_type}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">{r.risk_level}</Badge></TableCell>
                  <TableCell>{r.enabled ? <CheckCircle className="h-3 w-3 text-trust-safe" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                  <TableCell className="text-[10px]">{r.total_triggers || 0}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{r.last_triggered_at ? new Date(r.last_triggered_at).toLocaleString() : "Never"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SitaCard>

      <SitaCard>
        <SitaCardTitle>Self-Healing Execution History</SitaCardTitle>
        <div className="space-y-1.5 mt-3 max-h-[300px] overflow-y-auto">
          {executions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No self-healing executions recorded</p>
          ) : (
            executions.map((e: Record<string, any>) => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2">
                {e.status === "success" ? <CheckCircle className="h-3 w-3 text-trust-safe" /> :
                 e.status === "failure" ? <XCircle className="h-3 w-3 text-destructive" /> :
                 <Clock className="h-3 w-3 text-accent" />}
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
