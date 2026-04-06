// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Test: Settings
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("should load settings page", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should load system health dashboard", async ({ page }) => {
    await page.goto("/admin/system-health");
    await expect(page.locator("body")).toBeVisible();
  });
});
