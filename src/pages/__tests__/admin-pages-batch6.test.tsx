import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["SEC01PostureExecutive", () => import("@/pages/admin/security/SEC01PostureExecutive")],
  ["SEC02PrivilegedActions", () => import("@/pages/admin/security/SEC02PrivilegedActions")],
  ["SEC03SensitiveAssets", () => import("@/pages/admin/security/SEC03SensitiveAssets")],
  ["SEC04EdgeFunctionAudit", () => import("@/pages/admin/security/SEC04EdgeFunctionAudit")],
  ["SEC05ClaimSafety", () => import("@/pages/admin/security/SEC05ClaimSafety")],
  ["SEC06IncidentRecovery", () => import("@/pages/admin/security/SEC06IncidentRecovery")],
  ["BenchmarkLabDashboard", () => import("@/pages/admin/strategic/BenchmarkLabDashboard")],
  ["CostToConfidenceDashboard", () => import("@/pages/admin/strategic/CostToConfidenceDashboard")],
  ["DecayMonitorDashboard", () => import("@/pages/admin/strategic/DecayMonitorDashboard")],
  ["IntelligenceCapitalDashboard", () => import("@/pages/admin/strategic/IntelligenceCapitalDashboard")],
  ["IntelligenceInsuranceDashboard", () => import("@/pages/admin/strategic/IntelligenceInsuranceDashboard")],
  ["IntelligenceMarketDashboard", () => import("@/pages/admin/strategic/IntelligenceMarketDashboard")],
  ["OperatorTasteDashboard", () => import("@/pages/admin/strategic/OperatorTasteDashboard")],
  ["PortfolioAllocationDashboard", () => import("@/pages/admin/strategic/PortfolioAllocationDashboard")],
  ["QualityFloorDashboard", () => import("@/pages/admin/strategic/QualityFloorDashboard")],
  ["ReasoningReplayDashboard", () => import("@/pages/admin/strategic/ReasoningReplayDashboard")],
  ["TimeToTruthDashboard", () => import("@/pages/admin/strategic/TimeToTruthDashboard")],
  ["ValueRiskDashboard", () => import("@/pages/admin/strategic/ValueRiskDashboard")],
  ["V01SurfaceInventoryBoard", () => import("@/pages/admin/verification/V01SurfaceInventoryBoard")],
  ["V02InteractionCoverageBoard", () => import("@/pages/admin/verification/V02InteractionCoverageBoard")],
  ["V03P0JourneyBoard", () => import("@/pages/admin/verification/V03P0JourneyBoard")],
  ["V04ModeVerificationBoard", () => import("@/pages/admin/verification/V04ModeVerificationBoard")],
  ["V05FailureTriageBoard", () => import("@/pages/admin/verification/V05FailureTriageBoard")],
  ["V06EvidenceExplorer", () => import("@/pages/admin/verification/V06EvidenceExplorer")],
  ["V07LaunchBlockerBoard", () => import("@/pages/admin/verification/V07LaunchBlockerBoard")],
] as const;

describe("Admin Pages Batch 6", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
