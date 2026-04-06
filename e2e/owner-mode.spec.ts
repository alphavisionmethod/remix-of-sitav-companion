import { test, expect } from "@playwright/test";

test.describe("Owner Mode", () => {
  test("owner center loads", async ({ page }) => {
    await page.goto("/owner");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
