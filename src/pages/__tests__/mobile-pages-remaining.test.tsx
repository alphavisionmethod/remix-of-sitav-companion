import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
});

const pages = [
  ["MobileAIChat", () => import("@/pages/mobile/MobileAIChat")],
  ["MobileBusiness", () => import("@/pages/mobile/MobileBusiness")],
  ["MobileCommand", () => import("@/pages/mobile/MobileCommand")],
  ["MobileConcierge", () => import("@/pages/mobile/MobileConcierge")],
  ["MobileDeviceTrust", () => import("@/pages/mobile/MobileDeviceTrust")],
  ["MobileEmergencyActions", () => import("@/pages/mobile/MobileEmergencyActions")],
  ["MobileFiles", () => import("@/pages/mobile/MobileFiles")],
  ["MobileInbox", () => import("@/pages/mobile/MobileInbox")],
  ["MobileInvestment", () => import("@/pages/mobile/MobileInvestment")],
  ["MobileMoney", () => import("@/pages/mobile/MobileMoney")],
  ["MobileMore", () => import("@/pages/mobile/MobileMore")],
  ["MobileNotificationCenter", () => import("@/pages/mobile/MobileNotificationCenter")],
  ["MobileQuickCapture", () => import("@/pages/mobile/MobileQuickCapture")],
  ["MobileSyncControl", () => import("@/pages/mobile/MobileSyncControl")],
  ["MobileSystemMonitor", () => import("@/pages/mobile/MobileSystemMonitor")],
  ["MobileTimeline", () => import("@/pages/mobile/MobileTimeline")],
] as const;

describe("Mobile Pages Remaining", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
