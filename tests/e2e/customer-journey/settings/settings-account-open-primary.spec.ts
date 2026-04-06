// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Settings Account Open
// [journey:settings.account] [mode:real]
// Verifies settings route, account controls render
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { assertNoErrorState, assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("P0 — Settings Account Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("settings.account", "/settings", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:settings.account] [mode:real] Settings page loads", async ({ page }) => {
    await recorder.recordStep("Navigate to settings", async () => {
      await navigateTo(page, "/settings");
    });

    await recorder.recordStep("Page has content", async () => {
      await assertPageHasContent(page);
    });

    await recorder.recordStep("No fatal errors", async () => {
      await assertNoErrorState(page);
    });

    await recorder.recordStep("Account controls or identity info visible", async () => {
      const controls = page.locator(
        "[data-testid='account-controls'], [data-testid='settings-page'], form, [data-testid='settings-save']"
      );
      await expect(controls.first()).toBeVisible({ timeout: 5000 });
    });
  });
});
