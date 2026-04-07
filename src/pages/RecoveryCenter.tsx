import { getString } from "@/lib/types/guards";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldAlert, RotateCcw, AlertTriangle, CheckCircle, Clock, XCircle,
  ChevronRight, Eye, Play, Pause, Activity
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const RecoveryCenter = () => {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeTab = (() => {
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
      const { data, error } = await supabase
        .from("workflow_runs")
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

  const stuckRuns = (failedRuns as never[]).filter((r: any) => r.status === "running" && Date.now() - new Date(r.started_at).getTime() > 3600000);
  const failedOnly = (failedRuns as never[]).filter((r: any) => r.status === "failed");
  const openIncidents = incidents.filter(i => i.status === "open");
  const resolvedIncidents = incidents.filter(i => i.status === "resolved");

  const allItems = activeTab === "active"
    ? [...stuckRuns, ...failedOnly, ...openIncidents.map(i => ({ ...i, _isIncident: true }))]
    : activeTab === "failed" ? failedOnly
    : resolvedIncidents.map(i => ({ ...i, _isIncident: true }));

  const selected = failedRuns.find(r => r.id === selectedId) || incidents.find(i => i.id === selectedId);

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <DemoModeBadge />
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
        ]}
        active={activeTab}
        onChange={goTo}
      />

      {isLoading ? (
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
