import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test-id" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["BusinessCenter", () => import("@/pages/BusinessCenter")],
  ["BusinessOverview", () => import("@/pages/business/BusinessOverview")],
  ["BusinessBoardroom", () => import("@/pages/business/BusinessBoardroom")],
  ["BusinessProof", () => import("@/pages/business/BusinessProof")],
  ["CollectionsCommandCenter", () => import("@/pages/business/CollectionsCommandCenter")],
  ["CommunicationsCenter", () => import("@/pages/business/CommunicationsCenter")],
  ["CustomersPage", () => import("@/pages/business/CustomersPage")],
  ["InvoicesCollections", () => import("@/pages/business/InvoicesCollections")],
  ["LeadsInbox", () => import("@/pages/business/LeadsInbox")],
  ["OpportunitiesCenter", () => import("@/pages/business/OpportunitiesCenter")],
  ["PlaybookBuilder", () => import("@/pages/business/PlaybookBuilder")],
  ["QuotesWorkspace", () => import("@/pages/business/QuotesWorkspace")],
  ["RevenueAutopilot", () => import("@/pages/business/RevenueAutopilot")],
  ["RevenueForecast", () => import("@/pages/business/RevenueForecast")],
  ["RevenueImpactDashboard", () => import("@/pages/business/RevenueImpactDashboard")],
  ["AutopilotHub", () => import("@/pages/business/AutopilotHub")],
  ["RevenueCallingPage", () => import("@/pages/RevenueCallingPage")],
  ["CustomerDetail", () => import("@/pages/CustomerDetail")],
  ["CustomerHealthPage", () => import("@/pages/CustomerHealthPage")],
  ["OpportunityEngine", () => import("@/pages/OpportunityEngine")],
] as const;

describe("Business Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
