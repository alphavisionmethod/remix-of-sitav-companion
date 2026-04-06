import { test, expect } from "@playwright/test";

test.describe("Boardroom Journey", () => {
  test("/boardroom requires auth", async ({ page }) => {
    await page.goto("/boardroom");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
