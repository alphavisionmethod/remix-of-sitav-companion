// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Tests: Authentication Flow
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("shows login page with form elements", async ({ page }) => {
    await page.goto("/auth");
    await expect(page).toHaveURL(/auth/);
    const form = page.locator("form").first();
    await expect(form).toBeVisible({ timeout: 15000 });
  });

  test("has email and password fields", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
  });

  test("validates empty submission", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible({ timeout: 5000 })) {
      await submitBtn.click();
      await expect(page).toHaveURL(/auth/);
    }
  });

  test("redirects unauthenticated users from protected routes", async ({ page }) => {
    await page.goto("/daily-pulse");
    await page.waitForLoadState("networkidle");
    // Should redirect to auth or show auth-gated content
    const url = page.url();
    const isAuth = url.includes("auth") || url.includes("login");
    const hasAuthForm = await page.locator("form").first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(isAuth || hasAuthForm).toBeTruthy();
  });
});
