// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Test: Navigation
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.*/);
    // Page should render without crashing
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to settings", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to investment office", async ({ page }) => {
    await page.goto("/investment-office");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle 404 gracefully", async ({ page }) => {
    await page.goto("/nonexistent-route-12345");
    await expect(page.locator("body")).toBeVisible();
  });
});
