// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Hub (Phase 25 + Phase 1 Internal Agents wiring)
// Canonical entry for /admin/ai-runtime.
// Adds: internal-agents + councils tabs (Phase 1 closure).
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/components/admin/hubs/DomainHubLayout";

const AIT01TeamOverview = lazy(() => import("@/pages/admin/AIT01TeamOverview"));
const AIT05CostEfficiency = lazy(() =>
  import("@/pages/admin/AIT05CostEfficiency").then((m) => ({ default: m.AIT05CostEfficiency })),
);
const AIEfficiencyScoreboard = lazy(
  () => import("@/pages/admin/intelligence/AIEfficiencyScoreboard"),
);
const AIG01ProviderRegistry = lazy(() => import("@/pages/admin/AIG01ProviderRegistry"));
const AIG02ModelRegistry = lazy(() => import("@/pages/admin/AIG02ModelRegistry"));
const AIG03RoutingMatrix = lazy(() => import("@/pages/admin/AIG03RoutingMatrix"));
const AIG04BudgetCenter = lazy(() => import("@/pages/admin/AIG04BudgetCenter"));
const AIGovernancePage = lazy(() => import("@/pages/admin/AIGovernancePage"));
const AdvisorBoardCatalog = lazy(() => import("@/pages/admin/AdvisorBoardCatalog"));
const InternalAgentsBoard = lazy(() => import("@/pages/admin/ai-runtime/InternalAgentsBoard"));
const CouncilsBoard = lazy(() => import("@/pages/admin/ai-runtime/CouncilsBoard"));
const SuggestionsBoard = lazy(() => import("@/pages/admin/ai-runtime/SuggestionsBoard"));
const WeeklyDigestBoard = lazy(() => import("@/pages/admin/ai-runtime/WeeklyDigestBoard"));
const DependencyFindingsBoard = lazy(() => import("@/pages/admin/ai-runtime/DependencyFindingsBoard"));
const SecurityCouncilBoard = lazy(() => import("@/pages/admin/ai-runtime/SecurityCouncilBoard"));
const AIRuntimeNightlyTruthPanel = lazy(() => import("@/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel"));

function ModuleFallback() {
  return (
    <div className="text-xs text-muted-foreground py-12 text-center">Loading module…</div>
  );
}

const wrap = (Comp: React.ComponentType) => () => (
  <Suspense fallback={<ModuleFallback />}>
    <Comp />
  </Suspense>
);

export default function AIRuntimeHome() {
  const modules: HubModule[] = [
    {
      id: "team",
      label: "Team Overview",
      description: "AI team status and KPIs.",
      legacyPath: "/admin/ai-team/overview",
      render: wrap(AIT01TeamOverview),
    },
    {
      id: "internal-agents",
      label: "Internal Agents",
      description: "40 internal AI workforce agents — runtime state, drilldowns, supervisor controls.",
      legacyPath: "/admin/ai-runtime/internal-agents",
      render: wrap(InternalAgentsBoard),
    },
    {
      id: "councils",
      label: "Councils",
      description: "6 councils + supervisor escalations.",
      legacyPath: "/admin/ai-runtime/councils",
      render: wrap(CouncilsBoard),
    },
    {
      id: "suggestions",
      label: "Suggestions",
      description: "Phase 3 — evidence-backed implementation proposals from internal AI workforce signals.",
      legacyPath: "/admin/ai-runtime/suggestions",
      render: wrap(SuggestionsBoard),
    },
    {
      id: "weekly-digest",
      label: "Weekly Digest",
      description: "Phase 3 — synthesized 7-day workforce intelligence digest.",
      legacyPath: "/admin/ai-runtime/weekly-digest",
      render: wrap(WeeklyDigestBoard),
    },
    {
      id: "dependency-findings",
      label: "Dependency Findings",
      description: "Phase 3 — normalized npm audit findings linked to upgrade suggestions.",
      legacyPath: "/admin/ai-runtime/dependency-findings",
      render: wrap(DependencyFindingsBoard),
    },
    {
      id: "security-council",
      label: "Security Council",
      description: "Phase 4 — 7 security-trust agents observing runtime signals; live findings + drilldown.",
      legacyPath: "/admin/ai-runtime/security-council",
      render: wrap(SecurityCouncilBoard),
    },
    {
      id: "nightly-truth",
      label: "Nightly Truth",
      description: "Live-provider verification, receipts, ledger, fallback, and budget proof — nightly streak tracking.",
      legacyPath: "/admin/ai-runtime/nightly-truth",
      render: wrap(AIRuntimeNightlyTruthPanel),
    },
    {
      id: "efficiency",
      label: "Intelligence Efficiency",
      description: "AI quality and recommendation usefulness.",
      legacyPath: "/admin/intelligence/efficiency",
      render: wrap(AIEfficiencyScoreboard),
    },
    {
      id: "cost",
      label: "Cost",
      description: "Cost-to-value and AI runtime spend.",
      legacyPath: "/admin/ai-team/cost",
      render: wrap(AIT05CostEfficiency),
    },
    {
      id: "providers",
      label: "Providers",
      description: "AI provider registry and health.",
      legacyPath: "/admin/ai-gateway/providers",
      render: wrap(AIG01ProviderRegistry),
    },
    {
      id: "models",
      label: "Models",
      description: "AI model registry.",
      legacyPath: "/admin/ai-gateway/models",
      render: wrap(AIG02ModelRegistry),
    },
    {
      id: "routing",
      label: "Routing",
      description: "Capability routing matrix.",
      legacyPath: "/admin/ai-gateway/routing",
      render: wrap(AIG03RoutingMatrix),
    },
    {
      id: "budget",
      label: "Budget",
      description: "AI budget center and caps.",
      legacyPath: "/admin/ai-gateway/budget",
      render: wrap(AIG04BudgetCenter),
    },
    {
      id: "governance",
      label: "Governance",
      description: "AI governance posture.",
      legacyPath: "/admin/ai-governance",
      render: wrap(AIGovernancePage),
    },
    {
      id: "advisors",
      label: "Advisors",
      description: "Board of advisors catalog.",
      legacyPath: "/admin/advisor-board/catalog",
      render: wrap(AdvisorBoardCatalog),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="ai-runtime" modules={modules} defaultTabId="team" />
    </AdminControlPlaneShell>
  );
}
