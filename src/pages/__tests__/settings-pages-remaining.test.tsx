import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AccessibilitySettings", () => import("@/pages/settings/AccessibilitySettings")],
  ["DeviceSettings", () => import("@/pages/settings/DeviceSettings")],
  ["MyPlanUsage", () => import("@/pages/settings/MyPlanUsage")],
  ["TrustedDeviceManager", () => import("@/pages/settings/TrustedDeviceManager")],
  ["UserCloudSettings", () => import("@/pages/settings/UserCloudSettings")],
] as const;

describe("Settings Pages Remaining", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
