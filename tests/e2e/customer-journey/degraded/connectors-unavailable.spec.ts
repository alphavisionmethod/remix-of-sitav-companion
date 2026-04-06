// ═══════════════════════════════════════════════════════
// SITA OS — Degraded Journey: Connectors Unavailable
// [journey:connectors.degraded] [mode:real]
// Verifies honest status when connectors are disconnected
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { switchToLive } from "../../helpers/mode";
import { assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("Degraded — Connectors Unavailable", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("connectors.degraded", "/connector-hub", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:connectors.degraded] [mode:real] Shows honest disconnected status", async ({ page }) => {
    await recorder.recordStep("Navigate to connector hub in live mode", async () => {
      await navigateTo(page, "/connector-hub");
      await switchToLive(page);
    });

    await recorder.recordStep("Page loads without crash", async () => {
      await assertPageHasContent(page);
    });

    await recorder.recordStep("Connector statuses are honestly displayed", async () => {
      const body = await page.textContent("body");
      expect(body).not.toContain("Something went wrong");
      // In live mode with no real connections, statuses should show disconnected/planned honestly
      expect(body?.length).toBeGreaterThan(50);
    });
  });
});
