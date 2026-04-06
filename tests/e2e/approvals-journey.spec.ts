import { test, expect } from "@playwright/test";

test.describe("Approvals Journey", () => {
  test("/approvals requires auth", async ({ page }) => {
    await page.goto("/approvals");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/approval-chamber requires auth", async ({ page }) => {
    await page.goto("/approval-chamber");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
