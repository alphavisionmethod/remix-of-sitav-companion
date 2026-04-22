import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["CAI10ModesCenter", () => import("@/pages/admin/CAI10ModesCenter")],
  ["CAI11InterfaceProfiler", () => import("@/pages/admin/CAI11InterfaceProfiler")],
  ["CAI12OpportunityBoard", () => import("@/pages/admin/CAI12OpportunityBoard")],
  ["CAI13MemoryGovernance", () => import("@/pages/admin/CAI13MemoryGovernance")],
  ["CAI14BoundaryControl", () => import("@/pages/admin/CAI14BoundaryControl")],
  ["CAI15SignatureStudio", () => import("@/pages/admin/CAI15SignatureStudio")],
  ["CanonicalChainExplorer", () => import("@/pages/admin/CanonicalChainExplorer")],
  ["CommunicationHub", () => import("@/pages/admin/CommunicationHub")],
  ["CompositorDebugPage", () => import("@/pages/admin/CompositorDebugPage")],
  ["ConscienceGateDashboard", () => import("@/pages/admin/ConscienceGateDashboard")],
  ["CrossDomainMemoryExplorer", () => import("@/pages/admin/CrossDomainMemoryExplorer")],
  ["DRS08AnalyticsSegregation", () => import("@/pages/admin/DRS08AnalyticsSegregation")],
  ["DRS09TruthLabeling", () => import("@/pages/admin/DRS09TruthLabeling")],
  ["DRS10DualRealityLaunchGate", () => import("@/pages/admin/DRS10DualRealityLaunchGate")],
  ["DWE01ConnectedDevicesCenter", () => import("@/pages/admin/DWE01ConnectedDevicesCenter")],
  ["DWE02PresenceContinuityCenter", () => import("@/pages/admin/DWE02PresenceContinuityCenter")],
  ["DWE03WearableSignalsCenter", () => import("@/pages/admin/DWE03WearableSignalsCenter")],
  ["DWE04NotificationRoutingStudio", () => import("@/pages/admin/DWE04NotificationRoutingStudio")],
  ["DWE05DeviceTrustApprovalsCenter", () => import("@/pages/admin/DWE05DeviceTrustApprovalsCenter")],
  ["DWE06AmbientAssistantCenter", () => import("@/pages/admin/DWE06AmbientAssistantCenter")],
  ["DWE07DeviceLaunchHonestyBoard", () => import("@/pages/admin/DWE07DeviceLaunchHonestyBoard")],
  ["DeliveryReadinessBoard", () => import("@/pages/admin/DeliveryReadinessBoard")],
  ["DeliveryWavePlanner", () => import("@/pages/admin/DeliveryWavePlanner")],
  ["DependencyMapViewer", () => import("@/pages/admin/DependencyMapViewer")],
  ["DeploymentUnitExplorer", () => import("@/pages/admin/DeploymentUnitExplorer")],
  ["DesktopHostCapabilityExplorer", () => import("@/pages/admin/DesktopHostCapabilityExplorer")],
  ["DomainManifestDashboard", () => import("@/pages/admin/DomainManifestDashboard")],
  ["DomainMethodologyPacks", () => import("@/pages/admin/DomainMethodologyPacks")],
  ["DomainRealityBoard", () => import("@/pages/admin/DomainRealityBoard")],
  ["ECO01EcosystemCommand", () => import("@/pages/admin/ECO01EcosystemCommand")],
] as const;

describe("Admin Pages Batch 8", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
