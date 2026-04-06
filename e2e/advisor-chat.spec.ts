import { test, expect } from "@playwright/test";

test.describe("Advisor Chat", () => {
  test("chat page loads", async ({ page }) => {
    await page.goto("/advisor");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
