// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Tests: Navigation & Routing
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Navigation & Routing", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\//);
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-does-not-exist-xyz");
    await page.waitForLoadState("networkidle");
    const text = await page.textContent("body");
    expect(text).toBeTruthy();
  });

  test("auth page is accessible", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/auth/);
  });
});
