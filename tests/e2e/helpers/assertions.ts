// ═══════════════════════════════════════════════════════
// SITA OS — Assertions Helper
// Standardized behavioral assertions for journey tests
// ═══════════════════════════════════════════════════════

import { Page, Locator, expect } from "@playwright/test";

/**
 * Assert a button is visible and enabled (clickable).
 */
export async function assertButtonClickable(locator: Locator, options?: { timeout?: number }): Promise<void> {
  await expect(locator).toBeVisible({ timeout: options?.timeout || 5000 });
  await expect(locator).toBeEnabled({ timeout: options?.timeout || 5000 });
}

/**
 * Assert a card-like element is visible by test ID.
 */
export async function assertCardVisible(page: Page, testId: string, options?: { timeout?: number }): Promise<void> {
  await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible({
    timeout: options?.timeout || 5000,
  });
}

/**
 * Assert at least one table row exists in a table or list.
 */
export async function assertTableRowExists(
  page: Page,
  containerSelector: string,
  options?: { timeout?: number }
): Promise<void> {
  const container = page.locator(containerSelector);
  await expect(container).toBeVisible({ timeout: options?.timeout || 5000 });
  const rows = container.locator("tr, [role='row'], [data-testid*='row'], li");
  await expect(rows.first()).toBeVisible({ timeout: options?.timeout || 5000 });
}

/**
 * Assert the demo mode badge is visible.
 */
export async function assertDemoBadge(page: Page): Promise<void> {
  await expect(page.locator("[data-testid='demo-mode-badge']")).toBeVisible({ timeout: 5000 });
}

/**
 * Assert live mode indicators are present.
 */
export async function assertLiveBadge(page: Page): Promise<void> {
  const liveBadge = page.locator("[data-testid='live-mode-badge']");
  const hasLiveBadge = await liveBadge.isVisible({ timeout: 3000 }).catch(() => false);
  if (!hasLiveBadge) {
    // Fallback: demo badge should NOT be visible in live mode
    const demoBadge = page.locator("[data-testid='demo-mode-badge']");
    const hasDemoBadge = await demoBadge.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasDemoBadge).toBe(false);
  }
}

/**
 * Assert a degraded/unavailable banner is shown honestly.
 */
export async function assertDegradedBanner(page: Page): Promise<void> {
  const degraded = page.locator(
    "[data-testid='degraded-banner'], [data-testid='unavailable-banner'], [role='alert']"
  );
  await expect(degraded.first()).toBeVisible({ timeout: 5000 });
}

/**
 * Assert no fatal error state is present.
 */
export async function assertNoErrorState(page: Page): Promise<void> {
  const body = await page.textContent("body");
  expect(body).not.toContain("Something went wrong");
  const errorState = page.locator("[data-testid='error-state']");
  const hasError = await errorState.isVisible({ timeout: 2000 }).catch(() => false);
  expect(hasError).toBe(false);
}

/**
 * Assert an upload action succeeded (file appears in list).
 */
export async function assertUploadSucceeded(page: Page, fileName: string): Promise<void> {
  await expect(page.getByText(fileName)).toBeVisible({ timeout: 10000 });
}

/**
 * Assert an empty state is shown honestly (with explanation, not broken).
 */
export async function assertEmptyStateHonest(page: Page): Promise<void> {
  const empty = page.locator("[data-testid='empty-state']");
  await expect(empty).toBeVisible({ timeout: 5000 });
  const text = await empty.textContent();
  expect(text?.length).toBeGreaterThan(10); // Has explanation, not just blank
}

/**
 * Assert sidebar navigation is visible.
 */
export async function assertSidebarVisible(page: Page): Promise<void> {
  const nav = page.locator("nav, [role='navigation'], aside, [data-testid='sidebar-nav']").first();
  await expect(nav).toBeVisible({ timeout: 10000 });
}

/**
 * Assert page has meaningful content (not empty shell).
 */
export async function assertPageHasContent(page: Page, minLength = 50): Promise<void> {
  const body = await page.textContent("body");
  expect(body?.length).toBeGreaterThan(minLength);
}
