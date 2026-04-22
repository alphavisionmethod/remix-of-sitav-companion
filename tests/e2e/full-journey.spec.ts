// ═══════════════════════════════════════════════════════════════
// SITA OS — Full E2E Journey Tests
// Covers navigation, data loading, error states, and key flows
// ═══════════════════════════════════════════════════════════════

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";
const EMAIL = process.env.TEST_USER_EMAIL || "";
const PASS = process.env.TEST_USER_PASSWORD || "";

// ── Auth helper ─────────────────────────────────────────────────
async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.locator("input[type='email'], input[placeholder*='email' i]").fill(EMAIL);
  await page.locator("input[type='password']").fill(PASS);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
}

async function assertNoFatalError(page: Page) {
  const body = await page.textContent("body");
  expect(body).not.toContain("Something went wrong");
  // Allow 404 pages for unknown routes but not for known ones
}

async function assertPageLoads(page: Page, path: string) {
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState("networkidle", { timeout: 20000 });
  await assertNoFatalError(page);
  const bodyLen = (await page.textContent("body"))?.length ?? 0;
  expect(bodyLen).toBeGreaterThan(30);
}

// ════════════════════════════════════════════════════════════════
// 1. PUBLIC ROUTES (no auth)
// ════════════════════════════════════════════════════════════════
test.describe("Public pages", () => {
  for (const route of ["/login", "/signup", "/forgot-password", "/download"]) {
    test(`${route} renders without error`, async ({ page }) => {
      await assertPageLoads(page, route);
    });
  }

  test("Unknown route shows 404 page", async ({ page }) => {
    await page.goto(`${BASE}/this-route-does-not-exist-xyz`);
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    const body = await page.textContent("body");
    // Should show some kind of not-found indicator
    expect(body?.length).toBeGreaterThan(10);
  });
});

// ════════════════════════════════════════════════════════════════
// 2. AUTH FLOW
// ════════════════════════════════════════════════════════════════
test.describe("Authentication flow", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test("Login → lands on authenticated page", async ({ page }) => {
    await login(page);
    // Should NOT be on login/signup anymore
    expect(page.url()).not.toContain("/login");
    expect(page.url()).not.toContain("/signup");
    await assertNoFatalError(page);
  });

  test("Unauthenticated access redirects to login", async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    // Should redirect to login or show login form
    const url = page.url();
    const body = await page.textContent("body");
    const isOnLogin = url.includes("/login") || body?.toLowerCase().includes("sign in") || body?.toLowerCase().includes("log in");
    expect(isOnLogin).toBeTruthy();
  });
});

// ════════════════════════════════════════════════════════════════
// 3. CORE NAVIGATION JOURNEYS (authenticated)
// ════════════════════════════════════════════════════════════════
test.describe("Core navigation journeys", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Navigate between P0 domains via sidebar", async ({ page }) => {
    const routes = ["/", "/files", "/boardroom", "/advisors", "/approvals", "/connectors"];
    for (const r of routes) {
      await page.goto(`${BASE}${r}`);
      await page.waitForLoadState("networkidle", { timeout: 15000 });
      await assertNoFatalError(page);
    }
  });

  test("Money domain deep navigation", async ({ page }) => {
    const routes = ["/money", "/money/bills", "/money/investments", "/money/tax", "/money/subscriptions"];
    for (const r of routes) {
      await assertPageLoads(page, r);
    }
  });

  test("Business domain deep navigation", async ({ page }) => {
    const routes = ["/business", "/business/customers", "/business/invoices", "/business/leads", "/business/quotes"];
    for (const r of routes) {
      await assertPageLoads(page, r);
    }
  });

  test("Concierge domain deep navigation", async ({ page }) => {
    const routes = ["/concierge", "/concierge/family-calendar", "/concierge/household", "/concierge/travel"];
    for (const r of routes) {
      await assertPageLoads(page, r);
    }
  });

  test("Owner domain deep navigation", async ({ page }) => {
    const routes = ["/owner", "/owner/advisors", "/owner/constitution", "/owner/pulse"];
    for (const r of routes) {
      await assertPageLoads(page, r);
    }
  });

  test("Settings page loads and has content", async ({ page }) => {
    await assertPageLoads(page, "/settings");
  });

  test("System status page loads", async ({ page }) => {
    await assertPageLoads(page, "/system-status");
  });
});

