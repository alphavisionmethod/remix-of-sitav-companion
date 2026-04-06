import { test, expect } from "@playwright/test";

test.describe("Boardroom", () => {
  test("loads without error", async ({ page }) => {
    await page.goto("/boardroom");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
