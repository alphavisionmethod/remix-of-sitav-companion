import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["EnvironmentAppliancePage", () => import("@/pages/admin/EnvironmentAppliancePage")],
  ["EventStreamExplorer", () => import("@/pages/admin/EventStreamExplorer")],
  ["FCC01FounderCommandConsole", () => import("@/pages/admin/FCC01FounderCommandConsole")],
  ["FCC02TaskDecompositionGraph", () => import("@/pages/admin/FCC02TaskDecompositionGraph")],
  ["FCC03CICDPipelineBoard", () => import("@/pages/admin/FCC03CICDPipelineBoard")],
  ["FCC04RunbookCenter", () => import("@/pages/admin/FCC04RunbookCenter")],
  ["FCC05FounderDashboard", () => import("@/pages/admin/FCC05FounderDashboard")],
  ["FCC06ProgramManagementBoard", () => import("@/pages/admin/FCC06ProgramManagementBoard")],
  ["FCC07PlatformCostCapacity", () => import("@/pages/admin/FCC07PlatformCostCapacity")],
  ["FCC08SyncStorageOps", () => import("@/pages/admin/FCC08SyncStorageOps")],
  ["FCC09SecurityRiskCenter", () => import("@/pages/admin/FCC09SecurityRiskCenter")],
  ["FCC10HumanOversightEscalation", () => import("@/pages/admin/FCC10HumanOversightEscalation")],
  ["FCC11IncidentResponseTimeline", () => import("@/pages/admin/FCC11IncidentResponseTimeline")],
  ["FCC12KnowledgeMemorySystem", () => import("@/pages/admin/FCC12KnowledgeMemorySystem")],
  ["FL01FlagshipLoopsExecutive", () => import("@/pages/admin/FL01FlagshipLoopsExecutive")],
  ["FL02FlagshipLoopDetail", () => import("@/pages/admin/FL02FlagshipLoopDetail")],
  ["FL03FlagshipPrioritization", () => import("@/pages/admin/FL03FlagshipPrioritization")],
  ["FeatureFactoryConsole", () => import("@/pages/admin/FeatureFactoryConsole")],
  ["FeatureIntakeDesk", () => import("@/pages/admin/FeatureIntakeDesk")],
  ["FeatureLifecycleBoard", () => import("@/pages/admin/FeatureLifecycleBoard")],
  ["FeatureRealityDetail", () => import("@/pages/admin/FeatureRealityDetail")],
  ["FleetHealthPage", () => import("@/pages/admin/FleetHealthPage")],
  ["FounderCouncilBoard", () => import("@/pages/admin/FounderCouncilBoard")],
  ["GeneratedTruthDashboard", () => import("@/pages/admin/GeneratedTruthDashboard")],
  ["GoogleProviderFamilyDashboard", () => import("@/pages/admin/GoogleProviderFamilyDashboard")],
  ["GraphIntelligencePage", () => import("@/pages/admin/GraphIntelligencePage")],
  ["HQApprovalQueue", () => import("@/pages/admin/HQApprovalQueue")],
  ["HRS01HealthConsentCenter", () => import("@/pages/admin/HRS01HealthConsentCenter")],
  ["HRS02SignalSourcesBoard", () => import("@/pages/admin/HRS02SignalSourcesBoard")],
  ["HRS03ReadinessExplanation", () => import("@/pages/admin/HRS03ReadinessExplanation")],
] as const;

describe("Admin Pages Batch 9", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
