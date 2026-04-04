// ═══════════════════════════════════════════════════════════════
// SITA OS — Governance Dashboard
// Unified view of all meta-governance panels: Trust Debt,
// Execution Debt, Drag Index, Readiness, Delegation.
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader, SitaSectionHeader } from "@/components/sita/SitaCard";
import { TrustDebtPanel, ExecutionDebtHeatmap, DragIndexRadar, ReadinessGauge, DelegationRegistryTable } from "@/components/governance";
import { Scale } from "lucide-react";
import type { ReadinessInput } from "@/lib/engines/readiness-engine";

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

const DEFAULT_SCOPE = { ownerId: "current-user", visibility: "private" as const };

export default function GovernanceDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <SitaPageHeader
        title="Governance Dashboard"
        subtitle="Meta-governance health across trust, execution, drag, readiness, and delegation"
      />

      {/* Trust + Execution row */}
      <SitaSectionHeader title="Debt Ledgers" />
      <div className="grid gap-4 lg:grid-cols-2">
        <TrustDebtPanel />
        <ExecutionDebtHeatmap />
      </div>

      {/* Drag + Readiness row */}
      <SitaSectionHeader title="Operational Health" />
      <div className="grid gap-4 lg:grid-cols-2">
        <DragIndexRadar entityScope={DEFAULT_SCOPE} />
        <ReadinessGauge input={DEFAULT_READINESS_INPUT} entityScope={DEFAULT_SCOPE} />
      </div>

      {/* Delegation */}
      <SitaSectionHeader title="Delegation Registry" />
      <DelegationRegistryTable />
    </div>
  );
}
