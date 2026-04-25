import { getString } from "@/lib/types/guards";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { StateBadge } from "@/platform/sita/components/sita/StateBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { fromTable } from "@/lib/supabase-helpers";
import { useUpdateDaemon } from "@/hooks/useUpdateDaemon";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldAlert, RotateCcw, AlertTriangle, CheckCircle, Clock, XCircle,
  ChevronRight, Eye, Play, Pause, Activity, Download, HardDrive
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { cn } from "@/lib/utils";



const RecoveryCenter = () => {
  const { user } = useAuth();
  const ud = useUpdateDaemon();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeTab = (() => {
    if (location.pathname.includes("/updates")) return "updates";
    if (location.pathname.includes("/resolved")) return "resolved";
    if (location.pathname.includes("/failed")) return "failed";
    return "active";
  })();

  const goTo = (key: string) => {
    if (key === "active") navigate("/recovery");
    else navigate(`/recovery/${key}`);
  };

  // Failed/stuck workflow runs
  const { data: failedRuns = [], isLoading } = useQuery({
    queryKey: ["recovery_failed_runs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("workflow_runs")
        .select("*, workflows(name, trigger_event)")
        .in("status", ["failed", "running"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Incidents
  const { data: incidents = [] } = useQuery({
    queryKey: ["recovery_incidents", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("incidents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Steps for selected run
  const { data: steps = [] } = useQuery({
    queryKey: ["recovery_steps", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await fromTable("workflow_steps").select("*").eq("run_id", selectedId!).order("step_index");
      if (error) throw error;
      return data;
    },
  });

  const stuckRuns = (failedRuns as never[]).filter((r: Record<string, any>) => r.status === "running" && Date.now() - new Date(r.started_at).getTime() > 3600000);
  const failedOnly = (failedRuns as never[]).filter((r: Record<string, any>) => r.status === "failed");
  const openIncidents = incidents.filter(i => i.status === "open");
  const resolvedIncidents = incidents.filter(i => i.status === "resolved");

  const allItems = activeTab === "active"
    ? [...stuckRuns, ...failedOnly, ...openIncidents.map(i => ({ ...i, _isIncident: true }))]
    : activeTab === "failed" ? failedOnly
    : resolvedIncidents.map(i => ({ ...i, _isIncident: true }));

  const selected = failedRuns.find(r => r.id === selectedId) || incidents.find(i => i.id === selectedId);

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
<SitaPageHeader
        title="Recovery Center"
        subtitle="Exception handling, failed workflows, stuck processes, and incident management"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Open Incidents" value={openIncidents.length} icon={ShieldAlert} />
        <KPITile label="Failed Workflows" value={failedOnly.length} icon={XCircle} />
        <KPITile label="Stuck (>1h)" value={stuckRuns.length} icon={AlertTriangle} />
        <KPITile label="Resolved" value={resolvedIncidents.length} icon={CheckCircle} />
      </div>

      <SitaTabs
        tabs={[
          { key: "active", label: "Active", count: stuckRuns.length + failedOnly.length + openIncidents.length },
          { key: "failed", label: "Failed", count: failedOnly.length },
          { key: "resolved", label: "Resolved", count: resolvedIncidents.length },
          { key: "updates", label: "Update Recovery", count: ud.rollbackHistory.length },
        ]}
        active={activeTab}
        onChange={goTo}
      />

      {/* Update Recovery Tab */}
      {activeTab === "updates" ? (
        <div className="space-y-4">
          {ud.rollbackHistory.length === 0 && ud.updateHistory.filter(h => h.action === "failed" || h.action === "rolled_back").length === 0 ? (
            <EmptyState icon={CheckCircle} title="No update failures" description="All updates have been applied successfully. No rollbacks recorded." />
          ) : (
            <>
              {/* Failed/Rolled-back Updates */}
              <div className="space-y-3">
                {ud.updateHistory.filter(h => h.action === "failed" || h.action === "rolled_back").map(h => (
                  <SitaCard key={h.id} className="p-4" lane="action">
                    <div className="flex items-start gap-3">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        h.action === "rolled_back" ? "bg-accent/15" : "bg-destructive/15"
                      )}>
                        {h.action === "rolled_back" ? <RotateCcw className="h-4 w-4 text-accent" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold font-mono">{h.fromVersion} → {h.toVersion}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{h.reason}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(h.createdAt).toLocaleString()} · {h.actor}</p>
                      </div>
                      <TrustBadge level="low-confidence" label={h.action.replace("_", " ")} size="sm" />
                    </div>
                  </SitaCard>
                ))}
              </div>

              {/* Rollback Details */}
              {ud.rollbackHistory.map(rb => (
                <SitaCard key={rb.id} className="p-4" hover={false}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                      <HardDrive className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Rollback: Slot {rb.fromSlot} → Slot {rb.toSlot}</p>
                      <p className="text-xs text-muted-foreground">{rb.triggerType.replace("_", " ")} · {rb.reasonCode}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(rb.detectedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {rb.healthResults.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-border pt-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Health Results</p>
                      {rb.healthResults.map(hr => (
                        <div key={hr.component} className="flex items-center justify-between text-xs py-1">
                          <span className="font-mono text-foreground">{hr.component}</span>
                          <span className={hr.status === "pass" ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}>{hr.details}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </SitaCard>
              ))}

              {/* Manual Rollback */}
              {ud.inactiveSlot.healthStatus === "healthy" && (
                <SitaButton variant="danger" className="w-full" onClick={() => ud.manualRollback()}>
                  <RotateCcw className="h-3.5 w-3.5" /> Manual Rollback to {ud.inactiveSlot.version}
                </SitaButton>
              )}

              <SitaButton variant="secondary" className="w-full" onClick={() => navigate("/update-center")}>
                <Download className="h-3.5 w-3.5" /> Open Update Center
              </SitaButton>
            </>
          )}
        </div>
      ) : isLoading ? (
        <SectionSkeleton cards={3} columns={1} />
      ) : allItems.length === 0 ? (
        <EmptyState icon={CheckCircle} title="All clear" description="No failed workflows, stuck processes, or open incidents. Everything is running smoothly." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {allItems.map((item: any, i) => {
              const isIncident = item._isIncident || item.severity;
              const isStuck = !isIncident && item.status === "running";
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <SitaCard
                    selected={selectedId === item.id}
                    onClick={() => setSelectedId(item.id)}
                    lane="action"
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {isIncident ? <ShieldAlert className="h-4 w-4 text-urgency-high mt-0.5 shrink-0" /> : isStuck ? <AlertTriangle className="h-4 w-4 text-urgency-high mt-0.5 shrink-0 animate-pulse" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {isIncident ? item.title : (item.workflows?.name || `Workflow ${item.workflow_id?.slice(0, 8)}`)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isIncident ? `${item.severity} · ${item.source}` : `${isStuck ? "Stuck" : "Failed"} · Step ${item.current_step}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrustBadge level={isStuck ? "low-confidence" : "low-confidence"} label={isIncident ? item.status : isStuck ? "Stuck" : "Failed"} size="sm" />
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </SitaCard>
                </motion.div>
              );
            })}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <SitaCardTitle sub={String(getString(selected, "severity") || getString(selected, "status") || "")}>
                    {String(getString(selected, "title") || getString(selected, "workflows") || "Details")}
                  </SitaCardTitle>
                  <div className="mt-4 space-y-3">
                    {getString(selected, "description") && (
                      <p className="text-xs text-muted-foreground">{String(getString(selected, "description"))}</p>
                    )}
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="text-foreground">{String(getString(selected, "status"))}</span></div>
                    {getString(selected, "affected_service") && (
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Affected</span><span className="text-foreground">{String(getString(selected, "affected_service"))}</span></div>
                    )}
                  </div>
                </SitaCard>

                {steps.length > 0 && (
                  <SitaCard hover={false}>
                    <SitaCardTitle>Execution Steps</SitaCardTitle>
                    <div className="mt-3 space-y-2">
                      {steps.map(step => (
                        <div key={step.id} className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${step.status === "completed" ? "bg-primary" : step.status === "failed" ? "bg-destructive" : "bg-muted-foreground"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{step.action}</p>
                            <p className="text-[10px] text-muted-foreground">{step.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                )}

                <div className="flex gap-2">
                  <SitaButton variant="primary" className="flex-1"><RotateCcw className="h-3.5 w-3.5" /> Retry</SitaButton>
                  <SitaButton variant="danger"><XCircle className="h-3.5 w-3.5" /> Dismiss</SitaButton>
                </div>
              </>
            ) : (
              <EmptyState icon={Eye} title="Select an item" description="Click on a failed workflow or incident to see details and recovery options" />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RecoveryCenter;
