// ═══════════════════════════════════════════════════════════════
// SITA OS — AR05: System Maintenance Board
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, CheckCircle, XCircle, Clock } from "lucide-react";
import ARSubNav from "@/platform/admin/components/admin/ARSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


export default function AR05SystemMaintenanceBoard() {
  const { data: maintenanceJobs = [] } = useQuery({
    queryKey: ["maintenance-jobs"],
    queryFn: async () => {
      const { data } = await fromTable("scheduled_jobs").select("*")
        .in("job_class", ["maintenance", "cleanup", "projection_rebuild", "consistency_check"])
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["maintenance-executions"],
    queryFn: async () => {
      const jobIds = maintenanceJobs.map((j: Record<string, any>) => j.id);
      if (jobIds.length === 0) return [];
      const { data } = await fromTable("job_executions").select("*").in("job_id", jobIds).order("started_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: maintenanceJobs.length > 0,
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<ARSubNav />
      <SitaPageHeader
        title="System Updates & Maintenance"
        subtitle="Inspect maintenance cadences, cleanup runs, and consistency checks"
        actions={<Badge variant="outline" className="text-[10px]"><Wrench className="h-3 w-3 mr-1" />{maintenanceJobs.length} jobs</Badge>}
      />

      <SitaCard>
        <SitaCardTitle>Maintenance Jobs</SitaCardTitle>
        {maintenanceJobs.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-2">No maintenance jobs registered</p>
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Name</TableHead>
                <TableHead className="text-[10px]">Class</TableHead>
                <TableHead className="text-[10px]">Cadence</TableHead>
                <TableHead className="text-[10px]">State</TableHead>
                <TableHead className="text-[10px]">Last Run</TableHead>
                <TableHead className="text-[10px]">Next Run</TableHead>
                <TableHead className="text-[10px]">Runs / Fails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceJobs.map((j: Record<string, any>) => (
                <TableRow key={j.id}>
                  <TableCell className="text-xs font-medium">{j.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[9px]">{j.job_class}</Badge></TableCell>
                  <TableCell className="text-[10px] font-mono">{j.cron_expression}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">{j.state}</Badge></TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{j.last_run_at ? new Date(j.last_run_at).toLocaleString() : "Never"}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{j.next_run_at ? new Date(j.next_run_at).toLocaleString() : "—"}</TableCell>
                  <TableCell className="text-[10px]">{j.run_count} / <span className="text-destructive">{j.fail_count}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SitaCard>

      <SitaCard>
        <SitaCardTitle>Execution History</SitaCardTitle>
        <div className="space-y-1.5 mt-3 max-h-[300px] overflow-y-auto">
          {executions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No maintenance executions recorded</p>
          ) : (
            executions.map((e: Record<string, any>) => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2">
                {e.status === "success" ? <CheckCircle className="h-3 w-3 text-trust-safe" /> :
                 e.status === "failure" ? <XCircle className="h-3 w-3 text-destructive" /> :
                 <Clock className="h-3 w-3 text-accent" />}
                <span className="text-[10px] flex-1">{new Date(e.started_at).toLocaleString()}</span>
                <Badge variant="outline" className="text-[9px]">{e.status}</Badge>
                {e.duration_ms && <span className="text-[10px] text-muted-foreground">{e.duration_ms}ms</span>}
                {e.error_message && <span className="text-[10px] text-destructive truncate max-w-[200px]">{e.error_message}</span>}
              </div>
            ))
          )}
        </div>
      </SitaCard>
    </div>
  );
}
