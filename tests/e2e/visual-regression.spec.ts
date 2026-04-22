// ═══════════════════════════════════════════════════════
// SITA OS — Visual Regression: PageShell & Token Drift
// Captures screenshots of main pages and compares them
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

const VISUAL_PAGES = [
  { name: "login", path: "/login", auth: false },
  { name: "signup", path: "/signup", auth: false },
  { name: "forgot-password", path: "/forgot-password", auth: false },
];

// Pages requiring auth — these redirect to /login if unauthenticated,
// so we capture the redirected login page as a baseline.
const AUTH_PAGES = [
  { name: "home", path: "/" },
  { name: "business", path: "/business" },
  { name: "money", path: "/money" },
  { name: "files", path: "/files" },
  { name: "settings", path: "/settings" },
  { name: "boardroom", path: "/boardroom" },
  { name: "advisor", path: "/advisor" },
];

test.describe("Visual Regression — Public Pages", () => {
  for (const page of VISUAL_PAGES) {
    test(`${page.name} visual snapshot`, async ({ page: p }) => {
      await p.goto(page.path);
      await p.waitForLoadState("networkidle");
      await expect(p).toHaveScreenshot(`${page.name}.png`, {
        maxDiffPixelRatio: 0.02,
        threshold: 0.2,
        animations: "disabled",
      });
    });
  }
});

test.describe("Visual Regression — Auth-Gated Pages (redirect baseline)", () => {
  for (const page of AUTH_PAGES) {
    test(`${page.name} renders or redirects cleanly`, async ({ page: p }) => {
      await p.goto(page.path);
      await p.waitForLoadState("domcontentloaded");
      // Capture whatever renders (login redirect or the page itself)
      await p.waitForTimeout(1000);
      await expect(p).toHaveScreenshot(`${page.name}-gate.png`, {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: "disabled",
      });
    });
  }
});