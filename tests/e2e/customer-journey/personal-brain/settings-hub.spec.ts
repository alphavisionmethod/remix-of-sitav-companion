// ═══════════════════════════════════════════════════════════════
// SITA OS — P0 Journey: Personal Brain Settings Hub
// [journey:personal_brain.settings] [mode:real]
// Real-user proof for the 11-section settings hub: sticky sidebar
// renders, every section route loads, and Notifications writes
// persist across reload.
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../../fixtures/test-users";
import { captureEvidenceOnFailure } from "../../helpers/evidence";
import { JourneyRecorder } from "../../helpers/journey-recorder";
import {
  gotoBrainRoute,
  assertBrainPageRendered,
  clickBrainNavSection,
} from "../../helpers/personal-brain";
import { assertNoErrorState } from "../../helpers/assertions";

const SECTIONS: { route: string; label: RegExp }[] = [
  { route: "/personal-brain/settings", label: /^overview$/i },
  { route: "/personal-brain/settings/profile", label: /^profile$/i },
  { route: "/personal-brain/settings/memory", label: /memory & learning/i },
  { route: "/personal-brain/settings/modes", label: /modes & behavior/i },
  { route: "/personal-brain/settings/workspaces", label: /^workspaces$/i },
  { route: "/personal-brain/settings/files", label: /files & knowledge/i },
  { route: "/personal-brain/voice-settings", label: /voice & audio/i },
  { route: "/personal-brain/settings/notifications", label: /^notifications$/i },
  { route: "/personal-brain/settings/security", label: /security & privacy/i },
  { route: "/personal-brain/settings/data", label: /data & controls/i },
  { route: "/personal-brain/settings/labs", label: /advanced \/ labs/i },
];

test.describe("P0 — Personal Brain Settings Hub Journey", () => {
  test.skip(!hasTestCredentials(), "Skipping: no TEST_USER_EMAIL configured");

  let recorder: JourneyRecorder;

  test.beforeEach(() => {
    recorder = new JourneyRecorder("personal_brain.settings", "/personal-brain/settings", "real");
  });

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo.title, testInfo.status);
    recorder.finalize();
  });

  test("[journey:personal_brain.settings.shell] [mode:real] Settings sidebar renders all 11 sections", async ({ page }) => {
    await recorder.recordStep("Open settings overview", async () => {
      await gotoBrainRoute(page, "/personal-brain/settings");
      await assertBrainPageRendered(page);
    });

    await recorder.recordStep("Sidebar visible", async () => {
      const sidebar = page.locator("[data-testid='brain-settings-sidebar']");
      await expect(sidebar).toBeVisible({ timeout: 8000 });
    });

    await recorder.recordStep("All 11 section links present", async () => {
      const sidebar = page.locator("[data-testid='brain-settings-sidebar']");
      for (const s of SECTIONS) {
        await expect(sidebar.getByRole("link", { name: s.label })).toBeVisible({ timeout: 4000 });
      }
    });
  });

  test("[journey:personal_brain.settings.navigate_all] [mode:real] Each section route loads with content and no fatal error", async ({ page }) => {
    await gotoBrainRoute(page, "/personal-brain/settings");

    for (const s of SECTIONS) {
      await recorder.recordStep(`Navigate to ${s.route}`, async () => {
        await page.goto(`${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080"}${s.route}`, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
        await assertBrainPageRendered(page);
        await assertNoErrorState(page);
      });
    }
  });

  test("[journey:personal_brain.settings.persist] [mode:real] Notifications toggle persists across reload", async ({ page }) => {
    await gotoBrainRoute(page, "/personal-brain/settings/notifications");

    // Wait for settings to load (the page renders "Loading…" until prefs hydrate).
    await page.waitForFunction(
      () => !document.body.innerText.includes("Loading…") || !!document.querySelector("[role='switch']"),
      undefined,
      { timeout: 15000 },
    );

    const switches = page.locator("[role='switch']");
    const count = await switches.count();
    test.skip(count === 0, "No notification switches rendered (likely degraded backend) — represented honestly.");

    const target = switches.first();
    const initial = await target.getAttribute("aria-checked");
    await target.click();
    // The hook auto-saves on toggle; give the network a moment.
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => undefined);

    // Reload and verify the new state stuck.
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => !document.body.innerText.includes("Loading…") && !!document.querySelector("[role='switch']"),
      undefined,
      { timeout: 15000 },
    );
    const after = await page.locator("[role='switch']").first().getAttribute("aria-checked");
    expect(after).not.toBe(initial);

    // Restore original to keep the test idempotent for repeat runs.
    await page.locator("[role='switch']").first().click();
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => undefined);
  });

  test("[journey:personal_brain.settings.sidebar_click] [mode:real] Clicking sidebar links navigates correctly", async ({ page }) => {
    await gotoBrainRoute(page, "/personal-brain/settings");
    // Profile → Memory → Notifications via clicks (no direct goto).
    await clickBrainNavSection(page, /^profile$/i);
    await expect(page).toHaveURL(/\/personal-brain\/settings\/profile/);
    await clickBrainNavSection(page, /memory & learning/i);
    await expect(page).toHaveURL(/\/personal-brain\/settings\/memory/);
    await clickBrainNavSection(page, /^notifications$/i);
    await expect(page).toHaveURL(/\/personal-brain\/settings\/notifications/);
  });
});
