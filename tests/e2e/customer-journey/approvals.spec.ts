// ═══════════════════════════════════════════════════════
// SITA OS — P0 Customer Journey: Approvals
// [journey:approvals.open]
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login } from "../helpers/auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Approvals Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("[journey:approvals.open] [mode:real] Approvals page loads", async ({ page }) => {
    await page.goto(`${BASE}/approvals`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body).not.toContain("Something went wrong");
  });
});
