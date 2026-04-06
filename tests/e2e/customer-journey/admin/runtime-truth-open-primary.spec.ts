// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Admin Runtime Truth
// [journey:admin.runtime_truth] [mode:real]
// Verifies admin AI runtime dashboard loads
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { assertNoErrorState, assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("P0 — Admin Runtime Truth Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("admin.runtime_truth", "/admin/ai-runtime", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:admin.runtime_truth] [mode:real] AI Runtime dashboard loads", async ({ page }) => {
    await recorder.recordStep("Navigate to AI runtime", async () => {
      await navigateTo(page, "/admin/ai-runtime");
    });

    await recorder.recordStep("Page has content", async () => {
      await assertPageHasContent(page);
    });

    await recorder.recordStep("No fatal errors", async () => {
      await assertNoErrorState(page);
    });

    await recorder.recordStep("Dashboard widgets render", async () => {
      const widgets = page.locator(
        "[data-testid*='admin'], [data-testid*='widget'], [data-testid*='metric'], [class*='card']"
      );
      const count = await widgets.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
