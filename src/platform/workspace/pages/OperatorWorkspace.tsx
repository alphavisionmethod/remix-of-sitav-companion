// ═══════════════════════════════════════════════════════════════
// SITA OS — Operator Workspace (Dual-Reality View)
// Full operational view: all domains, no redaction, full detail,
// operational actions (execute/retry/rollback/replay/triage).
// Consumes WorkspaceViewEngine with operator filter.
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceView, useMetaGovernanceBoardroom } from "@/platform/governance/hooks/use-meta-governance";
import { TrustDebtPanel, ExecutionDebtHeatmap, DragIndexRadar, ReadinessGauge, DelegationRegistryTable } from "@/platform/governance/components/governance";
import { motion } from "framer-motion";
import { Wrench, AlertTriangle, Shield, CheckCircle, Activity, Eye, Unlock, Bell, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { GovernanceBoardroomSection } from "@/packages/contracts";
import type { ReadinessInput } from "@/domains/engines/readiness-engine";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const DEFAULT_READINESS_INPUT: ReadinessInput = {
  proofCompleteness: { rate: 0.85, evidence: ["proof-chain audit"] },
  replaySafety: { rate: 0.78, evidence: ["replay coverage scan"] },
  rollbackReadiness: { rate: 0.72, evidence: ["rollback test results"] },
  policyMaturity: { score: 0.80, evidence: ["policy rule count"] },
  errorRate: { rate: 0.04, evidence: ["30-day error log"] },
  approvalBehavior: { autoApprovalRate: 0.35, evidence: ["approval history"] },
  connectorStability: { uptimeRate: 0.97, evidence: ["connector health monitor"] },
  observabilityQuality: { coverage: 0.82, evidence: ["SLO coverage report"] },
  supportBurden: { ticketRate: 0.12, evidence: ["support ticket volume"] },
  confidenceQuality: { avgConfidence: 0.88, evidence: ["confidence calibration"] },
};

const DEFAULT_SCOPE = { ownerId: "operator-user", visibility: "private" as const };

const OperatorSectionCard = ({ section }: { section: GovernanceBoardroomSection }) => {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
<SitaCard
        onClick={() => navigate(section.drilldownRoute)}
        className={cn(
          "space-y-3",
          section.severity === "critical" && "border-urgency-critical/30",
          section.severity === "warning" && "border-accent/30"
        )}
      >
        <div className="flex items-center justify-between">
          <SitaCardTitle>
            <span className="flex items-center gap-2">
              {section.severity === "critical" ? <AlertTriangle className="h-4 w-4 text-urgency-critical" /> :
               section.severity === "warning" ? <Shield className="h-4 w-4 text-accent" /> :
               <CheckCircle className="h-4 w-4 text-trust-safe" />}
              {section.title}
            </span>
          </SitaCardTitle>
          <Badge variant="outline" className={cn(
            "text-[10px]",
            section.severity === "critical" ? "border-urgency-critical/40 text-urgency-critical" :
            section.severity === "warning" ? "border-accent/40 text-accent" :
            "border-trust-safe/40 text-trust-safe"
          )}>
            {section.severity}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{section.summary}</p>
        <div className="flex flex-wrap gap-3">
          {section.metrics.map((m, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        {section.actionItems.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-border">
            {section.actionItems.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Zap className={cn(
                  "h-3 w-3 shrink-0",
                  a.priority === "high" ? "text-urgency-high" : "text-accent"
                )} />
                <span className="text-muted-foreground">{a.description}</span>
              </div>
            ))}
          </div>
        )}
      </SitaCard>
    </motion.div>
  );
};

export default function OperatorWorkspace() {
  const { filter, pendingHandoffs, activeEscalations } = useWorkspaceView("operator");
  const boardroomSections = useMetaGovernanceBoardroom(DEFAULT_SCOPE);

  const criticalSections = boardroomSections.filter(s => s.severity === "critical");

  return (
    <div className="space-y-6 pb-8">
      <SitaPageHeader
        title="Operator Workspace"
        subtitle="Full operational view — all domains, no redaction, complete detail with execution controls"
      />

      {/* Operator status bar */}
      <div className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
        <Activity className="h-4 w-4 text-accent" />
        <span className="text-xs text-muted-foreground">
          View: <span className="text-foreground font-medium">{filter.explanationDepth}</span> •
          Detail: <span className="text-foreground font-medium">{filter.maxDetailLevel}</span> •
          Domains: <span className="text-foreground font-medium">{filter.visibleDomains.length}</span> •
          Actions: <span className="text-foreground font-medium">{filter.authorityActions.length}</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          {pendingHandoffs.length > 0 && (
            <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">
              <Bell className="h-3 w-3 mr-1" />{pendingHandoffs.length} handoffs
            </Badge>
          )}
          {activeEscalations.length > 0 && (
            <Badge variant="outline" className="text-[10px] border-urgency-critical/40 text-urgency-critical">
              <AlertTriangle className="h-3 w-3 mr-1" />{activeEscalations.length} escalations
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px]">
            <Unlock className="h-3 w-3 mr-1" />Operator
          </Badge>
        </div>
      </div>

      {/* Critical: immediate action */}
      {criticalSections.length > 0 && (
        <>
          <SitaSectionHeader title="Critical — Immediate Action" subtitle={`${criticalSections.length} systems`} />
          <div className="grid gap-4 md:grid-cols-2">
            {criticalSections.map(s => <OperatorSectionCard key={s.systemId} section={s} />)}
          </div>
        </>
      )}

      {/* Execution health */}
      <SitaSectionHeader title="Execution Health" />
      <div className="grid gap-4 lg:grid-cols-2">
        <ExecutionDebtHeatmap />
        <DragIndexRadar entityScope={DEFAULT_SCOPE} />
      </div>

      {/* Trust + Readiness */}
      <SitaSectionHeader title="Trust & Readiness" />
      <div className="grid gap-4 lg:grid-cols-2">
        <TrustDebtPanel />
        <ReadinessGauge input={DEFAULT_READINESS_INPUT} entityScope={DEFAULT_SCOPE} />
      </div>

      {/* Full system sections */}
      <SitaSectionHeader title="All Governance Systems" subtitle={`${boardroomSections.length} systems`} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {boardroomSections.map(s => <OperatorSectionCard key={s.systemId} section={s} />)}
      </div>

      {/* Delegation */}
      <SitaSectionHeader title="Delegation Registry" />
      <DelegationRegistryTable />
    </div>
  );
}
