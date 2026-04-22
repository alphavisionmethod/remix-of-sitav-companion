import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["PFA04ConsentLedgerExplorer", () => import("@/pages/admin/PFA04ConsentLedgerExplorer")],
  ["PFA05ScopePolicyMatrix", () => import("@/pages/admin/PFA05ScopePolicyMatrix")],
  ["PFA06PermissionUpgradeCenter", () => import("@/pages/admin/PFA06PermissionUpgradeCenter")],
  ["PFA07ConnectorHealthDrift", () => import("@/pages/admin/PFA07ConnectorHealthDrift")],
  ["PFA08AccountGraphExplorer", () => import("@/pages/admin/PFA08AccountGraphExplorer")],
  ["PFA09ConnectedAccountsCenter", () => import("@/pages/admin/PFA09ConnectedAccountsCenter")],
  ["PFA10IntegrationLaunchHonesty", () => import("@/pages/admin/PFA10IntegrationLaunchHonesty")],
  ["PersistenceDriftRadar", () => import("@/pages/admin/PersistenceDriftRadar")],
  ["PersistenceStatus", () => import("@/pages/admin/PersistenceStatus")],
  ["PlatformMaturityDashboard", () => import("@/pages/admin/PlatformMaturityDashboard")],
  ["PolicyDecisionLedger", () => import("@/pages/admin/PolicyDecisionLedger")],
  ["PolicySimulator", () => import("@/pages/admin/PolicySimulator")],
  ["ProofMatrixExplorer", () => import("@/pages/admin/ProofMatrixExplorer")],
  ["REX01RecommendationIntelligence", () => import("@/pages/admin/REX01RecommendationIntelligence")],
  ["REX02ApprovalQueueCompletion", () => import("@/pages/admin/REX02ApprovalQueueCompletion")],
  ["REX03RecommendationExecution", () => import("@/pages/admin/REX03RecommendationExecution")],
  ["REX04RemediationPrograms", () => import("@/pages/admin/REX04RemediationPrograms")],
  ["REX05OutcomeVerification", () => import("@/pages/admin/REX05OutcomeVerification")],
  ["RealityClassificationMatrix", () => import("@/pages/admin/RealityClassificationMatrix")],
  ["RealityConversionOverview", () => import("@/pages/admin/RealityConversionOverview")],
  ["RealityProgressTimeline", () => import("@/pages/admin/RealityProgressTimeline")],
  ["ReleaseEngineeringPage", () => import("@/pages/admin/ReleaseEngineeringPage")],
  ["ReleaseRingCommandBoard", () => import("@/pages/admin/ReleaseRingCommandBoard")],
  ["ReplayRecoveryConsole", () => import("@/pages/admin/ReplayRecoveryConsole")],
  ["RevenueAutopilotMonitor", () => import("@/pages/admin/RevenueAutopilotMonitor")],
  ["RouteRealityHeatmap", () => import("@/pages/admin/RouteRealityHeatmap")],
  ["RouteSourceDiagnostics", () => import("@/pages/admin/RouteSourceDiagnostics")],
  ["RuntimeContinuityBoard", () => import("@/pages/admin/RuntimeContinuityBoard")],
  ["RuntimeRealityValidation", () => import("@/pages/admin/RuntimeRealityValidation")],
  ["RuntimeTruthCoverageDashboard", () => import("@/pages/admin/RuntimeTruthCoverageDashboard")],
] as const;

describe("Admin Pages Batch 12", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
