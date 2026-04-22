import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages: [string, () => Promise<any>][] = [
  ["AutomationSubNav", () => import("@/pages/revenue-office/AutomationSubNav")],
  ["FormationShell", () => import("@/pages/revenue-office/onboarding/FormationShell")],
  ["LiveOfficeSidebar", () => import("@/pages/revenue-office/onboarding/LiveOfficeSidebar")],
  ["primitives", () => import("@/pages/revenue-office/onboarding/primitives")],
  ["AcquisitionScreen", () => import("@/pages/revenue-office/onboarding/screens/AcquisitionScreen")],
  ["AdvisorActivationScreen", () => import("@/pages/revenue-office/onboarding/screens/AdvisorActivationScreen")],
  ["ArtifactScreen", () => import("@/pages/revenue-office/onboarding/screens/ArtifactScreen")],
  ["AutomationScreen", () => import("@/pages/revenue-office/onboarding/screens/AutomationScreen")],
  ["BranchingQuestionsPanel", () => import("@/pages/revenue-office/onboarding/screens/BranchingQuestionsPanel")],
  ["CeremonyScreen", () => import("@/pages/revenue-office/onboarding/screens/CeremonyScreen")],
  ["ConnectionsScreen", () => import("@/pages/revenue-office/onboarding/screens/ConnectionsScreen")],
  ["ConversionScreen", () => import("@/pages/revenue-office/onboarding/screens/ConversionScreen")],
  ["DeliveryScreen", () => import("@/pages/revenue-office/onboarding/screens/DeliveryScreen")],
  ["FileImportScreen", () => import("@/pages/revenue-office/onboarding/screens/FileImportScreen")],
  ["FirstWinScreen", () => import("@/pages/revenue-office/onboarding/screens/FirstWinScreen")],
  ["FrictionScreen", () => import("@/pages/revenue-office/onboarding/screens/FrictionScreen")],
  ["IdentityScreen", () => import("@/pages/revenue-office/onboarding/screens/IdentityScreen")],
  ["IntakeHubScreen", () => import("@/pages/revenue-office/onboarding/screens/IntakeHubScreen")],
  ["JourneyScreen", () => import("@/pages/revenue-office/onboarding/screens/JourneyScreen")],
  ["ReconciliationScreen", () => import("@/pages/revenue-office/onboarding/screens/ReconciliationScreen")],
  ["RevealScreen", () => import("@/pages/revenue-office/onboarding/screens/RevealScreen")],
  ["RevenueModelScreen", () => import("@/pages/revenue-office/onboarding/screens/RevenueModelScreen")],
  ["ShapeSummaryScreen", () => import("@/pages/revenue-office/onboarding/screens/ShapeSummaryScreen")],
  ["SitaInsightCallout", () => import("@/pages/revenue-office/onboarding/screens/SitaInsightCallout")],
  ["TeamScreen", () => import("@/pages/revenue-office/onboarding/screens/TeamScreen")],
  ["URLIntakeScreen", () => import("@/pages/revenue-office/onboarding/screens/URLIntakeScreen")],
];

describe("Revenue-Office Pages Remaining", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
