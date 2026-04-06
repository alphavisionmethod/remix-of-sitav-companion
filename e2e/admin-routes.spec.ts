import { test, expect } from "@playwright/test";

test.describe("Admin Routes", () => {
  const adminRoutes = [
    "/admin/truth-registry",
    "/admin/launch-readiness",
    "/admin/trust-center",
  ];

  for (const route of adminRoutes) {
    test(`${route} loads without crash`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=Something went wrong")).not.toBeVisible();
    });
  }
});
