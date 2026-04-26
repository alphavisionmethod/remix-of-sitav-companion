// ═══════════════════════════════════════════════════════════════
// Phase 5 — Business Proof + Continuity Report E2E
//   /business/proof — receipt list surface
//   /business/continuity-report — runtime probes (honest unknown)
//
// Trust connection:
//   - The continuity-verification service (covered in Phase 2) MUST
//     surface honestly here. We assert no fake "all green" claim
//     when the page renders without seeded data.
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../helpers/auth";
import { gotoBusinessRoute, assertBusinessPageLoaded } from "../helpers/business-flow";

test.describe("Phase 5 — Business Proof Trail", () => {
  test("proof + continuity routes auth-gate unauthenticated traffic", async ({ page }) => {
    for (const seg of ["proof", "continuity-report"]) {
      await page.goto(`/business/${seg}`);
      await page.waitForLoadState("domcontentloaded");
      const body = (await page.locator("body").innerText()).toLowerCase();
      expect(
        page.url().includes("/login") ||
          body.includes("sign in") ||
          body.includes("log in"),
      ).toBe(true);
    }
  });

  test("proof page renders receipt list or honest empty state", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");
    await gotoBusinessRoute(page, "proof");
    await assertBusinessPageLoaded(page);
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).toMatch(/proof|receipt|evidence|no .* yet|nothing|empty/);
  });

  test("continuity report renders honest probe results", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");
    await gotoBusinessRoute(page, "continuity-report");
    await assertBusinessPageLoaded(page);
    const text = (await page.locator("body").innerText()).toLowerCase();
    // Must surface probe terminology — pass / fail / unknown / partial.
    expect(text).toMatch(/continuity|probe|status|pass|fail|unknown|partial|verified/);
    // Honesty guard: a page with no data should NOT pretend everything passed.
    const fakeAllGreen = /\ball systems\b.*\boperational\b/.test(text) && !/\bunknown\b|\bpartial\b/.test(text);
    expect(fakeAllGreen, "continuity report must not falsely claim all-green").toBe(false);
  });
});