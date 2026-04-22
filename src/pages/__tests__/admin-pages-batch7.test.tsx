import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AIG05UsageLedgerExplorer", () => import("@/pages/admin/AIG05UsageLedgerExplorer")],
  ["AIGovernancePage", () => import("@/pages/admin/AIGovernancePage")],
  ["AIT04ActivityFeedPage", () => import("@/pages/admin/AIT04ActivityFeedPage")],
  ["AIT06RecommendationsPage", () => import("@/pages/admin/AIT06RecommendationsPage")],
  ["AIT07ApprovalQueuePage", () => import("@/pages/admin/AIT07ApprovalQueuePage")],
  ["AIT08LaunchTruthPage", () => import("@/pages/admin/AIT08LaunchTruthPage")],
  ["ActionStateDriftViewer", () => import("@/pages/admin/ActionStateDriftViewer")],
  ["AdminDeploymentRings", () => import("@/pages/admin/AdminDeploymentRings")],
  ["AdminOperationsHub", () => import("@/pages/admin/AdminOperationsHub")],
  ["AdminProjectionModels", () => import("@/pages/admin/AdminProjectionModels")],
  ["AdminTruthClaims", () => import("@/pages/admin/AdminTruthClaims")],
  ["AdvisorActionApprovalAdmin", () => import("@/pages/admin/AdvisorActionApprovalAdmin")],
  ["AdvisorAgentDashboard", () => import("@/pages/admin/AdvisorAgentDashboard")],
  ["AdvisorAutonomyPolicyEditor", () => import("@/pages/admin/AdvisorAutonomyPolicyEditor")],
  ["AdvisorBoardCatalog", () => import("@/pages/admin/AdvisorBoardCatalog")],
  ["AdvisorMemoryInspector", () => import("@/pages/admin/AdvisorMemoryInspector")],
  ["AdvisorProfitabilityDashboard", () => import("@/pages/admin/AdvisorProfitabilityDashboard")],
  ["AdvisorRecommendationMonitor", () => import("@/pages/admin/AdvisorRecommendationMonitor")],
  ["AuditComplianceWorkspace", () => import("@/pages/admin/AuditComplianceWorkspace")],
  ["BackendTopologyDashboard", () => import("@/pages/admin/BackendTopologyDashboard")],
  ["BrainCoreDashboard", () => import("@/pages/admin/BrainCoreDashboard")],
  ["CAI01PersonalGraphExplorer", () => import("@/pages/admin/CAI01PersonalGraphExplorer")],
  ["CAI02IntentTraceBoard", () => import("@/pages/admin/CAI02IntentTraceBoard")],
  ["CAI03AttentionCenter", () => import("@/pages/admin/CAI03AttentionCenter")],
  ["CAI04ContinuityCenter", () => import("@/pages/admin/CAI04ContinuityCenter")],
  ["CAI05TrustActionsBoard", () => import("@/pages/admin/CAI05TrustActionsBoard")],
  ["CAI06ChiefOfStaffCenter", () => import("@/pages/admin/CAI06ChiefOfStaffCenter")],
  ["CAI07TimingStudio", () => import("@/pages/admin/CAI07TimingStudio")],
  ["CAI08RelationshipCenter", () => import("@/pages/admin/CAI08RelationshipCenter")],
  ["CAI09DigestConsole", () => import("@/pages/admin/CAI09DigestConsole")],
] as const;

describe("Admin Pages Batch 7", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
