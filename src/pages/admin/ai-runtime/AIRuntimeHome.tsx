// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Hub (Admin AI Engineer Team — single window)
// Canonical entry for /admin/ai-runtime.
//
// Tabs are NOT hardcoded here. They live in the canonical registry:
//   src/lib/admin/ai-engineer-hub/tab-registry.ts
//
// The CI gate `check-ai-engineer-tab-registry` enforces that every
// panel under src/components/admin/ai-runtime/** and every board
// under src/pages/admin/ai-runtime/** is either registered or
// explicitly archived. Adding a panel without registering it fails
// the build.
//
// Lazy loaders are mapped by component path so Vite can statically
// analyze each chunk; the registry stays declarative & data-only.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";
import {
  AI_ENGINEER_HUB_TABS,
  AI_ENGINEER_HUB_DEFAULT_TAB_ID,
  type AIEngineerTabSpec,
} from "@/lib/admin/ai-engineer-hub/tab-registry";

function ModuleFallback() {
  return (
    <div className="text-xs text-muted-foreground py-12 text-center">Loading module…</div>
  );
}

// ── Static loader table — keyed by componentPath in the registry. ──
// Each entry MUST stay in sync with the registry. The CI gate
// `check-ai-engineer-tab-registry` verifies parity.
type Loader = () => Promise<{ default: ComponentType<unknown> }>;

const LOADERS: Record<string, Loader> = {
  // workforce
  "@/pages/admin/AIT01TeamOverview":
    () => import("@/pages/admin/AIT01TeamOverview"),
  "@/pages/admin/ai-runtime/InternalAgentsBoard":
    () => import("@/pages/admin/ai-runtime/InternalAgentsBoard"),
  "@/pages/admin/ai-runtime/InternalAgentIntentTimeline":
    () => import("@/pages/admin/ai-runtime/InternalAgentIntentTimeline"),
  "@/pages/admin/ai-runtime/CouncilsBoard":
    () => import("@/pages/admin/ai-runtime/CouncilsBoard"),
  "@/pages/admin/ai-runtime/TrustLadderBoard":
    () => import("@/pages/admin/ai-runtime/TrustLadderBoard"),
  "@/pages/admin/ai-runtime/ReflectionBoard":
    () => import("@/pages/admin/ai-runtime/ReflectionBoard"),

  // governance
  "@/pages/admin/ai-runtime/SuggestionsBoard":
    () => import("@/pages/admin/ai-runtime/SuggestionsBoard"),
  "@/pages/admin/ai-runtime/WeeklyDigestBoard":
    () => import("@/pages/admin/ai-runtime/WeeklyDigestBoard"),
  "@/pages/admin/ai-runtime/DependencyFindingsBoard":
    () => import("@/pages/admin/ai-runtime/DependencyFindingsBoard"),
  "@/pages/admin/ai-runtime/PolicyDraftReviewBoard":
    () => import("@/pages/admin/ai-runtime/PolicyDraftReviewBoard"),
  "@/pages/admin/ai-runtime/CrossCouncilBoard":
    () => import("@/pages/admin/ai-runtime/CrossCouncilBoard"),
  "@/pages/admin/ai-runtime/TenantFederationBoard":
    () => import("@/pages/admin/ai-runtime/TenantFederationBoard"),

  // runtime
  "@/pages/admin/ai-runtime/SecurityCouncilBoard":
    () => import("@/pages/admin/ai-runtime/SecurityCouncilBoard"),
  "@/pages/admin/AIG01ProviderRegistry":
    () => import("@/pages/admin/AIG01ProviderRegistry"),
  "@/pages/admin/AIG02ModelRegistry":
    () => import("@/pages/admin/AIG02ModelRegistry"),
  "@/pages/admin/AIG03RoutingMatrix":
    () => import("@/pages/admin/AIG03RoutingMatrix"),
  "@/pages/admin/AIG04BudgetCenter":
    () => import("@/pages/admin/AIG04BudgetCenter"),
  "@/pages/admin/AIGovernancePage":
    () => import("@/pages/admin/AIGovernancePage"),

  // observability
  "@/pages/admin/ai-runtime/SLOObservabilityBoard":
    () => import("@/pages/admin/ai-runtime/SLOObservabilityBoard"),
  "@/pages/admin/intelligence/AIEfficiencyScoreboard":
    () => import("@/pages/admin/intelligence/AIEfficiencyScoreboard"),
  "@/pages/admin/AIT05CostEfficiency":
    () => import("@/pages/admin/AIT05CostEfficiency").then((m) => ({
      default: m.AIT05CostEfficiency as ComponentType<unknown>,
    })),

  // assurance
  "@/pages/admin/ai-runtime/AssuranceChaosBoard":
    () => import("@/pages/admin/ai-runtime/AssuranceChaosBoard"),
  "@/pages/admin/ai-runtime/ExternalWorkforceApiBoard":
    () => import("@/pages/admin/ai-runtime/ExternalWorkforceApiBoard"),
  "@/pages/admin/ai-runtime/KnowledgeFederationBoard":
    () => import("@/pages/admin/ai-runtime/KnowledgeFederationBoard"),
  "@/pages/admin/ai-runtime/SovereignDeploymentDRBoard":
    () => import("@/pages/admin/ai-runtime/SovereignDeploymentDRBoard"),
  "@/pages/admin/ai-runtime/ComplianceAttestationBoard":
    () => import("@/pages/admin/ai-runtime/ComplianceAttestationBoard"),

  // advisors
  "@/pages/admin/AdvisorBoardCatalog":
    () => import("@/pages/admin/AdvisorBoardCatalog"),
  "@/pages/admin/ai-runtime/OwnerCopilotBriefings":
    () => import("@/pages/admin/ai-runtime/OwnerCopilotBriefings"),
  "@/pages/admin/ai-runtime/OwnerCopilotSessionConsole":
    () => import("@/pages/admin/ai-runtime/OwnerCopilotSessionConsole"),
  "@/pages/admin/ai-runtime/ProductionLaunchAttestationConsole":
    () => import("@/pages/admin/ai-runtime/ProductionLaunchAttestationConsole"),
  "@/pages/admin/ai-runtime/BoardroomSLADrillDown":
    () => import("@/pages/admin/ai-runtime/BoardroomSLADrillDown"),

  // truth-closure
  "@/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel":
    () => import("@/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel"),
  "@/components/admin/ai-runtime/ConnectorTruthSummaryPanel":
    () => import("@/components/admin/ai-runtime/ConnectorTruthSummaryPanel"),
  "@/components/admin/ai-runtime/MobileScopeTruthPanel":
    () => import("@/components/admin/ai-runtime/MobileScopeTruthPanel"),
  "@/components/admin/ai-runtime/FrontendPolishTruthPanel":
    () => import("@/components/admin/ai-runtime/FrontendPolishTruthPanel"),
  "@/components/admin/ai-runtime/AdminValidationTruthPanel":
    () => import("@/components/admin/ai-runtime/AdminValidationTruthPanel"),
  "@/components/admin/ai-runtime/HardwareAndOperatorTruthPanel":
    () => import("@/components/admin/ai-runtime/HardwareAndOperatorTruthPanel"),
  "@/components/admin/ai-runtime/SecurityAndPortabilityTruthPanel":
    () => import("@/components/admin/ai-runtime/SecurityAndPortabilityTruthPanel"),
  "@/components/admin/ai-runtime/ArchitecturalCleanupTruthPanel":
    () => import("@/components/admin/ai-runtime/ArchitecturalCleanupTruthPanel"),
  "@/components/admin/ai-runtime/EconomicTrustFutureTruthPanel":
    () => import("@/components/admin/ai-runtime/EconomicTrustFutureTruthPanel"),
  "@/components/admin/ai-runtime/ArchitectureHardeningTruthPanel":
    () => import("@/components/admin/ai-runtime/ArchitectureHardeningTruthPanel"),
  "@/components/admin/ai-runtime/FlagshipSurfaceClosureTruthPanel":
    () => import("@/components/admin/ai-runtime/FlagshipSurfaceClosureTruthPanel"),
  "@/components/admin/ai-runtime/AdminEmptyStateClosureTruthPanel":
    () => import("@/components/admin/ai-runtime/AdminEmptyStateClosureTruthPanel"),
  "@/components/admin/ai-runtime/AdminCoherenceClosureTruthPanel":
    () => import("@/components/admin/ai-runtime/AdminCoherenceClosureTruthPanel"),
  "@/components/admin/ai-runtime/TrustStateAndCopyClosureTruthPanel":
    () => import("@/components/admin/ai-runtime/TrustStateAndCopyClosureTruthPanel"),
  "@/components/admin/ai-runtime/FrontendTruthBackingClosureTruthPanel":
    () => import("@/components/admin/ai-runtime/FrontendTruthBackingClosureTruthPanel"),
};

