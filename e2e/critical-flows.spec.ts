import { test, expect } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Tests: Critical Flows
// Login, Customer Inspection, Boardroom, Money Center, Advisor Dashboard
// ═══════════════════════════════════════════════════════════════

test.describe("Login & Authentication", () => {
  test("should show login page with sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should have demo mode button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /demo mode/i })).toBeVisible();
  });

  test("should enter demo mode and show Daily Pulse", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await expect(page.getByText("Here's your operating view")).toBeVisible({ timeout: 10000 });
  });

  test("should have forgot password link", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Forgot password")).toBeVisible();
  });

  test("should have create account link", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Create one")).toBeVisible();
  });
});

test.describe("Business Center — Customer Inspection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForURL("**/daily-pulse", { timeout: 10000 });
  });

  test("should navigate to Business Center", async ({ page }) => {
    await page.getByRole("link", { name: /business/i }).first().click();
    await expect(page.getByText("Business Center")).toBeVisible({ timeout: 10000 });
  });

  test("should show customer list in Customers tab", async ({ page }) => {
    await page.goto("/business");
    await page.getByRole("button", { name: /customers/i }).click();
    await expect(page.getByText("Sarah Chen")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("James Rodriguez")).toBeVisible();
  });

  test("should open contextual rail when clicking a customer", async ({ page }) => {
    await page.goto("/business");
    await page.getByRole("button", { name: /customers/i }).click();
    await page.waitForTimeout(2000);
    await page.getByText("Sarah Chen").click();
    // Check that the detail panel or inspector opens
    await expect(page.getByText("Relationship Summary").or(page.getByText("Bloom Studio"))).toBeVisible({ timeout: 5000 });
  });

  test("should show KPI tiles on overview", async ({ page }) => {
    await page.goto("/business");
    await expect(page.getByText("NEW LEADS")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("PIPELINE VALUE")).toBeVisible();
  });
});

test.describe("Money Center", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForURL("**/daily-pulse", { timeout: 10000 });
  });

  test("should navigate to Money Center", async ({ page }) => {
    await page.getByRole("link", { name: /money/i }).first().click();
    await expect(page.getByText(/money/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Boardroom", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForURL("**/daily-pulse", { timeout: 10000 });
  });

  test("should navigate to Boardroom via Weekly Business Review", async ({ page }) => {
    // Boardroom link should exist in the main content or sidebar
    await page.goto("/boardroom");
    await expect(page.getByText(/boardroom|weekly.*review|business.*review/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Advisor Council Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForURL("**/daily-pulse", { timeout: 10000 });
  });

  test("should load the council dashboard", async ({ page }) => {
    await page.goto("/advisors/council-dashboard");
    await expect(page.getByText(/advisor council|scorecards/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("should have all four tabs", async ({ page }) => {
    await page.goto("/advisors/council-dashboard");
    await expect(page.getByRole("tab", { name: /scorecard/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("tab", { name: /escalation/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /handoff/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /budget/i })).toBeVisible();
  });

  test("should switch between tabs", async ({ page }) => {
    await page.goto("/advisors/council-dashboard");
    await page.waitForTimeout(2000);
    
    // Click Escalations tab
    await page.getByRole("tab", { name: /escalation/i }).click();
    await expect(page.getByText(/escalation/i).first()).toBeVisible();

    // Click Handoffs tab
    await page.getByRole("tab", { name: /handoff/i }).click();
    await expect(page.getByText(/handoff/i).first()).toBeVisible();

    // Click Budget tab
    await page.getByRole("tab", { name: /budget/i }).click();
    await expect(page.getByText(/budget|spend|cost/i).first()).toBeVisible();
  });
});

test.describe("Command Palette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForURL("**/daily-pulse", { timeout: 10000 });
  });

  test("should open command palette and search", async ({ page }) => {
    // Click the search bar in the top bar
    await page.getByRole("button", { name: /search/i }).first().click();
    await expect(page.getByPlaceholder(/search.*spaces.*advisors/i)).toBeVisible({ timeout: 5000 });
  });
});
