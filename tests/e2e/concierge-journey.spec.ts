import { test, expect } from "@playwright/test";

test.describe("Concierge Journey", () => {
  test("/concierge requires auth", async ({ page }) => {
    await page.goto("/concierge");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/concierge/overview requires auth", async ({ page }) => {
    await page.goto("/concierge/overview");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/concierge/errands requires auth", async ({ page }) => {
    await page.goto("/concierge/errands");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
