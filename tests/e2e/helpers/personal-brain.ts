// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E helpers for Personal Brain v2 surfaces
// Used by customer-journey/personal-brain/* specs.
// ═══════════════════════════════════════════════════════════════

import { Page, expect } from "@playwright/test";
import { login, hasTestCredentials } from "./auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

/** Login (idempotent) and navigate to a Brain route, waiting for idle. */
export async function gotoBrainRoute(page: Page, path: string): Promise<void> {
  if (!hasTestCredentials()) return;
  // Try direct navigation first; if redirected to /login, perform a login then retry.
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  if (page.url().includes("/login")) {
    await login(page);
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  }
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
}

/** Assert that the Brain shell rendered something meaningful (>40 chars of text body). */
export async function assertBrainPageRendered(page: Page): Promise<void> {
  const body = await page.textContent("body");
  expect(body?.length ?? 0).toBeGreaterThan(40);
  expect(body || "").not.toContain("Something went wrong");
}

/** Click a link in the Brain settings sidebar by visible label. */
export async function clickBrainNavSection(page: Page, label: string | RegExp): Promise<void> {
  const sidebar = page.locator("[data-testid='brain-settings-sidebar']");
  await expect(sidebar).toBeVisible({ timeout: 8000 });
  const link = sidebar.getByRole("link", { name: label });
  await expect(link).toBeVisible({ timeout: 5000 });
  await link.click();
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => undefined);
}
