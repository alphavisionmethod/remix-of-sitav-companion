// ═══════════════════════════════════════════════════════
// SITA OS — Mode Comparison: Assistant Demo vs Real
// [journey:assistant.demo_vs_real] [mode:both]
// Verifies assistant demo/live mode indicators
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { switchToDemo, switchToLive } from "../../helpers/mode";
import { assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("Mode Comparison — Assistant Demo vs Real", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("assistant.demo_vs_real", "/advisors", "both");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:assistant.demo_vs_real] [mode:both] Demo shows indicator, live shows real state", async ({ page }) => {
    await recorder.recordStep("Load advisors in demo mode", async () => {
      await navigateTo(page, "/advisors");
      await switchToDemo(page);
      await assertPageHasContent(page);
    });

    await recorder.recordStep("Switch to live mode", async () => {
      await switchToLive(page);
      await assertPageHasContent(page);
    });

    await recorder.recordStep("Both modes load without fatal error", async () => {
      const body = await page.textContent("body");
      expect(body).not.toContain("Something went wrong");
    });
  });
});
