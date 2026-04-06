// ═══════════════════════════════════════════════════════
// SITA OS — Navigation Helper
// Route navigation, waiting, and route-loaded assertions
// ═══════════════════════════════════════════════════════

import { Page, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

/**
 * Navigate to a route and wait for it to be interactive.
 */
export async function navigateTo(page: Page, route: string, options?: { timeout?: number }) {
  const timeout = options?.timeout || 15000;
  const url = route.startsWith("http") ? route : `${BASE}${route}`;
  await page.goto(url, { timeout });
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Wait for the current URL to match a pattern.
 */
export async function waitForRoute(page: Page, pattern: RegExp, options?: { timeout?: number }) {
  await page.waitForURL(pattern, { timeout: options?.timeout || 15000 });
}

/**
 * Assert a route loaded successfully — has content, no fatal error.
 */
export async function assertRouteLoaded(page: Page, options?: { minBodyLength?: number }) {
  const minLen = options?.minBodyLength || 50;
  const body = await page.textContent("body");
  expect(body?.length).toBeGreaterThan(minLen);
  // No fatal error state
  const errorState = page.locator("[data-testid='error-state']");
  const hasError = await errorState.isVisible({ timeout: 2000 }).catch(() => false);
  if (hasError) {
    const errorText = await errorState.textContent();
    // Allow honest error states that explain what's happening
    if (errorText?.toLowerCase().includes("something went wrong")) {
      throw new Error(`Fatal error state detected: ${errorText}`);
    }
  }
}

/**
 * Assert that the current URL contains a given path segment.
 */
export function assertOnRoute(page: Page, routeSegment: string) {
  expect(page.url()).toContain(routeSegment);
}

/**
 * Get the base URL for the test environment.
 */
export function getBaseURL(): string {
  return BASE;
}