function buildModule(spec: AIEngineerTabSpec): HubModule {
  const loader = LOADERS[spec.componentPath];
  if (!loader) {
    return {
      id: spec.id,
      label: spec.label,
      description: spec.description,
      legacyPath: spec.legacyPath,
      render: () => (
        <div className="text-xs text-destructive py-12 text-center">
          Registry mount error: tab <code>{spec.id}</code> declares{" "}
          <code>{spec.componentPath}</code> but no loader is registered.
        </div>
      ),
    };
  }
  const Comp = lazy(loader);
  return {
    id: spec.id,
    label: spec.label,
    description: spec.description,
    legacyPath: spec.legacyPath,
    render: () => (
      <Suspense fallback={<ModuleFallback />}>
        <Comp />
      </Suspense>
    ),
  };
}

export default function AIRuntimeHome() {
  const modules: HubModule[] = AI_ENGINEER_HUB_TABS.map(buildModule);

  return (
    <AdminControlPlaneShell>
      <div className="flex flex-col sm:flex-row justify-end gap-2 px-4 pt-2">
        <Link to="/admin/health/error-patrol">
          <Button size="sm" variant="outline" className="w-full sm:w-auto">
            <ExternalLink className="mr-1 h-3 w-3" />
            Open Error Patrol
          </Button>
        </Link>
      </div>
      <DomainHubLayout
        domain="ai-runtime"
        modules={modules}
        defaultTabId={AI_ENGINEER_HUB_DEFAULT_TAB_ID}
      />
    </AdminControlPlaneShell>
  );
}
