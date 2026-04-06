import { test, expect } from "@playwright/test";

const CJ_ROUTES = [
  "/admin/customer-journey/executive",
  "/admin/customer-journey/matrix",
  "/admin/customer-journey/detail",
  "/admin/customer-journey/blockers",
  "/admin/customer-journey/demo-vs-real",
  "/admin/customer-journey/broken-clicks",
  "/admin/customer-journey/remediation",
  "/admin/customer-journey/coverage",
];

test.describe("Customer Journey Boards", () => {
  for (const route of CJ_ROUTES) {
    test(`${route} requires auth`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  }
});
