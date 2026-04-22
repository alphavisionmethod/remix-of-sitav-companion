import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AtlasHub", () => import("@/pages/atlas/AtlasHub")],
  ["AdminDurabilityBoard", () => import("@/pages/atlas/AdminDurabilityBoard")],
  ["ConciergeCommandCenter", () => import("@/pages/atlas/ConciergeCommandCenter")],
  ["ConnectorControlCenter", () => import("@/pages/atlas/ConnectorControlCenter")],
  ["DataProtectionPosture", () => import("@/pages/atlas/DataProtectionPosture")],
  ["DeploymentTruthCenter", () => import("@/pages/atlas/DeploymentTruthCenter")],
  ["OperationsCommandCenter", () => import("@/pages/atlas/OperationsCommandCenter")],
  ["PlatformTruthRegistry", () => import("@/pages/atlas/PlatformTruthRegistry")],
  ["ProjectionControlCenter", () => import("@/pages/atlas/ProjectionControlCenter")],
  ["ProofCoverageBoard", () => import("@/pages/atlas/ProofCoverageBoard")],
  ["ValidationCommandCenter", () => import("@/pages/atlas/ValidationCommandCenter")],
  ["MissionControlPage", () => import("@/pages/mission-control/MissionControlPage")],
  ["PlatformTruthDashboard", () => import("@/pages/mission-control/PlatformTruthDashboard")],
  ["MissionOverviewPage", () => import("@/pages/mission/MissionOverviewPage")],
  ["ConnectorDetailPage", () => import("@/pages/mission/ConnectorDetailPage")],
  ["IncidentDetailPage", () => import("@/pages/mission/IncidentDetailPage")],
  ["MissionErrorPage", () => import("@/pages/mission/MissionErrorPage")],
  ["MissionRegistryPage", () => import("@/pages/mission/MissionRegistryPage")],
  ["MissionReleaseDetailPage", () => import("@/pages/mission/MissionReleaseDetailPage")],
  ["MissionWorkflowReplayPage", () => import("@/pages/mission/MissionWorkflowReplayPage")],
  ["PolicySimulatorPage", () => import("@/pages/mission/PolicySimulatorPage")],
] as const;

describe("Atlas & Mission Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
