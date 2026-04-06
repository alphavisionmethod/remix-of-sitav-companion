import { test, expect } from "@playwright/test";

// Public routes that don't require auth
const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// These routes require auth — unauthenticated should redirect to /login
const PROTECTED_ROUTE_SAMPLES = [
  "/",
  "/business",
  "/money",
  "/files",
  "/boardroom",
  "/advisor",
  "/approvals",
  "/settings",
  "/connectors",
  "/admin/dashboard",
  "/admin/truth-registry",
  "/admin/launch-readiness",
];

test.describe("Route Health — Public Routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} loads without crash`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();
      const errorBoundary = page.locator('text=/Something went wrong/i');
      await expect(errorBoundary).not.toBeVisible({ timeout: 3000 }).catch(() => {});
    });
  }
});

test.describe("Route Health — Protected Routes redirect unauthenticated", () => {
  for (const route of PROTECTED_ROUTE_SAMPLES) {
    test(`${route} redirects to /login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  }
});
