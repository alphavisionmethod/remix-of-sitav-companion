import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AppointmentsScheduling", () => import("@/pages/business/AppointmentsScheduling")],
  ["BackgroundTaskCenter", () => import("@/pages/business/BackgroundTaskCenter")],
  ["BusinessAdvisorBoardPage", () => import("@/pages/business/BusinessAdvisorBoardPage")],
  ["BusinessDocuments", () => import("@/pages/business/BusinessDocuments")],
  ["BusinessOperations", () => import("@/pages/business/BusinessOperations")],
  ["BusinessSettingsPage", () => import("@/pages/business/BusinessSettingsPage")],
  ["CRMAdvisorPage", () => import("@/pages/business/CRMAdvisorPage")],
  ["CRMAutomations", () => import("@/pages/business/CRMAutomations")],
  ["CRMCommunications", () => import("@/pages/business/CRMCommunications")],
  ["CRMCompanies", () => import("@/pages/business/CRMCompanies")],
  ["CRMContacts", () => import("@/pages/business/CRMContacts")],
  ["CRMCustomFieldsPage", () => import("@/pages/business/CRMCustomFieldsPage")],
  ["CRMDuplicates", () => import("@/pages/business/CRMDuplicates")],
  ["CRMHealth", () => import("@/pages/business/CRMHealth")],
  ["CRMHome", () => import("@/pages/business/CRMHome")],
  ["CRMImportCenter", () => import("@/pages/business/CRMImportCenter")],
  ["CRMIntegrationHub", () => import("@/pages/business/CRMIntegrationHub")],
  ["CRMNotes", () => import("@/pages/business/CRMNotes")],
  ["CRMPipeline", () => import("@/pages/business/CRMPipeline")],
  ["CRMSegments", () => import("@/pages/business/CRMSegments")],
  ["CRMTasks", () => import("@/pages/business/CRMTasks")],
  ["CRMTimeline", () => import("@/pages/business/CRMTimeline")],
  ["CustomerSupportCenter", () => import("@/pages/business/CustomerSupportCenter")],
  ["DealRoom", () => import("@/pages/business/DealRoom")],
  ["EcommerceManager", () => import("@/pages/business/EcommerceManager")],
  ["EndOfDayClosure", () => import("@/pages/business/EndOfDayClosure")],
  ["FollowThroughCenter", () => import("@/pages/business/FollowThroughCenter")],
  ["LeadRecovery", () => import("@/pages/business/LeadRecovery")],
  ["MorningBriefing", () => import("@/pages/business/MorningBriefing")],
  ["ProposalsContracts", () => import("@/pages/business/ProposalsContracts")],
  ["RelationshipDossier", () => import("@/pages/business/RelationshipDossier")],
  ["SocialCommand", () => import("@/pages/business/SocialCommand")],
  ["StrategicAccountRoom", () => import("@/pages/business/StrategicAccountRoom")],
  ["WebsiteBuilder", () => import("@/pages/business/WebsiteBuilder")],
] as const;

describe("Business Pages Remaining", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
