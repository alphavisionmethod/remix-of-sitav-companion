// ═══════════════════════════════════════════════════════
// SITA OS — Playwright E2E Test: Auth Journeys (P0)
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Auth Journeys", () => {
  test("Login page renders with form", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("input[type='email'], input[placeholder*='email' i]")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();
  });

  test("Signup page renders with form", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await expect(page.locator("input[type='email'], input[placeholder*='email' i]")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("Forgot password page renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await expect(page.locator("input[type='email'], input[placeholder*='email' i]")).toBeVisible({ timeout: 10000 });
  });

  test("Login with invalid credentials shows error", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator("input[type='email'], input[placeholder*='email' i]").fill("invalid@test.com");
    await page.locator("input[type='password']").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    // Should show error toast or message
    await expect(page.locator("[role='alert'], [data-sonner-toast], .text-destructive").first()).toBeVisible({ timeout: 10000 });
  });

  test("Unauthenticated access redirects to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForURL(/\/(login|signup)/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });
});
