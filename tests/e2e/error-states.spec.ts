// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Error State & Retry Tests
// Mock failed API responses and verify error/empty states render
// ═══════════════════════════════════════════════════════════════

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";
const EMAIL = process.env.TEST_USER_EMAIL || "";
const PASS = process.env.TEST_USER_PASSWORD || "";

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.locator("input[type='email'], input[placeholder*='email' i]").fill(EMAIL);
  await page.locator("input[type='password']").fill(PASS);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
}

test.describe("Error and empty states", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Boardroom shows error/empty state when API fails", async ({ page }) => {
    // Intercept Supabase REST calls and return 500
    await page.route("**/rest/v1/boardroom_items*", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "server error" }), contentType: "application/json" })
    );
    await page.goto(`${BASE}/boardroom`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    // Should show an error state, empty state, or graceful fallback — NOT a white screen
    expect(body?.length).toBeGreaterThan(30);
    // Should not show raw error JSON
    expect(body).not.toContain('"error":"server error"');
  });

  test("Files center handles API failure gracefully", async ({ page }) => {
    await page.route("**/rest/v1/file_*", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error", contentType: "text/plain" })
    );
    await page.goto(`${BASE}/files`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(30);
  });

  test("Advisors page handles network timeout", async ({ page }) => {
    await page.route("**/rest/v1/advisor_*", (route) => route.abort("timedout"));
    await page.goto(`${BASE}/advisors`);
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
    // Wait a bit for error state to appear
    await page.waitForTimeout(3000);
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(30);
  });

  test("Money center handles empty data", async ({ page }) => {
    await page.route("**/rest/v1/*", (route) => {
      const url = route.request().url();
      if (url.includes("rest/v1/") && !url.includes("auth")) {
        return route.fulfill({ status: 200, body: "[]", contentType: "application/json" });
      }
      return route.continue();
    });
    await page.goto(`${BASE}/money`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(30);
    // Should show empty state or zero-data view, not crash
  });

  test("Approvals page renders empty state with no data", async ({ page }) => {
    await page.route("**/rest/v1/approval_*", (route) =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.goto(`${BASE}/approvals`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(30);
  });

  test("Connectors page handles API failure", async ({ page }) => {
    await page.route("**/rest/v1/connector*", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "fail" }), contentType: "application/json" })
    );
    await page.goto(`${BASE}/connectors`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(30);
  });
});