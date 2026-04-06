import { test, expect } from "@playwright/test";

test.describe("Advisor Journey", () => {
  test("/advisor requires auth", async ({ page }) => {
    await page.goto("/advisor");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/advisor/registry requires auth", async ({ page }) => {
    await page.goto("/advisor/registry");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
