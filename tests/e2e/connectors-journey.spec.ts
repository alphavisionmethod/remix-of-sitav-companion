import { test, expect } from "@playwright/test";

test.describe("Connectors Journey", () => {
  test("/connectors requires auth", async ({ page }) => {
    await page.goto("/connectors");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/integrations requires auth", async ({ page }) => {
    await page.goto("/integrations");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
