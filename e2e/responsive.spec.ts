import { test, expect } from "@playwright/test";

test.describe("Responsive Design", () => {
  const pages = ["/", "/money", "/business"];

  for (const path of pages) {
    test(`${path} renders at mobile (375px)`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=Something went wrong")).not.toBeVisible();
      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
    });

    test(`${path} renders at desktop (1280px)`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=Something went wrong")).not.toBeVisible();
    });
  }
});
