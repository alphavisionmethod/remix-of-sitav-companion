import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AIEfficiencyScoreboard", () => import("@/pages/admin/intelligence/AIEfficiencyScoreboard")],
  ["CrossTenantGovernance", () => import("@/pages/admin/intelligence/CrossTenantGovernance")],
  ["DifferentialReasoningExplorer", () => import("@/pages/admin/intelligence/DifferentialReasoningExplorer")],
  ["EscalationControlCenter", () => import("@/pages/admin/intelligence/EscalationControlCenter")],
  ["IntelligenceAssetLibrary", () => import("@/pages/admin/intelligence/IntelligenceAssetLibrary")],
  ["IntelligencePacketInspector", () => import("@/pages/admin/intelligence/IntelligencePacketInspector")],
  ["IntelligenceReuseOverview", () => import("@/pages/admin/intelligence/IntelligenceReuseOverview")],
  ["OutcomeEconomicsBoard", () => import("@/pages/admin/intelligence/OutcomeEconomicsBoard")],
  ["PatternLearningCenter", () => import("@/pages/admin/intelligence/PatternLearningCenter")],
  ["SmartDigestCenter", () => import("@/pages/admin/intelligence/SmartDigestCenter")],
  ["ZeroWastePromptView", () => import("@/pages/admin/intelligence/ZeroWastePromptView")],
  ["LAUNCH01ReadinessExecutive", () => import("@/pages/admin/launch/LAUNCH01ReadinessExecutive")],
  ["LAUNCH02FlagshipReadiness", () => import("@/pages/admin/launch/LAUNCH02FlagshipReadiness")],
  ["LAUNCH03ClaimSafetyMatrix", () => import("@/pages/admin/launch/LAUNCH03ClaimSafetyMatrix")],
  ["LAUNCH04BlockerCommand", () => import("@/pages/admin/launch/LAUNCH04BlockerCommand")],
  ["LAUNCH06NarrativeGuide", () => import("@/pages/admin/launch/LAUNCH06NarrativeGuide")],
  ["LAUNCH07GoNoGo", () => import("@/pages/admin/launch/LAUNCH07GoNoGo")],
  ["SAGOverview", () => import("@/pages/admin/sag/SAGOverview")],
  ["SAGBuilderConsole", () => import("@/pages/admin/sag/SAGBuilderConsole")],
  ["SAGComplianceGate", () => import("@/pages/admin/sag/SAGComplianceGate")],
  ["SAGCostConfidenceLab", () => import("@/pages/admin/sag/SAGCostConfidenceLab")],
  ["SAGEconomicsBoard", () => import("@/pages/admin/sag/SAGEconomicsBoard")],
  ["SAGFallbackCenter", () => import("@/pages/admin/sag/SAGFallbackCenter")],
  ["SAGModelRegistry", () => import("@/pages/admin/sag/SAGModelRegistry")],
  ["SAGMultiStageExplorer", () => import("@/pages/admin/sag/SAGMultiStageExplorer")],
  ["SAGPromptRegistry", () => import("@/pages/admin/sag/SAGPromptRegistry")],
  ["SAGProviderHealth", () => import("@/pages/admin/sag/SAGProviderHealth")],
  ["SAGReceiptExplorer", () => import("@/pages/admin/sag/SAGReceiptExplorer")],
  ["SAGRoutingPolicy", () => import("@/pages/admin/sag/SAGRoutingPolicy")],
] as const;

describe("Admin Pages Batch 5", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
