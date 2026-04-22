import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["HRS04NotificationInfluence", () => import("@/pages/admin/HRS04NotificationInfluence")],
  ["HRS05AssistantTimingBoard", () => import("@/pages/admin/HRS05AssistantTimingBoard")],
  ["HRS06SignalLaunchHonesty", () => import("@/pages/admin/HRS06SignalLaunchHonesty")],
  ["ISA01IdentityProviderRegistryBoard", () => import("@/pages/admin/ISA01IdentityProviderRegistryBoard")],
  ["ISA02ConnectorProviderRegistryBoard", () => import("@/pages/admin/ISA02ConnectorProviderRegistryBoard")],
  ["ISA03OAuthClientRegistryConsole", () => import("@/pages/admin/ISA03OAuthClientRegistryConsole")],
  ["ISA04ConsentLedgerExplorer", () => import("@/pages/admin/ISA04ConsentLedgerExplorer")],
  ["ISA05ScopePolicyMatrixBoard", () => import("@/pages/admin/ISA05ScopePolicyMatrixBoard")],
  ["ISA06UnifiedAccountGraphExplorer", () => import("@/pages/admin/ISA06UnifiedAccountGraphExplorer")],
  ["ISA07AuthConnectorTruthBoard", () => import("@/pages/admin/ISA07AuthConnectorTruthBoard")],
  ["IncidentCommandCenter", () => import("@/pages/admin/IncidentCommandCenter")],
  ["InfraRealityClassificationBoard", () => import("@/pages/admin/InfraRealityClassificationBoard")],
  ["IngressTopologyViewer", () => import("@/pages/admin/IngressTopologyViewer")],
  ["IntegrationConciergePage", () => import("@/pages/admin/IntegrationConciergePage")],
  ["IntelligenceArtifactLibrary", () => import("@/pages/admin/IntelligenceArtifactLibrary")],
  ["IntelligenceDashboard", () => import("@/pages/admin/IntelligenceDashboard")],
  ["InvestorProofLedger", () => import("@/pages/admin/InvestorProofLedger")],
  ["KernelDashboard", () => import("@/pages/admin/KernelDashboard")],
  ["LT01BehavioralTruthOverview", () => import("@/pages/admin/LT01BehavioralTruthOverview")],
  ["LT02CIPipelineCenter", () => import("@/pages/admin/LT02CIPipelineCenter")],
  ["LT03E2EJourneyBoard", () => import("@/pages/admin/LT03E2EJourneyBoard")],
  ["LT04RuntimeProbeCenter", () => import("@/pages/admin/LT04RuntimeProbeCenter")],
  ["LT05LaunchGateBoard", () => import("@/pages/admin/LT05LaunchGateBoard")],
  ["LT06RouteInteractionTruth", () => import("@/pages/admin/LT06RouteInteractionTruth")],
  ["LT07TruthRegressionRadar", () => import("@/pages/admin/LT07TruthRegressionRadar")],
  ["LaunchHonestyBoard", () => import("@/pages/admin/LaunchHonestyBoard")],
  ["LaunchReadinessBoard", () => import("@/pages/admin/LaunchReadinessBoard")],
  ["MSA01MultiSurfaceOverview", () => import("@/pages/admin/MSA01MultiSurfaceOverview")],
  ["MSA02CoreSurfaceBoundary", () => import("@/pages/admin/MSA02CoreSurfaceBoundary")],
  ["MSA03CapabilityPortability", () => import("@/pages/admin/MSA03CapabilityPortability")],
] as const;

describe("Admin Pages Batch 10", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
