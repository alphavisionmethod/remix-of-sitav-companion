// ═══════════════════════════════════════════════════════
// SITA OS — E2E Auth Helpers
// Login/logout helpers for Playwright tests
// ═══════════════════════════════════════════════════════

import { Page, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_PASS = process.env.TEST_USER_PASSWORD || "";

export function hasTestCredentials(): boolean {
  return !!TEST_EMAIL && !!TEST_PASS;
}

export async function login(page: Page): Promise<void> {
  await page.goto(`${BASE}/login`);
  await page.locator("input[type='email'], input[placeholder*='email' i]").fill(TEST_EMAIL);
  await page.locator("input[type='password']").fill(TEST_PASS);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
}

export async function logout(page: Page): Promise<void> {
  // Try sign out button via testid first, fallback to accessible name
  const signOutBtn = page.locator("[data-testid='sign-out-btn']");
  if (await signOutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await signOutBtn.click();
  } else {
    const btn = page.getByRole("button", { name: /sign out|log out/i });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
    }
  }
  await page.waitForURL(/\/login/, { timeout: 10000 });
}

export async function ensureAuthenticated(page: Page): Promise<void> {
  const url = page.url();
  if (url.includes("/login") || url.includes("/signup")) {
    await login(page);
  }
}
