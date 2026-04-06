// ═══════════════════════════════════════════════════════
// SITA OS — Playwright E2E Test: Route Smoke Tests (P0/P1)
// Verifies all major routes load without error
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

// These tests require authentication — skip if no test credentials
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_PASS = process.env.TEST_USER_PASSWORD || "";

// P0 routes that must load
const P0_ROUTES = [
  { path: "/", label: "Daily Pulse" },
  { path: "/files", label: "Files Center" },
  { path: "/boardroom", label: "Boardroom" },
  { path: "/advisors", label: "Advisor Workspace" },
  { path: "/approvals", label: "Approvals Center" },
  { path: "/connectors", label: "Connector Hub" },
  { path: "/admin/ai-runtime", label: "AI Runtime Status" },
  { path: "/admin/team", label: "AI Team Management" },
];

// P1 routes to verify
const P1_ROUTES = [
  { path: "/business", label: "Business Center" },
  { path: "/money", label: "Money Center" },
  { path: "/settings", label: "Settings" },
  { path: "/owner", label: "Owner Center" },
  { path: "/workflows", label: "Workflows Center" },
  { path: "/concierge", label: "Concierge Center" },
  { path: "/calendar", label: "Calendar Workspace" },
  { path: "/investments", label: "Investment Gate" },
  { path: "/revenue-office", label: "Revenue Gate" },
  { path: "/digital-presence", label: "Digital Presence" },
];

// Verification boards
const VERIFICATION_ROUTES = [
  { path: "/admin/verification/surfaces", label: "V01 Surface Inventory" },
  { path: "/admin/verification/coverage", label: "V02 Coverage Board" },
  { path: "/admin/verification/p0-journeys", label: "V03 P0 Journeys" },
  { path: "/admin/verification/modes", label: "V04 Mode Board" },
  { path: "/admin/verification/failures", label: "V05 Failure Triage" },
  { path: "/admin/verification/evidence", label: "V06 Evidence Explorer" },
  { path: "/admin/verification/blockers", label: "V07 Launch Blockers" },
];

test.describe("P0 — Route Smoke Tests", () => {
  test.skip(!TEST_EMAIL, "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    // Authenticate
    await page.goto(`${BASE_URL}/login`);
    await page.locator("input[type='email'], input[placeholder*='email' i]").fill(TEST_EMAIL);
    await page.locator("input[type='password']").fill(TEST_PASS);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
  });

  for (const route of P0_ROUTES) {
    test(`P0: ${route.label} (${route.path}) loads`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route.path}`);
      await page.waitForLoadState("networkidle", { timeout: 15000 });
      // Should not show error page
      const body = await page.textContent("body");
      expect(body).not.toContain("Something went wrong");
      expect(body).not.toContain("Page not found");
    });
  }
});

test.describe("P1 — Route Smoke Tests", () => {
  test.skip(!TEST_EMAIL, "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator("input[type='email'], input[placeholder*='email' i]").fill(TEST_EMAIL);
    await page.locator("input[type='password']").fill(TEST_PASS);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
  });

  for (const route of P1_ROUTES) {
    test(`P1: ${route.label} (${route.path}) loads`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route.path}`);
      await page.waitForLoadState("networkidle", { timeout: 15000 });
      const body = await page.textContent("body");
      expect(body).not.toContain("Something went wrong");
    });
  }
});

test.describe("Verification Boards — Route Smoke Tests", () => {
  test.skip(!TEST_EMAIL, "Skipping: no TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator("input[type='email'], input[placeholder*='email' i]").fill(TEST_EMAIL);
    await page.locator("input[type='password']").fill(TEST_PASS);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
  });

  for (const route of VERIFICATION_ROUTES) {
    test(`${route.label} (${route.path}) loads`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route.path}`);
      await page.waitForLoadState("networkidle", { timeout: 15000 });
      const body = await page.textContent("body");
      expect(body).not.toContain("Something went wrong");
    });
  }
});
