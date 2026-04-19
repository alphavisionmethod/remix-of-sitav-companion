// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Hub (Phase 25 + Phase 1 Internal Agents wiring)
// Canonical entry for /admin/ai-runtime.
// Adds: internal-agents + councils tabs (Phase 1 closure).
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
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
const ConnectorTruthSummaryPanel = lazy(() => import("@/components/admin/ai-runtime/ConnectorTruthSummaryPanel"));
const MobileScopeTruthPanel = lazy(() => import("@/components/admin/ai-runtime/MobileScopeTruthPanel"));
const FrontendPolishTruthPanel = lazy(() => import("@/components/admin/ai-runtime/FrontendPolishTruthPanel"));
const AdminValidationTruthPanel = lazy(() => import("@/components/admin/ai-runtime/AdminValidationTruthPanel"));
const HardwareAndOperatorTruthPanel = lazy(() => import("@/components/admin/ai-runtime/HardwareAndOperatorTruthPanel"));
const SecurityAndPortabilityTruthPanel = lazy(() => import("@/components/admin/ai-runtime/SecurityAndPortabilityTruthPanel"));
const ArchitecturalCleanupTruthPanel = lazy(() => import("@/components/admin/ai-runtime/ArchitecturalCleanupTruthPanel"));
const EconomicTrustFutureTruthPanel = lazy(() => import("@/components/admin/ai-runtime/EconomicTrustFutureTruthPanel"));
const ArchitectureHardeningTruthPanel = lazy(() => import("@/components/admin/ai-runtime/ArchitectureHardeningTruthPanel"));
const FlagshipSurfaceClosureTruthPanel = lazy(() => import("@/components/admin/ai-runtime/FlagshipSurfaceClosureTruthPanel"));
const AdminEmptyStateClosureTruthPanel = lazy(() => import("@/components/admin/ai-runtime/AdminEmptyStateClosureTruthPanel"));

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
      id: "connector-truth",
      label: "Connector Truth",
      description: "Live OAuth refresh truth (Google / Microsoft / Slack) — read-only summary; canonical control at Integrations Hub.",
      legacyPath: "/admin/ai-runtime/connector-truth",
      render: wrap(ConnectorTruthSummaryPanel),
    },
    {
      id: "mobile-scope-truth",
      label: "Mobile Scope Truth",
      description: "Native iOS/Android are ARCHIVED. Read-only canonical truth + reactivation conditions checklist.",
      legacyPath: "/admin/ai-runtime/mobile-scope-truth",
      render: wrap(MobileScopeTruthPanel),
    },
    {
      id: "frontend-polish-truth",
      label: "Frontend Polish Truth",
      description: "Live verification of empty-state coverage, CTA integrity, state handling, trust copy, and responsive integrity for every board on this hub.",
      legacyPath: "/admin/ai-runtime/frontend-polish-truth",
      render: wrap(FrontendPolishTruthPanel),
    },
    {
      id: "admin-validation-truth",
      label: "Admin & Validation Truth",
      description: "Live truth view of admin top-task discoverability, museum-board absence, action-orientation, edge-function contract coverage, WARN-ratchet meaningfulness, evidence-freshness blocking, behavioral CI coverage, and gate-quality classification.",
      legacyPath: "/admin/ai-runtime/admin-validation-truth",
      render: wrap(AdminValidationTruthPanel),
    },
    {
      id: "hardware-operator-truth",
      label: "Hardware & Operator Truth",
      description: "Real-device certification runs and human-use operator drill log with MTTR — honest WARN-tier classification until real-world evidence is recorded.",
      legacyPath: "/admin/ai-runtime/hardware-operator-truth",
      render: wrap(HardwareAndOperatorTruthPanel),
    },
    {
      id: "security-portability-truth",
      label: "Security & Portability Truth",
      description: "Live secret-rotation cadence (DB-backed), adversarial proof status (RLS/Electron/debugger/session), and portability boundary status — honest WARN-tier classification for partner-blocked / pending-execution evidence.",
      legacyPath: "/admin/ai-runtime/security-portability-truth",
      render: wrap(SecurityAndPortabilityTruthPanel),
    },
    {
      id: "architectural-cleanup-truth",
      label: "Architectural Cleanup Truth",
      description: "Live portability boundary status, edge-function structured-logging coverage, and truth-manifest health — additive, audit-first pass with honest WARN-tier classification and zero deletions.",
      legacyPath: "/admin/ai-runtime/architectural-cleanup-truth",
      render: wrap(ArchitecturalCleanupTruthPanel),
    },
    {
      id: "economic-trust-future-truth",
      label: "Economic Trust & Future",
      description: "Per-user AI budget ceilings (live), agency-wording lockdown, calm-mode posture, and future-surface containment — 7 BLOCK gates wired with honest WARN-tier preserved.",
      legacyPath: "/admin/ai-runtime/economic-trust-future-truth",
      render: wrap(EconomicTrustFutureTruthPanel),
    },
    {
      id: "architecture-hardening-truth",
      label: "Architecture Hardening",
      description: "Architecture-hardening closure: 22 deliverables, 6 new BLOCK validators (runtime-host boundaries, shell/runtime portability, edge log shape, mobile archived scope, kernel overclaim, doc canonicality), canonical source-of-truth map, partial-surface closure register.",
      legacyPath: "/admin/ai-runtime/architecture-hardening-truth",
      render: wrap(ArchitectureHardeningTruthPanel),
    },
    {
      id: "flagship-surface-closure-truth",
      label: "Flagship Surface Closure",
      description: "Admin AI flagship closure: 2 in-scope GREEN BLOCK gates (admin-ai-runtime, admin-integrations) + 4 honest WARN-tier deferrals (onboarding, boardroom-briefing, concierge, communications) cross-referenced to user-flagship-pass. Zero fake-green.",
      legacyPath: "/admin/ai-runtime/flagship-surface-closure-truth",
      render: wrap(FlagshipSurfaceClosureTruthPanel),
    },
    {
      id: "admin-empty-state-closure-truth",
      label: "Admin Empty-State Closure",
      description: "Admin empty-state closure: 3 canonical primitives confirmed reusable + 3 surfaces SHIPPED with PremiumEmptyState (cross-domain-coherence, cost-spotlight, sbom-history) — live in their canonical hubs with operator-grade copy and real /admin/* destinations. 4 validators green at 0 errors / 0 warnings. Zero duplicates, zero fake-live preview content.",
      legacyPath: "/admin/ai-runtime/admin-empty-state-closure-truth",
      render: wrap(AdminEmptyStateClosureTruthPanel),
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
      <div className="flex justify-end px-4 pt-2">
        <Link to="/admin/health/error-patrol">
          <Button size="sm" variant="outline" onClick={() => undefined}>
            <ExternalLink className="mr-1 h-3 w-3" />
            Open Error Patrol
          </Button>
        </Link>
      </div>
      <DomainHubLayout domain="ai-runtime" modules={modules} defaultTabId="team" />
    </AdminControlPlaneShell>
  );
}
