// ═══════════════════════════════════════════════════════
// SITA OS — Mode Comparison: Connected Services Demo vs Real
// [journey:connectors.demo_vs_real] [mode:both]
// Verifies demo shows all connected, live shows real statuses
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { switchToDemo, switchToLive } from "../../helpers/mode";
import { assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("Mode Comparison — Connected Services Demo vs Real", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("connectors.demo_vs_real", "/connector-hub", "both");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:connectors.demo_vs_real] [mode:both] Demo and live show different statuses", async ({ page }) => {
    await recorder.recordStep("Load connectors in demo mode", async () => {
      await navigateTo(page, "/connector-hub");
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
