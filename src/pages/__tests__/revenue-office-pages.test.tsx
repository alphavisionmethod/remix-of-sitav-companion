import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AutomationBuilder", () => import("@/pages/revenue-office/AutomationBuilder")],
  ["AutomationHealth", () => import("@/pages/revenue-office/AutomationHealth")],
  ["AutomationOffice", () => import("@/pages/revenue-office/AutomationOffice")],
  ["AutomationPolicy", () => import("@/pages/revenue-office/AutomationPolicy")],
  ["AutomationReceipts", () => import("@/pages/revenue-office/AutomationReceipts")],
  ["AutomationSimLab", () => import("@/pages/revenue-office/AutomationSimLab")],
  ["AutomationTemplates", () => import("@/pages/revenue-office/AutomationTemplates")],
  ["BookingCenter", () => import("@/pages/revenue-office/BookingCenter")],
  ["BusinessOnboarding", () => import("@/pages/revenue-office/BusinessOnboarding")],
  ["BusinessTimeMachine", () => import("@/pages/revenue-office/BusinessTimeMachine")],
  ["CallDesk", () => import("@/pages/revenue-office/CallDesk")],
  ["CampaignOrchestrator", () => import("@/pages/revenue-office/CampaignOrchestrator")],
  ["ChiefRevenueSynthesis", () => import("@/pages/revenue-office/ChiefRevenueSynthesis")],
  ["ClientOnboarding", () => import("@/pages/revenue-office/ClientOnboarding")],
  ["CommercialMemoryFeed", () => import("@/pages/revenue-office/CommercialMemoryFeed")],
  ["ConversionLab", () => import("@/pages/revenue-office/ConversionLab")],
  ["RevenueDecisionTheater", () => import("@/pages/revenue-office/RevenueDecisionTheater")],
  ["FormsBuilder", () => import("@/pages/revenue-office/FormsBuilder")],
  ["FunnelBuilder", () => import("@/pages/revenue-office/FunnelBuilder")],
  ["GrowthAdvisorBoard", () => import("@/pages/revenue-office/GrowthAdvisorBoard")],
  ["GrowthBoardroom", () => import("@/pages/revenue-office/GrowthBoardroom")],
  ["GrowthDNA", () => import("@/pages/revenue-office/GrowthDNA")],
  ["GrowthOperatingModes", () => import("@/pages/revenue-office/GrowthOperatingModes")],
  ["JourneyTwin", () => import("@/pages/revenue-office/JourneyTwin")],
  ["LeakDetector", () => import("@/pages/revenue-office/LeakDetector")],
  ["MembershipCourseOffice", () => import("@/pages/revenue-office/MembershipCourseOffice")],
  ["OffersWorkspace", () => import("@/pages/revenue-office/OffersWorkspace")],
  ["OpportunityBoard", () => import("@/pages/revenue-office/OpportunityBoard")],
  ["PipelineStudio", () => import("@/pages/revenue-office/PipelineStudio")],
  ["QuoteStudio", () => import("@/pages/revenue-office/QuoteStudio")],
  ["RelationshipCenter", () => import("@/pages/revenue-office/RelationshipCenter")],
  ["ReputationEngine", () => import("@/pages/revenue-office/ReputationEngine")],
  ["RetentionOffice", () => import("@/pages/revenue-office/RetentionOffice")],
  ["RevenueGate", () => import("@/pages/revenue-office/RevenueGate")],
  ["RevenueIntelligence", () => import("@/pages/revenue-office/RevenueIntelligence")],
  ["SegmentationEngine", () => import("@/pages/revenue-office/SegmentationEngine")],
  ["TrustPulse", () => import("@/pages/revenue-office/TrustPulse")],
  ["WhatBreaksGrowth", () => import("@/pages/revenue-office/WhatBreaksGrowth")],
  ["WhiteLabelOffice", () => import("@/pages/revenue-office/WhiteLabelOffice")],
] as const;

describe("Revenue Office Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
