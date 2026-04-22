import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["PersonalBrain", () => import("@/pages/PersonalBrain")],
  ["Boardroom", () => import("@/pages/Boardroom")],
  ["BoardroomReplay", () => import("@/pages/boardroom/BoardroomReplay")],
  ["BoardroomHistory", () => import("@/pages/boardroom/BoardroomHistory")],
  ["AdvisorWorkspace", () => import("@/pages/advisors/AdvisorWorkspace")],
  ["AdvisorCouncilDashboard", () => import("@/pages/advisors/AdvisorCouncilDashboard")],
  ["AdvisorRegistry", () => import("@/pages/advisors/AdvisorRegistry")],
  ["AIEconomicsPage", () => import("@/pages/AIEconomicsPage")],
  ["AIWorkforcePage", () => import("@/pages/AIWorkforcePage")],
  ["DigitalTwinsPage", () => import("@/pages/DigitalTwinsPage")],
  ["GovernanceDashboard", () => import("@/pages/GovernanceDashboard")],
  ["TrustCenter", () => import("@/pages/TrustCenter")],
  ["ProofCenter", () => import("@/pages/ProofCenter")],
  ["PolicyEditor", () => import("@/pages/PolicyEditor")],
  ["PolicySimulatorHub", () => import("@/pages/PolicySimulatorHub")],
  ["ScenarioLabPage", () => import("@/pages/ScenarioLabPage")],
  ["WorkflowReplayHub", () => import("@/pages/WorkflowReplayHub")],
  ["WorkflowsCenter", () => import("@/pages/WorkflowsCenter")],
  ["ObservabilityPage", () => import("@/pages/ObservabilityPage")],
  ["OutcomeEnginePage", () => import("@/pages/OutcomeEnginePage")],
  ["EnterpriseMaturityDashboard", () => import("@/pages/EnterpriseMaturityDashboard")],
  ["ServiceArchitectureDashboard", () => import("@/pages/ServiceArchitectureDashboard")],
  ["AgentActivityDashboard", () => import("@/pages/AgentActivityDashboard")],
  ["RecoveryCenter", () => import("@/pages/RecoveryCenter")],
  ["ApprovalChamber", () => import("@/pages/ApprovalChamber")],
  ["ApprovalsCenter", () => import("@/pages/ApprovalsCenter")],
  ["AutomationCenter", () => import("@/pages/AutomationCenter")],
  ["ConnectorHub", () => import("@/pages/ConnectorHub")],
  ["IntegrationConcierge", () => import("@/pages/IntegrationConcierge")],
] as const;

describe("Intelligence & System Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
