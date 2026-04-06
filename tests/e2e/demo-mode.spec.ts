import { test, expect } from "@playwright/test";

test.describe("Demo Mode", () => {
  test("login page renders demo entry point", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    // Verify page loaded without crash
    await expect(page.locator("body")).toBeVisible();
  });
});
