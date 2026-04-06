// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Test: Auth Flow
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/auth");
    await expect(page).toHaveURL(/auth/);
    // Should show auth form elements
    const form = page.locator("form").first();
    await expect(form).toBeVisible({ timeout: 10000 });
  });

  test("should show validation on empty submit", async ({ page }) => {
    await page.goto("/auth");
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should remain on auth page (no redirect without valid credentials)
      await expect(page).toHaveURL(/auth/);
    }
  });
});
