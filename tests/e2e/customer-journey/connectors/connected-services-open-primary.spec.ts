// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Connected Services Open
// [journey:connectors.open] [mode:real]
// Verifies connectors route, service cards, status badges
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { assertNoErrorState, assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("P0 — Connected Services Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("connectors.open", "/connector-hub", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:connectors.open] [mode:real] Connected services page loads", async ({ page }) => {
    await recorder.recordStep("Navigate to connector hub", async () => {
      await navigateTo(page, "/connector-hub");
    });

    await recorder.recordStep("Page has content", async () => {
      await assertPageHasContent(page);
    });

    await recorder.recordStep("No fatal errors", async () => {
      await assertNoErrorState(page);
    });

    await recorder.recordStep("Service cards or status indicators visible", async () => {
      const cards = page.locator(
        "[data-testid='connector-card'], [data-testid*='connector'], [class*='card'], [role='article']"
      );
      const count = await cards.count();
      // At minimum, page should show connectors or an honest empty/planned state
      if (count === 0) {
        const body = await page.textContent("body");
        const hasHonestState = body?.match(/planned|coming soon|no connectors|unavailable/i);
        expect(hasHonestState).toBeTruthy();
      }
    });
  });
});
