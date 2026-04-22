import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AchievementsPage", () => import("@/pages/AchievementsPage")],
  ["AdminCenter", () => import("@/pages/AdminCenter")],
  ["AppStoreCenter", () => import("@/pages/AppStoreCenter")],
  ["CalmFocusMode", () => import("@/pages/CalmFocusMode")],
  ["ClipboardHistory", () => import("@/pages/ClipboardHistory")],
  ["CommandHistory", () => import("@/pages/CommandHistory")],
  ["CommunicationInbox", () => import("@/pages/CommunicationInbox")],
  ["DownloadsCenter", () => import("@/pages/DownloadsCenter")],
  ["EnvironmentSwitcher", () => import("@/pages/EnvironmentSwitcher")],
  ["FirstBootSetup", () => import("@/pages/FirstBootSetup")],
  ["GlobalBoardroom", () => import("@/pages/GlobalBoardroom")],
  ["MoneyOnboarding", () => import("@/pages/MoneyOnboarding")],
  ["NetworkUtility", () => import("@/pages/NetworkUtility")],
  ["Onboarding", () => import("@/pages/Onboarding")],
  ["PDFViewerWorkspace", () => import("@/pages/PDFViewerWorkspace")],
  ["PersonalLifeWorkspace", () => import("@/pages/PersonalLifeWorkspace")],
  ["PlanningCanvas", () => import("@/pages/PlanningCanvas")],
  ["PrintScanCenter", () => import("@/pages/PrintScanCenter")],
  ["SimulationEnginePage", () => import("@/pages/SimulationEnginePage")],
  ["SpreadsheetWorkspace", () => import("@/pages/SpreadsheetWorkspace")],
  ["StorageManager", () => import("@/pages/StorageManager")],
  ["TasksWorkflowsCenter", () => import("@/pages/TasksWorkflowsCenter")],
  ["TimeMachinePage", () => import("@/pages/TimeMachinePage")],
  ["UpdateCenter", () => import("@/pages/UpdateCenter")],
  ["WealthCommandCenter", () => import("@/pages/WealthCommandCenter")],
  ["WeeklyBoardroom", () => import("@/pages/WeeklyBoardroom")],
] as const;

describe("Root Pages Remaining", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
