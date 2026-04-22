import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AIWebTeam", () => import("@/pages/digital-presence/AIWebTeam")],
  ["AppExperienceStudio", () => import("@/pages/digital-presence/AppExperienceStudio")],
  ["BrandStudio", () => import("@/pages/digital-presence/BrandStudio")],
  ["CROOffice", () => import("@/pages/digital-presence/CROOffice")],
  ["ConnectedSites", () => import("@/pages/digital-presence/ConnectedSites")],
  ["ContentFreshness", () => import("@/pages/digital-presence/ContentFreshness")],
  ["DPOOnboarding", () => import("@/pages/digital-presence/DPOOnboarding")],
  ["DomainPublishManager", () => import("@/pages/digital-presence/DomainPublishManager")],
  ["EcommerceOffice", () => import("@/pages/digital-presence/EcommerceOffice")],
  ["ErrorRadar", () => import("@/pages/digital-presence/ErrorRadar")],
  ["LaunchWarRoom", () => import("@/pages/digital-presence/LaunchWarRoom")],
  ["PresenceAnalytics", () => import("@/pages/digital-presence/PresenceAnalytics")],
  ["PresenceBoardroom", () => import("@/pages/digital-presence/PresenceBoardroom")],
  ["PresenceGate", () => import("@/pages/digital-presence/PresenceGate")],
  ["PresenceTimeMachine", () => import("@/pages/digital-presence/PresenceTimeMachine")],
  ["PromotionsOffice", () => import("@/pages/digital-presence/PromotionsOffice")],
  ["SelfHealingQueue", () => import("@/pages/digital-presence/SelfHealingQueue")],
  ["SiteBuilder", () => import("@/pages/digital-presence/SiteBuilder")],
  ["WebsiteTwin", () => import("@/pages/digital-presence/WebsiteTwin")],
] as const;

describe("Digital Presence Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
