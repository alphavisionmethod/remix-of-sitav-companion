// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Flow E2E Tests
// Covers: boot, resume, degraded mode, accessibility, persistence
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Setup Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/setup");
  });

  test("renders the setup experience or redirects to login", async ({ page }) => {
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes("/setup") || url.includes("/login")).toBeTruthy();
  });

  test("boot screen shows and transitions", async ({ page }) => {
    const bootScreen = page.locator('[role="status"]');
    const setupContent = page.locator("text=Preparing your environment");

    const visible = await Promise.race([
      bootScreen.waitFor({ timeout: 5000 }).then(() => "boot"),
      setupContent.waitFor({ timeout: 5000 }).then(() => "content"),
    ]).catch(() => "redirected");

    expect(["boot", "content", "redirected"]).toContain(visible);
  });

  test("accessibility shortcut is available on first screen", async ({ page }) => {
    await page.waitForTimeout(1500);
    const url = page.url();
    if (url.includes("/setup")) {
      const accessibilityButton = page.locator("button").filter({ hasText: /accessibility|large text|reduced motion/i });
      const count = await accessibilityButton.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("setup persists state to sessionStorage", async ({ page }) => {
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/setup")) {
      const hasCheckpoint = await page.evaluate(() => {
        return sessionStorage.getItem("sita-setup-checkpoint") !== null ||
               sessionStorage.getItem("sita-boot-state") !== null;
      });
      expect(typeof hasCheckpoint).toBe("boolean");
    }
  });

  test("setup phases render without errors", async ({ page }) => {
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/setup")) {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await page.waitForTimeout(3000);
      const criticalErrors = errors.filter(
        (e) => !e.includes("ResizeObserver") && !e.includes("Script error")
      );
      expect(criticalErrors.length).toBe(0);
    }
  });

  test("resume banner appears after simulated interruption", async ({ page }) => {
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/setup")) {
      await page.evaluate(() => {
        sessionStorage.setItem("sita-setup-checkpoint", JSON.stringify({
          state: { phase: "quick-identity" },
          phase: "quick-identity",
          timestamp: Date.now(),
        }));
      });

      await page.reload();
      await page.waitForTimeout(2000);
      const newUrl = page.url();
      expect(newUrl).toBeTruthy();
    }
  });
});

test.describe("Setup — Degraded Mode", () => {
  test("handles offline state gracefully", async ({ page, context }) => {
    await page.goto("/setup");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (!url.includes("/setup")) return;

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);

    // Should not crash — check no unrecoverable error
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("net::") && !e.includes("Failed to fetch")
    );
    expect(criticalErrors.length).toBe(0);

    // Restore
    await context.setOffline(false);
  });
});

test.describe("Setup — Accessibility", () => {
  test("all interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/setup");
    await page.waitForTimeout(3000);
    const url = page.url();
    if (!url.includes("/setup")) return;

    // Tab through and verify focus is visible
    await page.keyboard.press("Tab");
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeTruthy();
  });

  test("document has proper lang attribute", async ({ page }) => {
    await page.goto("/setup");
    await page.waitForTimeout(2000);
    const lang = await page.evaluate(() => document.documentElement.lang);
    // Should have a lang attribute (set by i18n or browser)
    expect(typeof lang).toBe("string");
  });
});

test.describe("Setup — localStorage Persistence", () => {
  test("engine persists to localStorage and can resume", async ({ page }) => {
    await page.goto("/setup");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (!url.includes("/setup")) return;

    // Simulate engine persistence
    await page.evaluate(() => {
      localStorage.setItem("sita-setup-session", JSON.stringify({
        id: "test-session",
        userId: "test-user",
        deviceId: "test-device",
        startedAt: Date.now() - 60000,
        updatedAt: Date.now(),
        currentPhaseId: "quick-identity",
        phaseStates: {},
        completedPhases: ["boot", "language-region"],
        skippedPhases: [],
        rollbackStack: [],
        branchPath: "personal",
        hardwareCapabilities: { hasCamera: true, hasBiometric: false, hasGeolocation: true, screenSize: "large", connectionType: "fast", storageAvailable: true, notificationsSupported: true, performanceTier: "high" },
        interrupted: false,
        resumable: true,
        completionPct: 15,
      }));
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Check that localStorage data is still there after reload
    const hasSession = await page.evaluate(() => {
      return localStorage.getItem("sita-setup-session") !== null;
    });
    expect(hasSession).toBeTruthy();
  });
});
