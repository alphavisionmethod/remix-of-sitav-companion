// ═══════════════════════════════════════════════════════
// SITA OS — P0 Customer Journey: Admin Boards
// [journey:admin.runtime_truth] [journey:admin.launch_readiness]
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login } from "../helpers/auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Admin Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("[journey:admin.runtime_truth] [mode:real] Admin truth board loads", async ({ page }) => {
    await page.goto(`${BASE}/admin/ai-runtime`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
  });

  test("[journey:admin.launch_readiness] [mode:real] CJ Executive report loads", async ({ page }) => {
    await page.goto(`${BASE}/admin/customer-journey/executive`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
  });
});
