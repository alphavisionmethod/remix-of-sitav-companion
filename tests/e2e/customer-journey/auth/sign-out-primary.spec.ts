// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Sign Out Primary
// [journey:auth.sign_out] [mode:real]
// Verifies sign out → redirect → protected route blocked
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Sign Out Primary Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("auth.sign_out", "/", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:auth.sign_out] [mode:real] Sign out redirects to login", async ({ page }) => {
    await recorder.recordStep("Find sign out button", async () => {
      const signOutBtn = page.locator("[data-testid='sign-out-btn']");
      const roleBtn = page.getByRole("button", { name: /sign out|log out/i });
      const btn = (await signOutBtn.isVisible({ timeout: 3000 }).catch(() => false))
        ? signOutBtn
        : roleBtn;
      await expect(btn).toBeVisible({ timeout: 5000 });
    });

    await recorder.recordStep("Click sign out", async () => {
      const signOutBtn = page.locator("[data-testid='sign-out-btn']");
      const roleBtn = page.getByRole("button", { name: /sign out|log out/i });
      const btn = (await signOutBtn.isVisible({ timeout: 2000 }).catch(() => false))
        ? signOutBtn
        : roleBtn;
      await btn.click();
    });

    await recorder.recordStep("Redirected to login", async () => {
      await page.waitForURL(/\/login/, { timeout: 10000 });
      expect(page.url()).toContain("/login");
    });

    await recorder.recordStep("Protected route blocked after sign out", async () => {
      await page.goto(`${BASE}/boardroom`);
      await page.waitForURL(/\/login/, { timeout: 10000 });
      expect(page.url()).toContain("/login");
    });
  });
});
