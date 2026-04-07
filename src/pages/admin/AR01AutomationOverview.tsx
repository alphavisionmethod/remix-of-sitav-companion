// ═══════════════════════════════════════════════════════════════
// SITA OS — AR01: Automation Reality Overview
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, AlertTriangle, Shield, Clock, CheckCircle, XCircle, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

function useScheduledJobs() {
  return useQuery({
    queryKey: ["scheduled-jobs"],
    queryFn: async () => {
      const { data } = await fromTable("scheduled_jobs").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });
}

function useRecentExecutions() {
  return useQuery({
    queryKey: ["recent-executions"],
    queryFn: async () => {
      const { data } = await fromTable("job_executions").select("*").order("started_at", { ascending: false }).limit(100);
      return data || [];
    },
  });
}

function useKillSwitches() {
  return useQuery({
    queryKey: ["kill-switches"],
    queryFn: async () => {
      const { data } = await fromTable("automation_kill_switches").select("*");
      return data || [];
    },
  });
}

export default function AR01AutomationOverview() {
  const { isDemoMode } = useDataMode();
  const { data: jobs = [] } = useScheduledJobs();
  const { data: executions = [] } = useRecentExecutions();
  const { data: killSwitches = [] } = useKillSwitches();

  const activeJobs = jobs.filter((j: any) => j.state === "active");
  const pausedJobs = jobs.filter((j: any) => j.state === "paused");
  const degradedJobs = jobs.filter((j: any) => j.state === "degraded");
  const blockedJobs = jobs.filter((j: any) => j.state === "blocked");

  const successExecs = executions.filter((e: any) => e.status === "success");
  const failedExecs = executions.filter((e: any) => e.status === "failure");
  const activeKills = killSwitches.filter((k: any) => k.enabled);

  const successRate = executions.length > 0
    ? Math.round((successExecs.length / executions.length) * 100) : 0;

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Activity, color: "text-primary" },
    { label: "Active", value: activeJobs.length, icon: Zap, color: "text-trust-safe" },
    { label: "Paused", value: pausedJobs.length, icon: Pause, color: "text-accent" },
    { label: "Degraded", value: degradedJobs.length, icon: AlertTriangle, color: "text-destructive" },
    { label: "Success Rate", value: `${successRate}%`, icon: CheckCircle, color: "text-trust-safe" },
    { label: "Failures (recent)", value: failedExecs.length, icon: XCircle, color: "text-destructive" },
    { label: "Kill Switches Active", value: activeKills.length, icon: Shield, color: activeKills.length > 0 ? "text-destructive" : "text-muted-foreground" },
  ];

  const domainCounts = jobs.reduce((acc: Record<string, number>, j: any) => {
    acc[j.domain] = (acc[j.domain] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        title="Automation Reality Overview"
        subtitle="Executive view of all scheduled automation, execution health, and safety controls"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
            <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
            <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SitaCard>
          <SitaCardTitle>Domain Automation Heatmap</SitaCardTitle>
          <div className="space-y-2 mt-3">
            {Object.entries(domainCounts).length === 0 ? (
              <p className="text-xs text-muted-foreground">No jobs registered yet</p>
            ) : (
              Object.entries(domainCounts).map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2">
                  <span className="text-xs font-medium text-foreground capitalize">{domain}</span>
                  <Badge variant="secondary" className="text-[10px]">{count as number} jobs</Badge>
                </div>
              ))
            )}
          </div>
        </SitaCard>

        <SitaCard>
          <SitaCardTitle>Recent Execution Stream</SitaCardTitle>
          <div className="space-y-1.5 mt-3 max-h-[250px] overflow-y-auto">
            {executions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No executions recorded yet</p>
            ) : (
              executions.slice(0, 15).map((e: any) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg bg-secondary/10 px-2 py-1.5">
                  {e.status === "success" ? <CheckCircle className="h-3 w-3 text-trust-safe" /> :
                   e.status === "failure" ? <XCircle className="h-3 w-3 text-destructive" /> :
                   <Clock className="h-3 w-3 text-accent" />}
                  <span className="text-[10px] text-foreground flex-1 truncate">{e.job_id?.slice(0, 8)}</span>
                  <span className="text-[10px] text-muted-foreground">{e.duration_ms ? `${e.duration_ms}ms` : "..."}</span>
                </div>
              ))
            )}
          </div>
        </SitaCard>
      </div>

      {blockedJobs.length > 0 && (
        <SitaCard className="border-destructive/30 bg-destructive/5">
          <SitaCardTitle>⚠ Blocked Jobs</SitaCardTitle>
          <div className="space-y-1 mt-2">
            {blockedJobs.map((j: any) => (
              <div key={j.id} className="text-xs text-destructive">{j.name} — {j.domain}</div>
            ))}
          </div>
        </SitaCard>
      )}
    </div>
  );
}
