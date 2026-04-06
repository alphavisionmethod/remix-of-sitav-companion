// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Tests: Demo Mode Activation
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Demo Mode", () => {
  test("activates demo mode via URL parameter", async ({ page }) => {
    await page.goto("/?demo=investor_scenario");
    await page.waitForLoadState("networkidle");

    // sessionStorage should have demo token
    const token = await page.evaluate(() => sessionStorage.getItem("sita-demo-token"));
    expect(token).toBe("investor_scenario");
  });

  test("demo token persists across navigations", async ({ page }) => {
    await page.goto("/?demo=test_pack");
    await page.waitForLoadState("networkidle");

    // Navigate away
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");

    const token = await page.evaluate(() => sessionStorage.getItem("sita-demo-token"));
    expect(token).toBe("test_pack");
  });

  test("demo mode can be cleared", async ({ page }) => {
    await page.goto("/?demo=test");
    await page.waitForLoadState("networkidle");

    // Clear via JS
    await page.evaluate(() => {
      sessionStorage.removeItem("sita-demo-token");
      sessionStorage.removeItem("sita-mode-override");
    });

    const token = await page.evaluate(() => sessionStorage.getItem("sita-demo-token"));
    expect(token).toBeNull();
  });
});
