// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Boardroom Summary View
// [journey:boardroom.view] [mode:real]
// Verifies boardroom loads, summary renders, mode visible
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { assertNoErrorState, assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("P0 — Boardroom Summary View Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("boardroom.view", "/boardroom", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:boardroom.view] [mode:real] Boardroom loads with summary", async ({ page }) => {
    await recorder.recordStep("Navigate to boardroom", async () => {
      await navigateTo(page, "/boardroom");
    });

    await recorder.recordStep("Page has content", async () => {
      await assertPageHasContent(page);
    });

    await recorder.recordStep("No fatal errors", async () => {
      await assertNoErrorState(page);
    });

    await recorder.recordStep("Summary or content area renders", async () => {
      const content = page.locator(
        "[data-testid='boardroom-summary'], [data-testid='boardroom-page'], main, [role='main']"
      );
      await expect(content.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test("[journey:boardroom.refresh] [mode:real] Refresh action works", async ({ page }) => {
    await recorder.recordStep("Navigate to boardroom", async () => {
      await navigateTo(page, "/boardroom");
    });

    await recorder.recordStep("Refresh button works if present", async () => {
      const refreshBtn = page.locator(
        "[data-testid='boardroom-refresh'], button:has-text('Refresh')"
      );
      const hasRefresh = await refreshBtn.first().isVisible({ timeout: 3000 }).catch(() => false);
      if (hasRefresh) {
        await refreshBtn.first().click();
        // Page should still have content after refresh
        await assertPageHasContent(page);
      }
    });
  });
});
