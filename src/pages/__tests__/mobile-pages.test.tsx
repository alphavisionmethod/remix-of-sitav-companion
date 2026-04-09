import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import { useDataMode } from "@/contexts/DataModeContext";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["MobileHome", () => import("@/pages/mobile/MobileHome")],
  ["MobileAlerts", () => import("@/pages/mobile/MobileAlerts")],
  ["MobileApprovals", () => import("@/pages/mobile/MobileApprovals")],
  ["MobileApprovalDetail", () => import("@/pages/mobile/MobileApprovalDetail")],
  ["MobileBoardroom", () => import("@/pages/mobile/MobileBoardroom")],
  ["MobileProof", () => import("@/pages/mobile/MobileProof")],
  ["MobileReceiptDetail", () => import("@/pages/mobile/MobileReceiptDetail")],
  ["MobileSettings", () => import("@/pages/mobile/MobileSettings")],
  ["MobileWorkflowDetail", () => import("@/pages/mobile/MobileWorkflowDetail")],
] as const;

describe("Mobile Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod = await loader();
      const Component = mod.default || Object.values(mod).find((v: Record<string, unknown>) => typeof v === "function");
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    });
  });
});
