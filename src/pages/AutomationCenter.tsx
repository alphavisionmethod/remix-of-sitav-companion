import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/hooks/useAction";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAutomationRules, useDelegations } from "@/hooks/use-domain-data";
import {
  Zap, Shield, Clock, CheckCircle, Eye, Lock, Settings, ArrowRight, Sparkles,
  DollarSign, Briefcase, Home, Mail, Calendar, AlertTriangle, RefreshCw, Pause, Play,
  Plus, ToggleLeft, ToggleRight, Trash2
} from "lucide-react";
import { DEMO_AUTOMATION_RULES, DEMO_DELEGATIONS } from "@/data/fixtures/demo-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";




const AutomationCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user , isDemo} = useAuth();
  const { isDemoMode } = useDataMode();
  const isDemoMode = isDemo;
  const qc = useQueryClient();
  const { data: MOCK_AUTOMATION_RULES = [] } = useAutomationRules();
  const { data: MOCK_DELEGATIONS = [] } = useDelegations();

  const activeTab = (() => {
    if (location.pathname.includes("/trust")) return "trust";
    if (location.pathname.includes("/delegations")) return "delegations";
    return "rules";
  })();

  const goTo = (key: string) => {
  const { isDemo: isDemoMode } = useAuth();
    if (key === "rules") navigate("/automation");
    else navigate(`/automation/${key}`);
  };

  // Live workflows as automation rules
  const { data: liveWorkflows = [] } = useQuery({
    queryKey: ["workflows_automation", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data, error } = await fromTable("workflows").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Live workflow runs for execution stats
  const { data: runs = [] } = useQuery({
    queryKey: ["workflow_runs_stats", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data, error } = await fromTable("workflow_runs").select("status, completed_at").limit(200);
      if (error) throw error;
      return data;
    },
  });

  const toggleWorkflow = useAction("system", "workflow.toggle", {
    successMessage: "Workflow updated",
    invalidateKeys: [["workflows_automation"]],
  });

  const rules = isDemoMode ? MOCK_AUTOMATION_RULES : liveWorkflows.map(w => ({
    id: w.id,
    name: w.name,
    trigger_event: w.trigger_type || "unknown",
    steps: (w.steps ?? []) as Array<{ action?: string }>,
    active: w.active,
    domain: (w.trigger_type || "system").split(".")[0] || "System",
  }));

  const totalRuns = runs.length;
  const completedRuns = runs.filter(r => r.status === "completed").length;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
<SitaPageHeader
        title="Automation Center"
        subtitle="What SITA handles automatically — thresholds, rules, and delegation"
        actions={<SitaButton variant="primary"><Zap className="h-4 w-4" /> New Rule</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Active Rules" value={rules.filter(r => 'active' in r ? r.active : ('enabled' in r ? r.enabled : false)).length} icon={Zap} />
        <KPITile label="Total Runs" value={isDemoMode ? 124 : totalRuns} trend="up" icon={CheckCircle} />
        <KPITile label="Success Rate" value={isDemoMode ? "97.2%" : `${successRate}%`} trend="up" icon={Shield} />
        <KPITile label="Rules" value={rules.length} icon={Settings} />
      </div>

      <SitaTabs
        tabs={[
          { key: "rules", label: "Rules", count: rules.length },
          { key: "delegations", label: "Delegations", count: (isDemoMode ? MOCK_DELEGATIONS : [] as typeof MOCK_DELEGATIONS).length },
          { key: "trust", label: "Trust Levels" },
        ]}
        active={activeTab}
        onChange={goTo}
      />

      {activeTab === "rules" && (
        <div className="space-y-2">
          {rules.length === 0 ? (
            <EmptyState icon={Zap} title="No automation rules" description="Create workflows to automate recurring tasks, approvals, and follow-ups." />
          ) : (
            rules.map((rule) => (
              <SitaCard key={rule.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`rounded-lg p-2 shrink-0 ${rule.active ? "bg-trust-verified/10" : "bg-muted"}`}>
                      {rule.active ? <Play className="h-4 w-4 text-trust-verified" /> : <Pause className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{rule.name}</p>
                        <span className="text-[10px] bg-secondary text-muted-foreground rounded px-1.5 py-px capitalize">{rule.domain}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="text-muted-foreground/70">Trigger:</span> {rule.trigger_event}
                      </p>
                      {rule.steps?.[0] && (
                        <p className="text-xs text-muted-foreground">
                          <span className="text-muted-foreground/70">Action:</span> {rule.steps[0].action || JSON.stringify(rule.steps[0]).slice(0, 60)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrustBadge level={rule.active ? "verified" : "low-confidence"} label={rule.active ? "Active" : "Paused"} size="sm" />
                    {!isDemoMode && (
                      <button
                        onClick={() => toggleWorkflow.mutate({ id: rule.id, active: !rule.active })}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {rule.active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    )}
                  </div>
                </div>
              </SitaCard>
            ))
          )}
        </div>
      )}

      {activeTab === "delegations" && (
        <div className="space-y-2">
          {(isDemoMode ? MOCK_DELEGATIONS : [] as typeof MOCK_DELEGATIONS).map((d, i) => (
            <SitaCard key={i} hover={false} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.threshold}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{d.level}</span>
                  <TrustBadge level={d.approvalNeeded ? "approval" : "verified"} size="sm" />
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      {activeTab === "trust" && (
        <div className="space-y-4">
          <SitaSectionHeader title="Trust Ladder" subtitle="How SITA escalates from observation to full automation" />
          {[
            { level: "Observe", desc: "SITA watches and learns — no actions taken", icon: Eye, trust: "low-confidence" as const },
            { level: "Suggest", desc: "SITA recommends actions — you decide", icon: Sparkles, trust: "review" as const },
            { level: "Simulate", desc: "SITA shows you what would happen before acting", icon: RefreshCw, trust: "review" as const },
            { level: "Approval-Ready", desc: "SITA prepares actions — one click to approve", icon: Shield, trust: "approval" as const },
            { level: "Execute", desc: "SITA acts with guardrails — you get receipts", icon: Zap, trust: "verified" as const },
            { level: "Delegated", desc: "SITA handles it fully — verified and proven safe", icon: CheckCircle, trust: "safe" as const },
          ].map((step, i) => (
            <SitaCard key={i} hover={false} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">{i + 1}</div>
                <div className="rounded-lg bg-secondary p-2"><step.icon className="h-4 w-4 text-foreground" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{step.level}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                <TrustBadge level={step.trust} size="sm" />
              </div>
            </SitaCard>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AutomationCenter;