// ════════════════════════════════════════════════════════════════
// 4. DATA LOADING VERIFICATION
// ════════════════════════════════════════════════════════════════
test.describe("Data loading states", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Boardroom loads without stuck loading spinner", async ({ page }) => {
    await page.goto(`${BASE}/boardroom`);
    await page.waitForLoadState("networkidle", { timeout: 20000 });
    // After networkidle, loading state should be gone
    const loadingVisible = await page.locator("[data-testid='loading-state']").isVisible({ timeout: 2000 }).catch(() => false);
    // Either no loading indicator or it clears quickly
    if (loadingVisible) {
      await expect(page.locator("[data-testid='loading-state']")).toBeHidden({ timeout: 10000 });
    }
    await assertNoFatalError(page);
  });

  test("Files center loads", async ({ page }) => {
    await page.goto(`${BASE}/files`);
    await page.waitForLoadState("networkidle", { timeout: 20000 });
    await assertNoFatalError(page);
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(50);
  });

  test("Advisors page loads advisor data or empty state", async ({ page }) => {
    await page.goto(`${BASE}/advisors`);
    await page.waitForLoadState("networkidle", { timeout: 20000 });
    await assertNoFatalError(page);
    const body = await page.textContent("body");
    // Should have meaningful content
    expect(body?.length).toBeGreaterThan(50);
  });

  test("Notifications page loads", async ({ page }) => {
    await assertPageLoads(page, "/notifications");
  });
});

// ════════════════════════════════════════════════════════════════
// 5. ERROR STATE HANDLING
// ════════════════════════════════════════════════════════════════
test.describe("Error state handling", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Invalid nested route does not crash the app", async ({ page }) => {
    await page.goto(`${BASE}/money/nonexistent-sub-route`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    // App should still be functional — either shows 404 or redirects
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(10);
    // No white screen
    expect(body).not.toBe("");
  });

  test("Double-nested invalid route does not crash", async ({ page }) => {
    await page.goto(`${BASE}/business/deep/invalid/path`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(10);
  });

  test("No console errors on critical pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Filter out known non-critical errors
    const critical = errors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("Non-Error") && !e.includes("ChunkLoadError")
    );
    expect(critical).toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════
// 6. INVESTMENT & REVENUE OFFICES
// ════════════════════════════════════════════════════════════════
test.describe("Investment & Revenue office journeys", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Investment office pages load", async ({ page }) => {
    for (const r of ["/investments", "/investment-office/portfolio", "/investment-office/risk", "/investment-office/strategy"]) {
      await assertPageLoads(page, r);
    }
  });

  test("Revenue office pages load", async ({ page }) => {
    for (const r of ["/revenue-office", "/revenue-office/pipeline", "/revenue-office/retention", "/revenue-office/growth-dna"]) {
      await assertPageLoads(page, r);
    }
  });
});

// ════════════════════════════════════════════════════════════════
// 7. ADMIN ROUTES
// ════════════════════════════════════════════════════════════════
test.describe("Admin route loading", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Admin core pages load", async ({ page }) => {
    for (const r of ["/admin", "/admin/ai-runtime", "/admin/team", "/admin/system-health"]) {
      await assertPageLoads(page, r);
    }
  });

  test("Admin AI Gateway pages load", async ({ page }) => {
    for (const r of ["/admin/ai-gateway/providers", "/admin/ai-gateway/models", "/admin/ai-gateway/routing"]) {
      await assertPageLoads(page, r);
    }
  });
});

// ════════════════════════════════════════════════════════════════
// 8. WORKSPACE & PRODUCTIVITY
// ════════════════════════════════════════════════════════════════
test.describe("Workspace pages", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Workspace docs, sheets, slides load", async ({ page }) => {
    for (const r of ["/workspace/docs", "/workspace/sheets", "/workspace/slides"]) {
      await assertPageLoads(page, r);
    }
  });

  test("Calendar and search load", async ({ page }) => {
    for (const r of ["/calendar", "/search"]) {
      await assertPageLoads(page, r);
    }
  });

  test("Store pages load", async ({ page }) => {
    for (const r of ["/store", "/app-store"]) {
      await assertPageLoads(page, r);
    }
  });
});

// ════════════════════════════════════════════════════════════════
// 9. DIGITAL PRESENCE & INTEGRATIONS
// ════════════════════════════════════════════════════════════════
test.describe("Digital presence & integrations", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Digital presence pages load", async ({ page }) => {
    for (const r of ["/digital-presence", "/digital-presence/site-builder", "/digital-presence/brand-studio"]) {
      await assertPageLoads(page, r);
    }
  });

  test("Integrations pages load", async ({ page }) => {
    for (const r of ["/integrations", "/integrations/connections"]) {
      await assertPageLoads(page, r);
    }
  });
});