import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";



vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AIT01TeamOverview", () => import("@/pages/admin/AIT01TeamOverview")],
  ["AIT02RoleRegistry", () => import("@/pages/admin/AIT02RoleRegistry")],
  ["AIT03TaskInvocation", () => import("@/pages/admin/AIT03TaskInvocation")],
  ["AIT04to08Boards", () => import("@/pages/admin/AIT04to08Boards")],
  ["AIT05CostEfficiency", () => import("@/pages/admin/AIT05CostEfficiency").then(m => ({ default: (m as Record<string, unknown>).default || (m as Record<string, unknown>).AIT05CostEfficiency }))],
  ["AND01AndroidEcosystemCenter", () => import("@/pages/admin/AND01AndroidEcosystemCenter")],
  ["AND02WearOSExperience", () => import("@/pages/admin/AND02WearOSExperience")],
  ["AND03AndroidTrustApprovals", () => import("@/pages/admin/AND03AndroidTrustApprovals")],
  ["AND04AndroidHealthConsent", () => import("@/pages/admin/AND04AndroidHealthConsent")],
  ["AND05AndroidLaunchReadiness", () => import("@/pages/admin/AND05AndroidLaunchReadiness")],
  ["APL01AppleEcosystemCenter", () => import("@/pages/admin/APL01AppleEcosystemCenter")],
  ["APL02AppleDevicesTrust", () => import("@/pages/admin/APL02AppleDevicesTrust")],
  ["APL03AppleWatchExperience", () => import("@/pages/admin/APL03AppleWatchExperience")],
  ["APL04AppleIdentityAccounts", () => import("@/pages/admin/APL04AppleIdentityAccounts")],
  ["APL05AppleHealthConsent", () => import("@/pages/admin/APL05AppleHealthConsent")],
  ["APL06AppleLaunchReadiness", () => import("@/pages/admin/APL06AppleLaunchReadiness")],
  ["AR01AutomationOverview", () => import("@/pages/admin/AR01AutomationOverview")],
  ["AR02ScheduledJobRegistry", () => import("@/pages/admin/AR02ScheduledJobRegistry")],
  ["AR03SelfHealingBoard", () => import("@/pages/admin/AR03SelfHealingBoard")],
  ["AR04AgentScheduler", () => import("@/pages/admin/AR04AgentScheduler")],
  ["AR05SystemMaintenanceBoard", () => import("@/pages/admin/AR05SystemMaintenanceBoard")],
  ["AR06ExecutionTraceExplorer", () => import("@/pages/admin/AR06ExecutionTraceExplorer")],
  ["AR07RetryFailureCenter", () => import("@/pages/admin/AR07RetryFailureCenter")],
  ["AR08KillSwitchCenter", () => import("@/pages/admin/AR08KillSwitchCenter")],
  ["AR09AutomationLaunchGate", () => import("@/pages/admin/AR09AutomationLaunchGate")],
  ["ActionLineageExplorer", () => import("@/pages/admin/ActionLineageExplorer")],
  ["AdminMutationAudit", () => import("@/pages/admin/AdminMutationAudit")],
  ["AlertTriageBoard", () => import("@/pages/admin/AlertTriageBoard")],
  ["BuilderKnowledgeBase", () => import("@/pages/admin/BuilderKnowledgeBase")],
] as const;

function getComponent(mod: any) {
  return mod.default || Object.values(mod).find((v: unknown) => typeof v === "function");
}

describe("Admin Pages Batch 2", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = getComponent(mod);
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
