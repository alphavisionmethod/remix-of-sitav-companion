import { test, expect } from "@playwright/test";

test.describe("Daily Pulse", () => {
  test("loads without error", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Should not show error boundary
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("shows page content", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Page should have some visible content
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
