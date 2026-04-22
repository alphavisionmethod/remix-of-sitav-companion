import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["CN01ConnectorRealityOverview", () => import("@/pages/admin/CN01ConnectorRealityOverview")],
  ["CN02ConnectorRegistryConsole", () => import("@/pages/admin/CN02ConnectorRegistryConsole")],
  ["CN03AccountLinkageBoard", () => import("@/pages/admin/CN03AccountLinkageBoard")],
  ["CN04SyncTruthCenter", () => import("@/pages/admin/CN04SyncTruthCenter")],
  ["CN05ConnectorHealthBoard", () => import("@/pages/admin/CN05ConnectorHealthBoard")],
  ["CN06ConnectorDemoReview", () => import("@/pages/admin/CN06ConnectorDemoReview")],
  ["CN07ConnectorLaunchGate", () => import("@/pages/admin/CN07ConnectorLaunchGate")],
  ["ChangeImpactAnalyzer", () => import("@/pages/admin/ChangeImpactAnalyzer")],
  ["ComputeGovernanceBoard", () => import("@/pages/admin/ComputeGovernanceBoard")],
  ["ConciergeRuntimeBoard", () => import("@/pages/admin/ConciergeRuntimeBoard")],
  ["ConnectorGovernanceCenter", () => import("@/pages/admin/ConnectorGovernanceCenter")],
  ["ContractBackendReadiness", () => import("@/pages/admin/ContractBackendReadiness")],
  ["CorePersistenceOverview", () => import("@/pages/admin/CorePersistenceOverview")],
  ["CoreServiceMigrationBoard", () => import("@/pages/admin/CoreServiceMigrationBoard")],
  ["DRS01RealityModeOverview", () => import("@/pages/admin/DRS01RealityModeOverview")],
  ["DRS02ModeRegistryConsole", () => import("@/pages/admin/DRS02ModeRegistryConsole")],
  ["DRS03ScenarioLibrary", () => import("@/pages/admin/DRS03ScenarioLibrary")],
  ["DRS04ScenarioEntityGraph", () => import("@/pages/admin/DRS04ScenarioEntityGraph")],
  ["DRS05ProviderConsole", () => import("@/pages/admin/DRS05ProviderConsole")],
  ["DRS06DemoPolicySafety", () => import("@/pages/admin/DRS06DemoPolicySafety")],
  ["DRS07DemoAIControl", () => import("@/pages/admin/DRS07DemoAIControl")],
] as const;

describe("Admin Pages Batch 3", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
