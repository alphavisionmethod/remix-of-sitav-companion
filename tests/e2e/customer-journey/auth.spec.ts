// ═══════════════════════════════════════════════════════
// SITA OS — P0 Customer Journey: Auth
// [journey:auth.sign_in] [journey:auth.logout] [journey:auth.session_persistence]
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login, logout } from "../helpers/auth";
import { SEL } from "../helpers/selectors";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Auth Journeys", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  test("[journey:auth.sign_in] [mode:real] Sign in completes", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator(SEL.LOGIN_EMAIL)).toBeVisible({ timeout: 10000 });
    await login(page);
    // Should be on dashboard, not login
    expect(page.url()).not.toContain("/login");
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
  });

  test("[journey:auth.logout] [mode:real] Sign out works", async ({ page }) => {
    await login(page);
    await logout(page);
    expect(page.url()).toContain("/login");
  });

  test("[journey:auth.session_persistence] [mode:real] Session survives refresh", async ({ page }) => {
    await login(page);
    const urlBefore = page.url();
    await page.reload();
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    expect(page.url()).not.toContain("/login");
  });
});
