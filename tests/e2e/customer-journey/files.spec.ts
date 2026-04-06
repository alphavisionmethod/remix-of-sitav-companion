// ═══════════════════════════════════════════════════════
// SITA OS — P0 Customer Journey: Files
// [journey:files.browse] [journey:files.upload]
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login } from "../helpers/auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Files Journeys", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("[journey:files.browse] [mode:real] Files page loads", async ({ page }) => {
    await page.goto(`${BASE}/files`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
    expect(body).not.toContain("Something went wrong");
  });
});
