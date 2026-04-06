import { test, expect } from "@playwright/test";

test.describe("Settings Journey", () => {
  test("/settings requires auth", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
