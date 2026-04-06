// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Customer Journey Report
// [journey:admin.cj_report] [mode:real]
// Verifies CJ executive report loads
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { assertNoErrorState, assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("P0 — CJ Executive Report Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("admin.cj_report", "/admin/customer-journey/executive", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:admin.cj_report] [mode:real] Executive report loads with stats", async ({ page }) => {
    await recorder.recordStep("Navigate to CJ executive report", async () => {
      await navigateTo(page, "/admin/customer-journey/executive");
    });

    await recorder.recordStep("Page has content", async () => {
      await assertPageHasContent(page);
    });

    await recorder.recordStep("No fatal errors", async () => {
      await assertNoErrorState(page);
    });

    await recorder.recordStep("Stats or summary widgets visible", async () => {
      const body = await page.textContent("body");
      expect(body?.length).toBeGreaterThan(100);
    });
  });
});
