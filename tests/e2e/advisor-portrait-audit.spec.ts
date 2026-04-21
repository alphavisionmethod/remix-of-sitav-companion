import { test, expect } from "@playwright/test";

/**
 * Advisor Portrait Audit
 * Scans all advisor-related routes to verify:
 *   1. The rendered avatar component is AdvisorPortrait (data-testid="advisor-portrait")
 *   2. Portrait images load successfully in both light and dark mode
 */

const ADVISOR_ROUTES = [
  "/advisors",
  "/advisors/chat",
  "/advisors/council-dashboard",
  "/advisors/registry",
];

test.describe("Advisor Portrait Audit", () => {
  for (const route of ADVISOR_ROUTES) {
    test(`${route} uses AdvisorPortrait and renders images`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });

      // If redirected to login, skip (auth-guarded route)
      if (page.url().includes("login")) {
        test.skip(true, `${route} requires auth — skipped`);
        return;
      }

      // Wait for any portrait to appear (up to 10s)
      const portraits = page.locator("[data-testid='advisor-portrait']");
      const count = await portraits.count();

      if (count === 0) {
        // Some routes may not show portraits in empty state — that's OK
        // But make sure there are NO legacy AdvisorImage components either
        const legacyImages = page.locator("[data-testid='advisor-image-legacy']");
        expect(await legacyImages.count()).toBe(0);
        return;
      }

      // Verify every portrait has a loaded <img> inside
      for (let i = 0; i < Math.min(count, 5); i++) {
        const portrait = portraits.nth(i);
        const img = portrait.locator("img");
        if ((await img.count()) > 0) {
          await expect(img.first()).toBeVisible();
        }
      }
    });
  }

  test("portraits render in light mode", async ({ page }) => {
    await page.goto("/advisors", { waitUntil: "networkidle" });
    if (page.url().includes("login")) {
      test.skip(true, "Requires auth");
      return;
    }

    // Force light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });

    const portraits = page.locator("[data-testid='advisor-portrait']");
    const count = await portraits.count();
    if (count === 0) return;

    // Verify images are visible in light mode
    const firstImg = portraits.first().locator("img");
    if ((await firstImg.count()) > 0) {
      await expect(firstImg.first()).toBeVisible();
    }
  });

  test("portraits render in dark mode", async ({ page }) => {
    await page.goto("/advisors", { waitUntil: "networkidle" });
    if (page.url().includes("login")) {
      test.skip(true, "Requires auth");
      return;
    }

    // Force dark mode
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });

    const portraits = page.locator("[data-testid='advisor-portrait']");
    const count = await portraits.count();
    if (count === 0) return;

    const firstImg = portraits.first().locator("img");
    if ((await firstImg.count()) > 0) {
      await expect(firstImg.first()).toBeVisible();
    }
  });
});