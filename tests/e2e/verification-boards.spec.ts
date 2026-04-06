import { test, expect } from "@playwright/test";

const V_ROUTES = [
  "/admin/verification/v01-surface-inventory",
  "/admin/verification/v02-interaction-coverage",
  "/admin/verification/v03-p0-journeys",
  "/admin/verification/v04-mode-verification",
  "/admin/verification/v05-failure-triage",
  "/admin/verification/v06-evidence-explorer",
  "/admin/verification/v07-launch-blockers",
];

test.describe("Verification Boards", () => {
  for (const route of V_ROUTES) {
    test(`${route} requires auth`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  }
});
