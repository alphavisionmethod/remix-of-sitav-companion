// ═══════════════════════════════════════════════════════════════
// SITA OS — AR02: Scheduled Job Registry
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { SitaPageHeader, SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Zap, Clock, AlertTriangle, Pause, Play, Ban } from "lucide-react";
import ARSubNav from "@/platform/admin/components/admin/ARSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


const stateColors: Record<string, string> = {
  active: "bg-trust-verified/10 text-trust-safe border-trust-verified/20",
  paused: "bg-accent/10 text-accent border-accent/20",
  configured: "bg-secondary/30 text-muted-foreground border-border",
  degraded: "bg-destructive/10 text-destructive border-destructive/20",
  blocked: "bg-destructive/20 text-destructive border-destructive/30",
  draft: "bg-secondary/20 text-muted-foreground border-border",
  retired: "bg-secondary/10 text-muted-foreground/50 border-border/50",
};

const stateIcons: Record<string, any> = {
  active: Zap, paused: Pause, configured: Clock, degraded: AlertTriangle, blocked: Ban, draft: Clock, retired: Ban,
};

export default function AR02ScheduledJobRegistry() {
  const { data: jobs = [] } = useQuery({
    queryKey: ["scheduled-jobs"],
    queryFn: async () => {
      const { data } = await fromTable("scheduled_jobs").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<ARSubNav />
      <SitaPageHeader
        title="Scheduled Job Registry"
        subtitle="Canonical source of truth for all recurring jobs"
        actions={<Badge variant="outline" className="text-[10px]">{jobs.length} registered</Badge>}
      />

      <SitaCard>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No scheduled jobs registered. Seed canonical jobs to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Name</TableHead>
                  <TableHead className="text-[10px]">Domain</TableHead>
                  <TableHead className="text-[10px]">Class</TableHead>
                  <TableHead className="text-[10px]">Cadence</TableHead>
                  <TableHead className="text-[10px]">State</TableHead>
                  <TableHead className="text-[10px]">Risk</TableHead>
                  <TableHead className="text-[10px]">Target</TableHead>
                  <TableHead className="text-[10px]">Last Run</TableHead>
                  <TableHead className="text-[10px]">Runs</TableHead>
                  <TableHead className="text-[10px]">Fails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j: Record<string, any>) => {
                  const StateIcon = stateIcons[j.state] || Clock;
                  return (
                    <TableRow key={j.id}>
                      <TableCell className="text-xs font-medium">{j.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[9px] capitalize">{j.domain}</Badge></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{j.job_class}</TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground">{j.cron_expression}</TableCell>
                      <TableCell>
                        <Badge className={`text-[9px] ${stateColors[j.state] || ""}`}>
                          <StateIcon className="h-2.5 w-2.5 mr-1" />{j.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px]">{j.risk_tier}</TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">{j.target_function}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {j.last_run_at ? new Date(j.last_run_at).toLocaleString() : "Never"}
                      </TableCell>
                      <TableCell className="text-[10px]">{j.run_count}</TableCell>
                      <TableCell className="text-[10px] text-destructive">{j.fail_count}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SitaCard>
    </div>
  );
}
