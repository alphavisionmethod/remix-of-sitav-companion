// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Test: File Management
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("File Management", () => {
  test("should load files page", async ({ page }) => {
    await page.goto("/files");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should load workspace documents page", async ({ page }) => {
    await page.goto("/workspace/docs");
    await expect(page.locator("body")).toBeVisible();
  });
});
