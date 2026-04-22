import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AdminDashboard", () => import("@/pages/admin/AdminDashboard")],
  ["AIAgentDebate", () => import("@/pages/admin/AIAgentDebate")],
  ["AIApprovalDesk", () => import("@/pages/admin/AIApprovalDesk")],
  ["AIChangePlanViewer", () => import("@/pages/admin/AIChangePlanViewer")],
  ["AIDesignDiffTheater", () => import("@/pages/admin/AIDesignDiffTheater")],
  ["AIDesignStudio", () => import("@/pages/admin/AIDesignStudio")],
  ["AIEngineeringBoard", () => import("@/pages/admin/AIEngineeringBoard")],
  ["AIEvidenceBundleComposer", () => import("@/pages/admin/AIEvidenceBundleComposer")],
  ["AIFixCenter", () => import("@/pages/admin/AIFixCenter")],
  ["AIG01ProviderRegistry", () => import("@/pages/admin/AIG01ProviderRegistry")],
  ["AIG02ModelRegistry", () => import("@/pages/admin/AIG02ModelRegistry")],
  ["AIG03RoutingMatrix", () => import("@/pages/admin/AIG03RoutingMatrix")],
  ["AIG04BudgetCenter", () => import("@/pages/admin/AIG04BudgetCenter")],
  ["AIG05ReceiptsExplorer", () => import("@/pages/admin/AIG05ReceiptsExplorer")],
  ["AIG06LaunchTruth", () => import("@/pages/admin/AIG06LaunchTruth")],
  ["AIG07LaunchTruth", () => import("@/pages/admin/AIG07LaunchTruth")],
  ["AIG08DegradedDiagnostics", () => import("@/pages/admin/AIG08DegradedDiagnostics")],
  ["AIG09RuntimeVerification", () => import("@/pages/admin/AIG09RuntimeVerification")],
  ["AIHumanBoundaryControls", () => import("@/pages/admin/AIHumanBoundaryControls")],
  ["AILearningCenter", () => import("@/pages/admin/AILearningCenter")],
  ["AIMissionCenter", () => import("@/pages/admin/AIMissionCenter")],
  ["AIReleasesCenter", () => import("@/pages/admin/AIReleasesCenter")],
  ["AIRootCauseGraph", () => import("@/pages/admin/AIRootCauseGraph")],
  ["AIRuntimeStatus", () => import("@/pages/admin/AIRuntimeStatus")],
  ["AISelfHealing", () => import("@/pages/admin/AISelfHealing")],
  ["AISelfLearningLedger", () => import("@/pages/admin/AISelfLearningLedger")],
  ["AITeamRoster", () => import("@/pages/admin/AITeamRoster")],
  ["AITimeMachine", () => import("@/pages/admin/AITimeMachine")],
  ["AITokenDashboard", () => import("@/pages/admin/AITokenDashboard")],
  ["AITSetupChecklist", () => import("@/pages/admin/AITSetupChecklist")],
] as const;

describe("Admin Pages Batch 1", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
