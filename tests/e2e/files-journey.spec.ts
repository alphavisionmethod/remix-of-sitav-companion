import { test, expect } from "@playwright/test";

test.describe("Files Journey", () => {
  test("/files requires auth", async ({ page }) => {
    await page.goto("/files");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
