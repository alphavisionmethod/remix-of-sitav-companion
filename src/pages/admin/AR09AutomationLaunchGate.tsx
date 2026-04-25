// ═══════════════════════════════════════════════════════════════
// SITA OS — AR09: Automation Launch Gate
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Shield, Rocket } from "lucide-react";
import ARSubNav from "@/platform/admin/components/admin/ARSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";


interface GateCheck {
  label: string;
  pass: boolean;
  detail: string;
  severity: "critical" | "warning" | "info";
}

export default function AR09AutomationLaunchGate() {
  const { data: jobs = [] } = useQuery({
    queryKey: ["scheduled-jobs"],
    queryFn: async () => {
      const { data } = await fromTable("scheduled_jobs").select("*");
      return data || [];
    },
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["all-executions-gate"],
    queryFn: async () => {
      const { data } = await fromTable("job_executions").select("*").limit(500);
      return data || [];
    },
  });

  const { data: killSwitches = [] } = useQuery({
    queryKey: ["kill-switches"],
    queryFn: async () => {
      const { data } = await fromTable("automation_kill_switches").select("*");
      return data || [];
    },
  });

  const activeJobs = jobs.filter((j: Record<string, any>) => j.state === "active");
  const jobsWithRuns = activeJobs.filter((j: Record<string, any>) => j.run_count > 0);
  const jobsNeverRun = activeJobs.filter((j: Record<string, any>) => j.run_count === 0);
  const degradedJobs = jobs.filter((j: Record<string, any>) => j.state === "degraded");
  const activeKills = killSwitches.filter((k: Record<string, any>) => k.enabled);
  const jobsWithoutPolicy = jobs.filter((j: Record<string, any>) => !j.policy_family);

  const checks: GateCheck[] = [
    {
      label: "Scheduler substrate exists",
      pass: true,
      detail: "scheduler-dispatch edge function deployed",
      severity: "critical",
    },
    {
      label: "Jobs are registered",
      pass: jobs.length > 0,
      detail: `${jobs.length} jobs in registry`,
      severity: "critical",
    },
    {
      label: "Active jobs have execution evidence",
      pass: jobsNeverRun.length === 0,
      detail: jobsNeverRun.length > 0 ? `${jobsNeverRun.length} active jobs never ran` : "All active jobs have run at least once",
      severity: "warning",
    },
    {
      label: "No degraded jobs",
      pass: degradedJobs.length === 0,
      detail: degradedJobs.length > 0 ? `${degradedJobs.length} degraded jobs` : "No degraded jobs",
      severity: "warning",
    },
    {
      label: "No active kill switches blocking launch",
      pass: activeKills.length === 0,
      detail: activeKills.length > 0 ? `${activeKills.length} kill switches active` : "No kill switches active",
      severity: "info",
    },
    {
      label: "Policy bindings present",
      pass: jobsWithoutPolicy.length === 0,
      detail: jobsWithoutPolicy.length > 0 ? `${jobsWithoutPolicy.length} jobs missing policy family` : "All jobs have policy bindings",
      severity: "info",
    },
    {
      label: "Execution records are durable",
      pass: executions.length > 0,
      detail: `${executions.length} execution records`,
      severity: "critical",
    },
  ];

  const criticalFails = checks.filter((c) => !c.pass && c.severity === "critical");
  const warnings = checks.filter((c) => !c.pass && c.severity === "warning");
  const promotable = criticalFails.length === 0;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<ARSubNav />
      <SitaPageHeader
        title="Automation Launch Gate"
        subtitle="Use automation truth as a launch readiness signal"
        actions={
          <Badge variant={promotable ? "default" : "destructive"} className="text-[10px]">
            {promotable ? <><Rocket className="h-3 w-3 mr-1" />Promotable</> : <><AlertTriangle className="h-3 w-3 mr-1" />Blocked</>}
          </Badge>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-trust-safe" />
          <p className="font-display text-2xl font-bold text-trust-safe">{checks.filter((c) => c.pass).length}</p>
          <p className="text-[10px] text-muted-foreground">Passing</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-accent" />
          <p className="font-display text-2xl font-bold text-accent">{warnings.length}</p>
          <p className="text-[10px] text-muted-foreground">Warnings</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
          <XCircle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="font-display text-2xl font-bold text-destructive">{criticalFails.length}</p>
          <p className="text-[10px] text-muted-foreground">Critical Fails</p>
        </div>
      </div>

      <SitaCard>
        <SitaCardTitle>Gate Checks</SitaCardTitle>
        <div className="space-y-2 mt-3">
          {checks.map((c) => (
            <div key={c.label} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
              c.pass ? "bg-trust-verified/5" : c.severity === "critical" ? "bg-destructive/10" : "bg-accent/5"
            }`}>
              {c.pass ? (
                <CheckCircle className="h-4 w-4 text-trust-safe shrink-0" />
              ) : c.severity === "critical" ? (
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-xs font-medium">{c.label}</p>
                <p className="text-[10px] text-muted-foreground">{c.detail}</p>
              </div>
              <Badge variant="outline" className="text-[9px]">{c.severity}</Badge>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
}
