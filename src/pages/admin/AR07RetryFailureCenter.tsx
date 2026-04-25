// ═══════════════════════════════════════════════════════════════
// SITA OS — AR07: Retry / Failure / Escalation Center
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, XCircle, RotateCcw, ArrowUpRight } from "lucide-react";
import { getRelation, parseScheduledJobRef } from "@/lib/types/relation-parsers";
import ARSubNav from "@/platform/admin/components/admin/ARSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function AR07RetryFailureCenter() {
  const { data: failures = [] } = useQuery({
    queryKey: ["failed-executions"],
    queryFn: async () => {
      const { data } = await fromTable("job_executions").select("*, scheduled_jobs(name, domain, max_retries)")
        .eq("status", "failure").order("started_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const retryable = failures.filter((f: Record<string, unknown>) => f.retryable);
  const escalated = failures.filter((f: Record<string, unknown>) => f.escalated);
  const deadLetter = failures.filter((f: Record<string, unknown>) => !f.retryable && !f.escalated);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<ARSubNav />
      <SitaPageHeader
        title="Retry / Failure / Escalation Center"
        subtitle="Inspect and manage recurring job failures, retries, and escalations"
        actions={<Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-3 w-3 mr-1" />{failures.length} failures</Badge>}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Retryable", count: retryable.length, icon: RotateCcw, color: "text-accent" },
          { label: "Escalated", count: escalated.length, icon: ArrowUpRight, color: "text-destructive" },
          { label: "Dead Letter", count: deadLetter.length, icon: XCircle, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
            <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <SitaCard>
        <SitaCardTitle>Failure Queue</SitaCardTitle>
        {failures.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-2">No failures recorded — all clear</p>
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Job</TableHead>
                <TableHead className="text-[10px]">Domain</TableHead>
                <TableHead className="text-[10px]">Error</TableHead>
                <TableHead className="text-[10px]">Attempt</TableHead>
                <TableHead className="text-[10px]">Retryable</TableHead>
                <TableHead className="text-[10px]">Escalated</TableHead>
                <TableHead className="text-[10px]">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failures.slice(0, 50).map((f: Record<string, unknown>) => {
                const job = getRelation(f, "scheduled_jobs", parseScheduledJobRef);
                return (
                <TableRow key={String(f.id)}>
                  <TableCell className="text-xs font-medium">{job.name || String(f.job_id ?? "").slice(0, 8)}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[9px]">{job.domain || "—"}</Badge></TableCell>
                  <TableCell className="text-[10px] text-destructive max-w-[200px] truncate">{String(f.error_message || "Unknown")}</TableCell>
                  <TableCell className="text-[10px]">#{String(f.attempt_number)}</TableCell>
                  <TableCell>{f.retryable ? <RotateCcw className="h-3 w-3 text-accent" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                  <TableCell>{f.escalated ? <ArrowUpRight className="h-3 w-3 text-destructive" /> : <span className="text-[10px] text-muted-foreground">No</span>}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{new Date(String(f.started_at)).toLocaleString()}</TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SitaCard>
    </div>
  );
}
