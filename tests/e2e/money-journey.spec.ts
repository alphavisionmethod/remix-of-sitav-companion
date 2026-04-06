import { test, expect } from "@playwright/test";

test.describe("Money Journey", () => {
  test("/money requires auth", async ({ page }) => {
    await page.goto("/money");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/money/overview requires auth", async ({ page }) => {
    await page.goto("/money/overview");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
