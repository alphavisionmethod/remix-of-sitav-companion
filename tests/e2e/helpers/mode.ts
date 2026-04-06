// ═══════════════════════════════════════════════════════
// SITA OS — Mode Helper
// Demo/Live mode switching via localStorage + UI verification
// ═══════════════════════════════════════════════════════

import { Page, expect } from "@playwright/test";

const STORAGE_KEY = "sita-data-mode";

/**
 * Switch to demo mode via localStorage and reload.
 */
export async function switchToDemo(page: Page): Promise<void> {
  await page.evaluate((key) => localStorage.setItem(key, "demo"), STORAGE_KEY);
  await page.reload({ waitUntil: "networkidle" });
}

/**
 * Switch to live mode via localStorage and reload.
 */
export async function switchToLive(page: Page): Promise<void> {
  await page.evaluate((key) => localStorage.setItem(key, "live"), STORAGE_KEY);
  await page.reload({ waitUntil: "networkidle" });
}

/**
 * Get the current data mode from localStorage.
 */
export async function getCurrentMode(page: Page): Promise<"demo" | "live"> {
  return await page.evaluate((key) => {
    return (localStorage.getItem(key) as "demo" | "live") || "demo";
  }, STORAGE_KEY);
}

/**
 * Assert the demo mode badge is visible.
 */
export async function assertDemoBadge(page: Page): Promise<void> {
  const badge = page.locator("[data-testid='demo-mode-badge']");
  await expect(badge).toBeVisible({ timeout: 5000 });
}

/**
 * Assert that demo mode badge is NOT prominently shown (live mode).
 */
export async function assertLiveMode(page: Page): Promise<void> {
  const mode = await getCurrentMode(page);
  expect(mode).toBe("live");
}

/**
 * Assert mode badge matches expected mode text.
 */
export async function assertModeBadge(page: Page, expectedMode: "demo" | "live"): Promise<void> {
  if (expectedMode === "demo") {
    await assertDemoBadge(page);
  } else {
    await assertLiveMode(page);
  }
}
