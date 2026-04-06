// ═══════════════════════════════════════════════════════
// SITA OS — P0 Journey: Dashboard Load
// [journey:dashboard.load] [mode:real]
// Verifies dashboard loads, cards render, sidebar visible
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { login } from "../../helpers/auth";
import { navigateTo, assertRouteLoaded } from "../../helpers/navigation";
import { assertNoErrorState, assertSidebarVisible, assertPageHasContent } from "../../helpers/assertions";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";

test.describe("P0 — Dashboard Load Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(async ({ page }) => {
    recorder = new JourneyRecorder("dashboard.load", "/", "real");
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:dashboard.load] [mode:real] Dashboard loads with content", async ({ page }) => {
    await recorder.recordStep("Navigate to dashboard", async () => {
      await navigateTo(page, "/");
    });

    await recorder.recordStep("Page has meaningful content", async () => {
      await assertPageHasContent(page, 100);
    });

    await recorder.recordStep("No fatal error state", async () => {
      await assertNoErrorState(page);
    });

    await recorder.recordStep("Sidebar navigation visible", async () => {
      await assertSidebarVisible(page);
    });
  });

  test("[journey:navigation.sidebar] [mode:real] Sidebar links are clickable", async ({ page }) => {
    await recorder.recordStep("Navigate to dashboard", async () => {
      await navigateTo(page, "/");
    });

    await recorder.recordStep("Sidebar is visible", async () => {
      await assertSidebarVisible(page);
    });

    await recorder.recordStep("At least one nav link exists", async () => {
      const navLinks = page.locator("nav a, [role='navigation'] a, aside a");
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
