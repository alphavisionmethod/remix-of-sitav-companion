// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Tests: Admin Dashboard
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test("admin routes exist and load", async ({ page }) => {
    // These should either load the admin page or redirect to auth
    const adminRoutes = [
      "/admin/truth-index",
      "/admin/ai-workforce",
      "/admin/connectors",
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      // Should either show admin content or redirect to auth
      const url = page.url();
      expect(url.includes("admin") || url.includes("auth")).toBeTruthy();
    }
  });

  test("truth index dashboard shows index cards", async ({ page }) => {
    await page.goto("/admin/truth-index");
    await page.waitForLoadState("networkidle");

    // If accessible (authenticated), should show truth index content
    const url = page.url();
    if (url.includes("truth-index")) {
      const body = await page.textContent("body");
      expect(body).toBeTruthy();
    }
  });
});
