import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["UAO05HealthReadiness", () => import("@/pages/admin/UAO05HealthReadiness")],
  ["UAO06DeviceTrust", () => import("@/pages/admin/UAO06DeviceTrust")],
  ["UAO07CrossSurfaceJourney", () => import("@/pages/admin/UAO07CrossSurfaceJourney")],
  ["UAO08AmbientLaunchReadiness", () => import("@/pages/admin/UAO08AmbientLaunchReadiness")],
  ["UserManagement", () => import("@/pages/admin/UserManagement")],
  ["WorkflowReplayAudit", () => import("@/pages/admin/WorkflowReplayAudit")],
] as const;

describe("Admin Pages Batch 14", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
