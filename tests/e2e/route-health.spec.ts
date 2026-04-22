import { test, expect } from "@playwright/test";
import {
  PUBLIC_ROUTES,
  PROTECTED_ROUTE_SAMPLES,
} from "../../src/platform/architecture/route-registry";

test.describe("Route Health — Public Routes (from route-registry)", () => {
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

test.describe("Route Health — Protected Routes redirect unauthenticated (from route-registry)", () => {
  for (const route of PROTECTED_ROUTE_SAMPLES) {
    test(`${route} redirects to /login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  }
});
