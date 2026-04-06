// ═══════════════════════════════════════════════════════
// SITA OS — P0 Customer Journey: Dashboard
// [journey:dashboard.load]
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login } from "../helpers/auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Dashboard Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("[journey:dashboard.load] [mode:real] Dashboard loads with content", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(100);
    // Should not show error
    expect(body).not.toContain("Something went wrong");
  });

  test("[journey:navigation.sidebar] [mode:real] Sidebar nav visible", async ({ page }) => {
    await page.goto(`${BASE}/`);
    const nav = page.locator("nav, [role='navigation'], aside").first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });
});
