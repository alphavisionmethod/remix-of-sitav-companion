// ═══════════════════════════════════════════════════════
// SITA OS — P0 Customer Journey: Boardroom
// [journey:boardroom.open]
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login } from "../helpers/auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Boardroom Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("[journey:boardroom.open] [mode:real] Boardroom page loads", async ({ page }) => {
    await page.goto(`${BASE}/boardroom`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
  });
});
