import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

vi.mock("@/platform/sita/contexts/SitaOSContext", () => ({
  useSitaOS: () => ({
    explainability: { clearHistory: vi.fn(), getExplanationHistory: () => [], explain: vi.fn(), loadPersistedState: vi.fn() },
    workspaceIntelligence: { getAvailableWorkspaces: () => [], getWorkspaceUsageStats: () => ({}), suggestWorkspace: () => null, loadPersistedState: vi.fn() },
    deviceMesh: { getDevices: () => [], getDeviceCount: () => 0, getMeshHealth: () => ({ devices: [], connectedCount: 0, totalCount: 0, healthScore: 100 }), loadPersistedState: vi.fn() },
    contextGraph: { getNodes: () => [], getEdges: () => [], loadPersistedState: vi.fn() },
    universalStateSync: { getState: () => ({}), loadPersistedState: vi.fn() },
    actionSafety: { checkAction: vi.fn(), loadPersistedState: vi.fn() },
    bootPhase: "ready",
  }),
  SitaOSProvider: ({ children }: any) => children,
}));

vi.mock("@/platform/app-platform/contexts/AppPlatformContext", () => ({
  useAppPlatform: () => ({
    receipts: [],
    apps: [],
    getReceipt: () => null,
    loadPersistedState: vi.fn(),
  }),
  AppPlatformProvider: ({ children }: any) => children,
}));

vi.mock("@/hooks/useOSOrchestration", () => ({
  useOSOrchestration: () => new Proxy({}, {
    get: (_target, prop) => {
      const defaults: Record<string, any> = {
        getMeshTopology: () => ({ peers: [], connections: [], healthScore: 1, nodes: [], edges: [], clusters: [] }),
        getCurrentContext: () => ({ workspace: null, domain: null, signals: [], activeDomains: [] }),
        getCognitiveLoad: () => ({ score: 0.2, level: "low" }),
        getSystemHealth: () => ({ status: "healthy", score: 1 }),
        getCurrentMode: () => "default",
        getTrustScore: () => 1,
      };
      if (prop in defaults) return defaults[prop as string];
      return () => [];
    },
  }),
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
