// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Sign In Primary
// [journey:auth.sign_in] [mode:real]
// Verifies login form → submit → authenticated landing
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, TEST_USERS } from "../../fixtures/test-users";
import { navigateTo, assertRouteLoaded, assertOnRoute } from "../../helpers/navigation";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("P0 — Sign In Primary Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(() => {
    recorder = new JourneyRecorder("auth.sign_in", "/login", "real");
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:auth.sign_in] [mode:real] Login form loads with required fields", async ({ page }) => {
    await recorder.recordStep("Navigate to login", async () => {
      await navigateTo(page, "/login");
    });

    await recorder.recordStep("Email input visible", async () => {
      const emailInput = page.locator("input[type='email'], input[placeholder*='email' i]");
      await expect(emailInput).toBeVisible({ timeout: 5000 });
    });

    await recorder.recordStep("Password input visible", async () => {
      const passwordInput = page.locator("input[type='password']");
      await expect(passwordInput).toBeVisible({ timeout: 5000 });
    });

    await recorder.recordStep("Submit button visible and enabled", async () => {
      const submitBtn = page.getByRole("button", { name: /sign in|log in/i });
      await expect(submitBtn).toBeVisible({ timeout: 5000 });
      await expect(submitBtn).toBeEnabled();
    });
  });

  test("[journey:auth.sign_in] [mode:real] Full sign-in flow succeeds", async ({ page }) => {
    const user = TEST_USERS.primary;

    await recorder.recordStep("Navigate to login", async () => {
      await navigateTo(page, "/login");
    });

    await recorder.recordStep("Fill email", async () => {
      await page.locator("input[type='email'], input[placeholder*='email' i]").fill(user.email);
    });

    await recorder.recordStep("Fill password", async () => {
      await page.locator("input[type='password']").fill(user.password);
    });

    await recorder.recordStep("Click sign in", async () => {
      await page.getByRole("button", { name: /sign in|log in/i }).click();
    });

    await recorder.recordStep("Lands on authenticated route", async () => {
      await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
      expect(page.url()).not.toContain("/login");
      expect(page.url()).not.toContain("/signup");
    });

    await recorder.recordStep("No auth loop on refresh", async () => {
      const currentURL = page.url();
      await page.reload({ waitUntil: "networkidle" });
      expect(page.url()).not.toContain("/login");
    });
  });
});
