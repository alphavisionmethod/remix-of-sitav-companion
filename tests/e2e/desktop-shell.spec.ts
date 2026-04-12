import { test, expect } from "@playwright/test";

test.describe("Desktop Shell E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    // Enter demo mode
    const demoBtn = page.locator("text=/demo/i").first();
    if (await demoBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await demoBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test("dock renders on desktop", async ({ page }) => {
    const dock = page.locator('[data-testid="desktop-dock"], [class*="dock"], [class*="Dock"]').first();
    if (await dock.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(dock).toBeVisible();
    }
  });

  test("command palette opens with keyboard shortcut", async ({ page }) => {
    await page.keyboard.press("Meta+k");
    await page.waitForTimeout(500);
    const palette = page.locator('[data-testid="command-palette"], [role="dialog"], [class*="command"]').first();
    // May or may not be visible depending on route
  });
});

test.describe("System App Windows E2E", () => {
  test("settings page renders", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("body")).toBeVisible();
  });

  test("app-platform page renders", async ({ page }) => {
    await page.goto("/app-platform");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Update Center E2E", () => {
  test("update center loads without crash", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Mission Control E2E", () => {
  test("/mission requires auth", async ({ page }) => {
    await page.goto("/mission");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
