import { test, expect } from "@playwright/test";

test.describe("Investment Journey", () => {
  test("/investment requires auth", async ({ page }) => {
    await page.goto("/investment");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/investment/portfolio requires auth", async ({ page }) => {
    await page.goto("/investment/portfolio");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
