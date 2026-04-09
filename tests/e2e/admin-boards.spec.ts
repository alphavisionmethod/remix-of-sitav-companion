import { test, expect } from "@playwright/test";

const ADMIN_ROUTES = [
  "/admin/dashboard",
  "/admin/truth-registry",
  "/admin/launch-readiness",
  "/admin/fleet-health",
  "/admin/ai-engineering",
  "/admin/ai-team-roster",
  "/admin/connector-governance",
  "/admin/verification/v01-surface-inventory",
  "/admin/verification/v02-interaction-coverage",
  "/admin/verification/v03-p0-journeys",
  "/admin/verification/v04-mode-verification",
  "/admin/verification/v05-failure-triage",
  "/admin/verification/v06-evidence-explorer",
  "/admin/verification/v07-launch-blockers",
  "/admin/customer-journey/executive-report",
  "/admin/customer-journey/journey-truth-matrix",
  "/admin/customer-journey/journey-detail",
  "/admin/customer-journey/launch-blockers",
  "/admin/customer-journey/demo-vs-real",
  "/admin/customer-journey/broken-clicks",
  "/admin/customer-journey/remediation",
  "/admin/cn01-connector-reality",
  "/admin/conscience-gate",
];

test.describe("Admin Boards", () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route} redirects unauthenticated to login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  }
});
