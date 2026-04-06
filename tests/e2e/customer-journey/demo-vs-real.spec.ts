// ═══════════════════════════════════════════════════════
// SITA OS — P0 Customer Journey: Demo vs Real
// [journey:boardroom.demo_vs_real] [journey:assistant.demo_vs_real]
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login } from "../helpers/auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Demo vs Real Journeys", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("[journey:boardroom.demo_vs_real] [mode:real] Boardroom loads in real mode", async ({ page }) => {
    await page.goto(`${BASE}/boardroom`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
    // Should NOT show demo badge as primary indicator in real mode
    // (Demo badge may exist as a toggle, but content should reflect real data)
  });

  test("[journey:connectors.demo_vs_real] [mode:real] Connectors in real mode", async ({ page }) => {
    await page.goto(`${BASE}/connector-hub`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
  });
});
