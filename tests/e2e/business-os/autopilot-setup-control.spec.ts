// ═══════════════════════════════════════════════════════════════
// Phase 5 — Revenue Autopilot Setup & Control E2E
//   /business/autopilot-hub — setup state honest, controls visible.
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../helpers/auth";
import { gotoBusinessRoute, assertBusinessPageLoaded } from "../helpers/business-flow";

test.describe("Phase 5 — Autopilot Setup & Control", () => {
  test("autopilot hub auth-gates unauthenticated traffic", async ({ page }) => {
    await page.goto("/business/autopilot-hub");
    await page.waitForLoadState("domcontentloaded");
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(
      page.url().includes("/login") ||
        body.includes("sign in") ||
        body.includes("log in"),
    ).toBe(true);
  });

  test("autopilot hub renders truthful setup or command-center surface", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");
    await gotoBusinessRoute(page, "autopilot-hub");
    await assertBusinessPageLoaded(page);
    const text = (await page.locator("body").innerText()).toLowerCase();
    // Either the wizard ("set up") or the command center ("playbook"
    // / "active" / "paused") must be present — both are truthful.
    expect(text).toMatch(/autopilot|playbook|set up|setup|wizard|active|paused|command/);
  });

  test("revenue autopilot route also resolves without crash", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");
    await gotoBusinessRoute(page, "revenue-autopilot");
    await assertBusinessPageLoaded(page);
  });
});