// ═══════════════════════════════════════════════════════
// SITA OS — Playwright E2E Test: Interaction Verification (P0)
// Verifies clicks, forms, state changes on critical surfaces
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_PASS = process.env.TEST_USER_PASSWORD || "";

test.describe("P0 — Critical Interaction Tests", () => {
  test.skip(!TEST_EMAIL, "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator("input[type='email'], input[placeholder*='email' i]").fill(TEST_EMAIL);
    await page.locator("input[type='password']").fill(TEST_PASS);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
  });

  test("Sidebar navigation works", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    // Find and click a sidebar nav link
    const sidebar = page.locator("nav, [role='navigation'], aside").first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    // Click Business link
    const bizLink = page.getByRole("link", { name: /business/i }).first();
    if (await bizLink.isVisible()) {
      await bizLink.click();
      await page.waitForURL(/\/business/, { timeout: 10000 });
    }
  });

  test("Files page loads and shows content", async ({ page }) => {
    await page.goto(`${BASE_URL}/files`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    // Should show file list or empty state
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(100);
  });

  test("Boardroom page loads and shows cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/boardroom`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(100);
  });

  test("Approvals page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/approvals`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body).not.toContain("Something went wrong");
  });

  test("Verification Surface Inventory Board loads and shows data", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/verification/surfaces`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    // Should show the inventory table
    await expect(page.locator("[data-testid='verification-surface-inventory']")).toBeVisible({ timeout: 10000 });
    // Should show stats
    await expect(page.getByText(/Total/i).first()).toBeVisible();
  });

  test("Seed surfaces button works", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/verification/surfaces`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const seedBtn = page.getByRole("button", { name: /seed/i });
    if (await seedBtn.isVisible()) {
      await seedBtn.click();
      // Should show success toast
      await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("Launch Blocker Board shows status", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/verification/blockers`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await expect(page.locator("[data-testid='verification-launch-blockers']")).toBeVisible({ timeout: 10000 });
    // Should show either "Launch Ready" or "Launch Blocked"
    const body = await page.textContent("body");
    expect(body).toMatch(/Launch Ready|Launch Blocked/);
  });
});
