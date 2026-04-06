// ═══════════════════════════════════════════════════════
// SITA OS — P1 Customer Journey: Settings
// [journey:settings.account]
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login } from "../helpers/auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P1 — Settings Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("[journey:settings.account] [mode:real] Settings page loads", async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
  });
});
