// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Tests: Performance & Loading
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("page loads within 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("net::ERR")) {
        errors.push(msg.text());
      }
    });
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    // Filter out known benign errors (Supabase auth when not logged in)
    const criticalErrors = errors.filter(
      e => !e.includes("AuthApiError") && !e.includes("supabase") && !e.includes("Failed to fetch")
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("page has valid title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});
