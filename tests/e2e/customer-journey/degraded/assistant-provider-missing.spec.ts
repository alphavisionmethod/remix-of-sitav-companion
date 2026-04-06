// ═══════════════════════════════════════════════════════
// SITA OS — Degraded Journey: Assistant Provider Missing
// [journey:assistant.degraded] [mode:real]
// Verifies honest degraded state when provider unavailable
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo } from "../../helpers/navigation";
import { switchToLive } from "../../helpers/mode";
import { assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("Degraded — Assistant Provider Missing", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("assistant.degraded", "/advisors", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:assistant.degraded] [mode:real] Shows honest degraded state", async ({ page }) => {
    await recorder.recordStep("Navigate to advisors in live mode", async () => {
      await navigateTo(page, "/advisors");
      await switchToLive(page);
    });

    await recorder.recordStep("Page loads without crash", async () => {
      await assertPageHasContent(page);
    });

    await recorder.recordStep("State is either functional or honestly degraded", async () => {
      const body = await page.textContent("body");
      // Should NOT have a silent crash — either working or showing honest status
      expect(body).not.toContain("Something went wrong");

      // Check for either a working chat interface or honest degraded messaging
      const chatInput = page.locator(
        "[data-testid='advisor-chat-input'], textarea, input[placeholder*='message' i]"
      );
      const degraded = page.locator(
        "[data-testid='degraded-banner'], [data-testid='advisor-degraded-banner'], [role='alert']"
      );
      const demoBadge = page.locator("[data-testid='demo-mode-badge']");

      const hasChat = await chatInput.first().isVisible({ timeout: 3000 }).catch(() => false);
      const hasDegraded = await degraded.first().isVisible({ timeout: 3000 }).catch(() => false);
      const hasDemo = await demoBadge.isVisible({ timeout: 2000 }).catch(() => false);

      // At least one honest state should be present
      expect(hasChat || hasDegraded || hasDemo).toBe(true);
    });
  });
});
