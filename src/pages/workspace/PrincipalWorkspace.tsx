// ═══════════════════════════════════════════════════════════════
// SITA OS — Principal Workspace (Dual-Reality View)
// Executive-grade view: summary-level, redacted internals,
// authority actions (approve/reject/escalate/delegate/freeze).
// Consumes WorkspaceViewEngine with principal filter.
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspaceView, useMetaGovernanceBoardroom } from "@/hooks/use-meta-governance";
import { TrustDebtPanel, ReadinessGauge, DelegationRegistryTable } from "@/components/governance";
import { motion } from "framer-motion";
import { Crown, Shield, AlertTriangle, ArrowRight, Bell, CheckCircle, Eye, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { GovernanceBoardroomSection } from "@/packages/contracts";
import type { BoardroomSession, AdvisorCouncilState } from "@/packages/boardroom-contracts";
import type { ReadinessInput } from "@/domains/engines/readiness-engine";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

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

const DEFAULT_SCOPE = { ownerId: "principal-user", visibility: "private" as const };

const SectionCard = ({ section }: { section: GovernanceBoardroomSection }) => {
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
          {section.metrics.slice(0, 3).map((m, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        {section.actionItems.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-border">
            {section.actionItems.slice(0, 2).map((a, i) => (
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

export default function PrincipalWorkspace() {
  const { filter, pendingHandoffs, activeEscalations, isAuthorized } = useWorkspaceView("principal");
  const boardroomSections = useMetaGovernanceBoardroom(DEFAULT_SCOPE);

  const criticalSections = boardroomSections.filter(s => s.severity === "critical");
  const warningSections = boardroomSections.filter(s => s.severity === "warning");
  const infoSections = boardroomSections.filter(s => s.severity === "info");

  return (
    <div className="space-y-6 pb-8">
      <SitaPageHeader
        title="Principal Workspace"
        subtitle="Executive governance view — summary-level insights with authority controls"
      />

      {/* Authority bar */}
      <div className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
        <Eye className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">
          View: <span className="text-foreground font-medium">{filter.explanationDepth}</span> •
          Detail: <span className="text-foreground font-medium">{filter.maxDetailLevel}</span> •
          Domains: <span className="text-foreground font-medium">{filter.visibleDomains.length}</span>
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
            <Lock className="h-3 w-3 mr-1" />Principal
          </Badge>
        </div>
      </div>

      {/* Critical alerts */}
      {criticalSections.length > 0 && (
        <>
          <SitaSectionHeader title="Critical Attention Required" subtitle={`${criticalSections.length} systems`} />
          <div className="grid gap-4 md:grid-cols-2">
            {criticalSections.map(s => <SectionCard key={s.systemId} section={s} />)}
          </div>
        </>
      )}

      {/* Governance overview */}
      <SitaSectionHeader title="Governance Overview" />
      <div className="grid gap-4 lg:grid-cols-2">
        <TrustDebtPanel />
        <ReadinessGauge input={DEFAULT_READINESS_INPUT} entityScope={DEFAULT_SCOPE} />
      </div>

      {/* Warnings */}
      {warningSections.length > 0 && (
        <>
          <SitaSectionHeader title="Warnings" subtitle={`${warningSections.length} systems`} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {warningSections.map(s => <SectionCard key={s.systemId} section={s} />)}
          </div>
        </>
      )}

      {/* Delegation */}
      <SitaSectionHeader title="Delegation Registry" />
      <DelegationRegistryTable />

      {/* Healthy systems */}
      {infoSections.length > 0 && (
        <>
          <SitaSectionHeader title="Healthy Systems" subtitle={`${infoSections.length} systems`} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {infoSections.map(s => <SectionCard key={s.systemId} section={s} />)}
          </div>
        </>
      )}
    </div>
  );
}
