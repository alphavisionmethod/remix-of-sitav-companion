import { test, expect } from "@playwright/test";

const CJ_ROUTES = [
  "/admin/customer-journey/executive-report",
  "/admin/customer-journey/journey-truth-matrix",
  "/admin/customer-journey/journey-detail",
  "/admin/customer-journey/launch-blockers",
  "/admin/customer-journey/demo-vs-real",
  "/admin/customer-journey/broken-clicks",
  "/admin/customer-journey/remediation",
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
