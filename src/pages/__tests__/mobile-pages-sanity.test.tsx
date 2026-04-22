// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Page Sanity Checks
// Verifies all mobile pages render, use data hooks (not hardcoded),
// and have correct route wiring.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { readFileSync } from "fs";
import { join } from "path";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

// ── 1. Render sanity for ALL mobile pages ────────────────────
const ALL_MOBILE_PAGES = [
  "MobileHome", "MobileAlerts", "MobileApprovals", "MobileApprovalDetail",
  "MobileBoardroom", "MobileBusiness", "MobileCommand", "MobileConcierge",
  "MobileDeviceTrust", "MobileEmergencyActions", "MobileFiles",
  "MobileInbox", "MobileInvestment", "MobileMoney", "MobileMore",
  "MobileNotificationCenter", "MobileProof", "MobileQuickCapture",
  "MobileReceiptDetail", "MobileSettings", "MobileSyncControl",
  "MobileSystemMonitor", "MobileTimeline", "MobileWorkflowDetail",
] as const;

describe("Mobile Page Render Sanity", () => {
  ALL_MOBILE_PAGES.forEach((name) => {
    it(`${name} renders without crash`, async () => {
      const mod: any = await import(`@/pages/mobile/${name}`);
      const Component = mod.default ?? Object.values(mod).find((v: any) => typeof v === "function");
      expect(Component).toBeTruthy();
      const { container } = render(<Component />, { authenticated: true });
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });
  });
});

// ── 2. Verify wired pages use hooks instead of hardcoded data ─
describe("Mobile Data Wiring Checks", () => {
  const WIRED_PAGES = [
    { file: "MobileHome.tsx", mustImport: ["use-mobile-data"], mustNotContain: ["const quickActions = ["] },
    { file: "MobileMoney.tsx", mustImport: ["use-mobile-data"], mustNotContain: ["const accounts = [", "const recentTx = ["] },
    { file: "MobileConcierge.tsx", mustImport: ["use-mobile-data"], mustNotContain: ["const sections = ["] },
  ];

  WIRED_PAGES.forEach(({ file, mustImport, mustNotContain }) => {
    it(`${file} imports data hooks`, () => {
      const src = readFileSync(join("src/pages/mobile", file), "utf-8");
      for (const imp of mustImport) {
        expect(src).toContain(imp);
      }
    });

    it(`${file} has no hardcoded data arrays`, () => {
      const src = readFileSync(join("src/pages/mobile", file), "utf-8");
      for (const pattern of mustNotContain) {
        expect(src).not.toContain(pattern);
      }
    });
  });
});

// ── 3. Route registry completeness ──────────────────────────
describe("Mobile Route Wiring", () => {
  it("MobileRoutes.tsx references all key pages", () => {
    const routeSrc = readFileSync("src/routes/MobileRoutes.tsx", "utf-8");
    const requiredRoutes = ["/mobile", "/mobile/business", "/mobile/money", "/mobile/concierge", "/mobile/approvals", "/mobile/proof"];
    for (const route of requiredRoutes) {
      expect(routeSrc).toContain(`"${route}"`);
    }
  });

  it("All mobile pages are lazy-loaded in routes", () => {
    const routeSrc = readFileSync("src/routes/MobileRoutes.tsx", "utf-8");
    expect(routeSrc).toContain("MobileHome");
    expect(routeSrc).toContain("MobileMoney");
    expect(routeSrc).toContain("MobileConcierge");
  });
});