// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Test: AI Chat
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("AI Chat Surface", () => {
  test("should load AI advisor page", async ({ page }) => {
    await page.goto("/ai-advisor");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should load brain page", async ({ page }) => {
    await page.goto("/brain");
    await expect(page.locator("body")).toBeVisible();
  });
});
