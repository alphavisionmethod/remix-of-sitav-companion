import { test, expect } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════
// SITA OS — P0 E2E Suite: Critical Flows
// Auth, Navigation, Business, Money, Boardroom, Advisor, Command Palette
// ═══════════════════════════════════════════════════════════════

// ── Helper: Enter demo mode ────────────────────────────────
async function enterDemoMode(page: any) {
  await page.goto("/login");
  await page.getByRole("button", { name: /demo mode/i }).click();
  await page.waitForURL("**/daily-pulse", { timeout: 15000 });
}

// ── AUTH JOURNEYS ──────────────────────────────────────────
test.describe("P0: Auth — Login & Session", () => {
  test("login page renders with all elements", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("demo mode button exists and works", async ({ page }) => {
    await page.goto("/login");
    const demoBtn = page.getByRole("button", { name: /demo mode/i });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();
    await expect(page.getByText("Here's your operating view")).toBeVisible({ timeout: 15000 });
  });

  test("forgot password link navigates correctly", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Forgot password").click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test("signup link navigates correctly", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Create one").click();
    await expect(page).toHaveURL(/signup/);
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/daily-pulse");
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});

// ── CORE ROUTE LOADING ─────────────────────────────────────
test.describe("P0: Core Routes Load Without Crash", () => {
  test.beforeEach(async ({ page }) => {
    await enterDemoMode(page);
  });

  const coreRoutes = [
    { path: "/daily-pulse", label: "Daily Pulse" },
    { path: "/business", label: "Business Center" },
    { path: "/money", label: "Money Center" },
    { path: "/boardroom", label: "Boardroom" },
    { path: "/files", label: "Files" },
    { path: "/settings", label: "Settings" },
    { path: "/advisors/council-dashboard", label: "Advisor Council" },
  ];

  for (const route of coreRoutes) {
    test(`${route.label} (${route.path}) loads`, async ({ page }) => {
      await page.goto(route.path);
      // No crash = page has content beyond loading spinner
      await page.waitForLoadState("networkidle", { timeout: 15000 });
      const body = await page.locator("body").textContent();
      expect(body?.length).toBeGreaterThan(50);
      // No error boundary triggered
      await expect(page.getByText("Something went wrong")).not.toBeVisible();
    });
  }
});

// ── BUSINESS CENTER ─────────────────────────────────────────
test.describe("P0: Business Center — Customer Inspection", () => {
  test.beforeEach(async ({ page }) => {
    await enterDemoMode(page);
  });

  test("shows KPI tiles", async ({ page }) => {
    await page.goto("/business");
    await expect(page.getByText("NEW LEADS")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("PIPELINE VALUE")).toBeVisible();
  });

  test("customer list renders with data", async ({ page }) => {
    await page.goto("/business");
    await page.getByRole("button", { name: /customers/i }).click();
    const customerNames = page.locator("[data-testid='customer-row'], tr, [role='row']");
    await expect(customerNames.first()).toBeVisible({ timeout: 10000 });
  });
});

// ── MONEY CENTER ────────────────────────────────────────────
test.describe("P0: Money Center", () => {
  test("loads and shows financial content", async ({ page }) => {
    await enterDemoMode(page);
    await page.goto("/money");
    await page.waitForLoadState("networkidle");
    const content = await page.locator("body").textContent();
    expect(content?.length).toBeGreaterThan(100);
  });
});

// ── BOARDROOM ───────────────────────────────────────────────
test.describe("P0: Boardroom", () => {
  test("loads boardroom view", async ({ page }) => {
    await enterDemoMode(page);
    await page.goto("/boardroom");
    await expect(page.getByText(/boardroom|weekly.*review|business.*review/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ── ADVISOR COUNCIL ─────────────────────────────────────────
test.describe("P0: Advisor Council Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await enterDemoMode(page);
  });

  test("loads with tabs", async ({ page }) => {
    await page.goto("/advisors/council-dashboard");
    await expect(page.getByRole("tab", { name: /scorecard/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("tab", { name: /escalation/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /handoff/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /budget/i })).toBeVisible();
  });

  test("tab switching works", async ({ page }) => {
    await page.goto("/advisors/council-dashboard");
    await page.waitForTimeout(2000);
    await page.getByRole("tab", { name: /escalation/i }).click();
    await expect(page.getByText(/escalation/i).first()).toBeVisible();
    await page.getByRole("tab", { name: /budget/i }).click();
    await expect(page.getByText(/budget|spend|cost/i).first()).toBeVisible();
  });
});

// ── COMMAND PALETTE ─────────────────────────────────────────
test.describe("P0: Command Palette", () => {
  test("opens and accepts search input", async ({ page }) => {
    await enterDemoMode(page);
    await page.getByRole("button", { name: /search/i }).first().click();
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });
  });
});

// ── FILES CENTER ────────────────────────────────────────────
test.describe("P0: Files Center", () => {
  test("loads file management UI", async ({ page }) => {
    await enterDemoMode(page);
    await page.goto("/files");
    await page.waitForLoadState("networkidle");
    const content = await page.locator("body").textContent();
    expect(content?.length).toBeGreaterThan(50);
    await expect(page.getByText("Something went wrong")).not.toBeVisible();
  });
});

// ── SETTINGS ────────────────────────────────────────────────
test.describe("P0: Settings Persistence", () => {
  test("settings page loads with form elements", async ({ page }) => {
    await enterDemoMode(page);
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    // Should have interactive form elements
    const inputs = page.locator("input, select, textarea, [role='switch'], [role='combobox']");
    await expect(inputs.first()).toBeVisible({ timeout: 10000 });
  });
});

// ── ADMIN ROUTES ────────────────────────────────────────────
test.describe("P0: Admin Route Health", () => {
  test.beforeEach(async ({ page }) => {
    await enterDemoMode(page);
  });

  const adminRoutes = [
    "/admin/dashboard",
    "/admin/truth-registry",
    "/admin/launch-readiness",
  ];

  for (const route of adminRoutes) {
    test(`${route} loads`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle", { timeout: 15000 });
      await expect(page.getByText("Something went wrong")).not.toBeVisible();
    });
  }
});
