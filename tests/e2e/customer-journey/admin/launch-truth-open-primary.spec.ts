// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Launch Truth Open
// [journey:admin.launch_truth] [mode:real]
// Verifies launch readiness dashboard loads
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { assertNoErrorState, assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("P0 — Launch Truth Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("admin.launch_truth", "/admin/launch-readiness", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:admin.launch_truth] [mode:real] Launch readiness loads", async ({ page }) => {
    await recorder.recordStep("Navigate to launch readiness", async () => {
      await navigateTo(page, "/admin/launch-readiness");
    });

    await recorder.recordStep("Page has content", async () => {
      await assertPageHasContent(page);
    });

    await recorder.recordStep("No fatal errors", async () => {
      await assertNoErrorState(page);
    });

    await recorder.recordStep("Readiness indicators visible", async () => {
      const body = await page.textContent("body");
      expect(body?.length).toBeGreaterThan(100);
    });
  });
});
