import { test, expect } from "@playwright/test";

test.describe("Business Journey", () => {
  test("/business requires auth", async ({ page }) => {
    await page.goto("/business");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/business/customers requires auth", async ({ page }) => {
    await page.goto("/business/customers");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
