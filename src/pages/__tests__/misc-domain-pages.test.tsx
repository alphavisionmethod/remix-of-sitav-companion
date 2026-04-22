import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

vi.mock("@/contexts/SitaOSContext", () => ({
  useSitaOS: () => ({
    explainability: { clearHistory: vi.fn(), getExplanationHistory: () => [], loadPersistedState: vi.fn() },
    workspaceIntelligence: { getAvailableWorkspaces: () => [], getWorkspaceUsageStats: () => ({}), loadPersistedState: vi.fn() },
    deviceMesh: { getDevices: () => [], loadPersistedState: vi.fn() },
    contextGraph: { getNodes: () => [], loadPersistedState: vi.fn() },
    universalStateSync: { loadPersistedState: vi.fn() },
    actionSafety: { loadPersistedState: vi.fn() },
    bootPhase: "ready",
  }),
  SitaOSProvider: ({ children }: any) => children,
}));

const pages = [
  ["CalmAssistantChat", () => import("@/pages/advisors/CalmAssistantChat")],
  ["AppReceiptDetailPage", () => import("@/pages/app-platform/AppReceiptDetailPage")],
  ["OperationalInfraMonitor", () => import("@/pages/atlas/OperationalInfraMonitor")],
  ["ConciergeBoardroom", () => import("@/pages/concierge/ConciergeBoardroom")],
  ["LifeAdminCenter", () => import("@/pages/concierge/LifeAdminCenter")],
  ["DPOSubNav", () => import("@/pages/digital-presence/DPOSubNav")],
  ["FilesExplorer", () => import("@/pages/files/FilesExplorer")],
  ["DeviceMeshPanel", () => import("@/pages/intelligence/DeviceMeshPanel")],
  ["IntelligenceDashboard", () => import("@/pages/intelligence/IntelligenceDashboard")],
  ["PrivacyControlCenter", () => import("@/pages/intelligence/PrivacyControlCenter")],
  ["KnowledgeGraph", () => import("@/pages/investment-office/KnowledgeGraph")],
  ["TradingFloor", () => import("@/pages/investment-office/TradingFloor")],
  ["WarRoom", () => import("@/pages/investment-office/WarRoom")],
  ["ReleaseDeploymentWorkspace", () => import("@/pages/owner/ReleaseDeploymentWorkspace")],
  ["SheetsWorkspace", () => import("@/pages/workspace/SheetsWorkspace")],
  ["SlidesWorkspace", () => import("@/pages/workspace/SlidesWorkspace")],
] as const;

describe("Misc Domain Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
