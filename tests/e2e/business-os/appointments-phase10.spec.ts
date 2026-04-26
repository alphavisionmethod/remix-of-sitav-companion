// ═══════════════════════════════════════════════════════════════
// Phase 5 — Appointments + Phase-10 surfaces E2E
//   /business/appointments — appointment list + calendar sync badge
//   /sign/:token — public signature page (token-gated, no auth redirect)
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../helpers/auth";
import { gotoBusinessRoute, assertBusinessPageLoaded } from "../helpers/business-flow";

test.describe("Phase 5 — Appointments + Phase 10", () => {
  test("/business/appointments auth-gates unauthenticated traffic", async ({ page }) => {
    await page.goto("/business/appointments");
    await page.waitForLoadState("domcontentloaded");
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(
      page.url().includes("/login") ||
        body.includes("sign in") ||
        body.includes("log in"),
    ).toBe(true);
  });

  test("public /sign/:token page does NOT redirect to login", async ({ page }) => {
    // The signature flow is intentionally token-gated, not auth-gated.
    // A signer is an external counterparty without an OS account.
    const token = "test-token-phase5-e2e";
    await page.goto(`/sign/${token}`);
    await page.waitForLoadState("domcontentloaded");
    // Must NOT redirect to /login — token-gated routes are public.
    expect(page.url()).not.toMatch(/\/login/);
    // Page must render some signature surface (loading, invalid token,
    // or document UI all count — they're truthful states for an
    // unknown token).
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text.length).toBeGreaterThan(20);
    expect(text).toMatch(/sign|signature|document|invalid|expired|loading|not found/);
  });

  test("authenticated appointments page renders calendar/sync surfaces", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");
    await gotoBusinessRoute(page, "appointments");
    await assertBusinessPageLoaded(page);
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).toMatch(/appointment|schedule|calendar|booking|no .* yet|empty/);
  });
});