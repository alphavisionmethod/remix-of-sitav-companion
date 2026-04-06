import { test, expect } from "@playwright/test";

test.describe("Money Center", () => {
  test("loads without error", async ({ page }) => {
    await page.goto("/money");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
