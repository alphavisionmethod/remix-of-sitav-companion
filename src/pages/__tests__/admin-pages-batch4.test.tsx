import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["GodTierRuntimeBoard", () => import("@/pages/admin/architecture/GodTierRuntimeBoard")],
  ["CJ01ExecutiveReport", () => import("@/pages/admin/customer-journey/CJ01ExecutiveReport")],
  ["CJ02JourneyTruthMatrix", () => import("@/pages/admin/customer-journey/CJ02JourneyTruthMatrix")],
  ["CJ03JourneyDetailView", () => import("@/pages/admin/customer-journey/CJ03JourneyDetailView")],
  ["CJ04LaunchBlockerView", () => import("@/pages/admin/customer-journey/CJ04LaunchBlockerView")],
  ["CJ05DemoVsRealComparison", () => import("@/pages/admin/customer-journey/CJ05DemoVsRealComparison")],
  ["CJ06BrokenClicksExplorer", () => import("@/pages/admin/customer-journey/CJ06BrokenClicksExplorer")],
  ["CJ07OwnerRemediationView", () => import("@/pages/admin/customer-journey/CJ07OwnerRemediationView")],
  ["CJ08RouteActionCoverage", () => import("@/pages/admin/customer-journey/CJ08RouteActionCoverage")],
  ["CJ09RecentVerificationRuns", () => import("@/pages/admin/customer-journey/CJ09RecentVerificationRuns")],
  ["FIPBuilderConsole", () => import("@/pages/admin/fip/FIPBuilderConsole")],
  ["FIPCapabilityRegistry", () => import("@/pages/admin/fip/FIPCapabilityRegistry")],
  ["FIPComplianceBoard", () => import("@/pages/admin/fip/FIPComplianceBoard")],
  ["FIPDeprecationManager", () => import("@/pages/admin/fip/FIPDeprecationManager")],
  ["FIPExecutionExplorer", () => import("@/pages/admin/fip/FIPExecutionExplorer")],
  ["FIPGeneratedTruthBoard", () => import("@/pages/admin/fip/FIPGeneratedTruthBoard")],
  ["FIPIntakeDesk", () => import("@/pages/admin/fip/FIPIntakeDesk")],
  ["FIPMemoryGraphStudio", () => import("@/pages/admin/fip/FIPMemoryGraphStudio")],
  ["FIPObservabilityCenter", () => import("@/pages/admin/fip/FIPObservabilityCenter")],
  ["FIPOwnerBoundary", () => import("@/pages/admin/fip/FIPOwnerBoundary")],
  ["FIPPolicyTrustBoard", () => import("@/pages/admin/fip/FIPPolicyTrustBoard")],
  ["FIPReadinessGateReview", () => import("@/pages/admin/fip/FIPReadinessGateReview")],
  ["FIPRolloutPlanner", () => import("@/pages/admin/fip/FIPRolloutPlanner")],
  ["FIPSpecStudio", () => import("@/pages/admin/fip/FIPSpecStudio")],
  ["FE01QualityMatrix", () => import("@/pages/admin/frontend/FE01QualityMatrix")],
  ["FE02DesignGovernance", () => import("@/pages/admin/frontend/FE02DesignGovernance")],
] as const;

describe("Admin Pages Batch 4", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
