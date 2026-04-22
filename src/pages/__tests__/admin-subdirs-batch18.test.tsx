import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["JVC06PageLoadIntegrity", () => import("@/pages/admin/verification/JVC06PageLoadIntegrity")],
  ["JVC07FormVerificationCenter", () => import("@/pages/admin/verification/JVC07FormVerificationCenter")],
  ["JVC08ModalDrawerBoard", () => import("@/pages/admin/verification/JVC08ModalDrawerBoard")],
  ["JVC09KeyboardCommandBoard", () => import("@/pages/admin/verification/JVC09KeyboardCommandBoard")],
  ["JVC10RuntimeProbeCenter", () => import("@/pages/admin/verification/JVC10RuntimeProbeCenter")],
  ["JVC11JourneyReplay", () => import("@/pages/admin/verification/JVC11JourneyReplay")],
  ["JVC13InteractionDriftRadar", () => import("@/pages/admin/verification/JVC13InteractionDriftRadar")],
  ["JVC14LaunchInteractionGate", () => import("@/pages/admin/verification/JVC14LaunchInteractionGate")],
] as const;

describe("Admin Subdirs Batch 18", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
