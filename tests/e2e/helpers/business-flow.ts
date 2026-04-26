// ═══════════════════════════════════════════════════════════════
// Business OS — Playwright Flow Helper
// Extends tests/e2e/helpers/navigation.ts for Business OS routes.
// Does NOT duplicate auth.ts or evidence.ts.
// ═══════════════════════════════════════════════════════════════

import { Page, expect } from "@playwright/test";
import { navigateTo, assertRouteLoaded, getBaseURL } from "./navigation";

export const BUSINESS_BASE = "/business";

export async function gotoBusinessRoute(
  page: Page,
  segment: string,
  options?: { timeout?: number },
) {
  const path = segment.startsWith("/") ? segment : `${BUSINESS_BASE}/${segment}`;
  await navigateTo(page, path, options);
}

export async function assertBusinessPageLoaded(page: Page) {
  await assertRouteLoaded(page, { minBodyLength: 80 });
  expect(page.url(), "Page redirected to login (auth gate)").not.toMatch(/\/login/);
}

export function businessBaseUrl(): string {
  return getBaseURL();
}