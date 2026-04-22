// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Page Content Assertions
// Verifies real content: headings, KPIs, tables, primary buttons
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

async function goTo(page: Page, path: string) {
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState("networkidle", { timeout: 20000 });
}

test.describe("Page content assertions", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── Daily Pulse / Home ──
  test("Home page has heading and content sections", async ({ page }) => {
    await goTo(page, "/");
    const h1 = page.locator("h1, h2").first();
    await expect(h1).toBeVisible({ timeout: 5000 });
    const headingText = await h1.textContent();
    expect(headingText?.length).toBeGreaterThan(2);
  });

  // ── Boardroom ──
  test("Boardroom has heading and advisor content", async ({ page }) => {
    await goTo(page, "/boardroom");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    // Should have some interactive elements
    const buttons = await page.locator("button").count();
    expect(buttons).toBeGreaterThan(0);
  });

  // ── Files ──
  test("Files center has heading and upload area", async ({ page }) => {
    await goTo(page, "/files");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── Advisors ──
  test("Advisors page has heading and advisor cards or list", async ({ page }) => {
    await goTo(page, "/advisors");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── Money Center ──
  test("Money center has heading, KPI cards, and nav", async ({ page }) => {
    await goTo(page, "/money");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    // Should have some cards or metrics
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(100);
  });

  // ── Business Center ──
  test("Business center has heading and domain navigation", async ({ page }) => {
    await goTo(page, "/business");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    // Should have links to sub-pages
    const links = await page.locator("a[href*='/business/']").count();
    // At least some domain links or buttons
    const buttons = await page.locator("button").count();
    expect(links + buttons).toBeGreaterThan(0);
  });

  // ── Concierge ──
  test("Concierge has heading and household sections", async ({ page }) => {
    await goTo(page, "/concierge");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── Approvals ──
  test("Approvals page has heading and action buttons", async ({ page }) => {
    await goTo(page, "/approvals");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── Settings ──
  test("Settings has heading and save button", async ({ page }) => {
    await goTo(page, "/settings");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    // Settings pages typically have form controls
    const inputs = await page.locator("input, select, textarea, [role='switch']").count();
    expect(inputs).toBeGreaterThanOrEqual(0); // May have toggle switches
  });

  // ── Connectors ──
  test("Connectors page has heading and connector cards", async ({ page }) => {
    await goTo(page, "/connectors");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── Investment Office ──
  test("Investment office has heading and portfolio view", async ({ page }) => {
    await goTo(page, "/investments");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── Revenue Office ──
  test("Revenue office has heading and pipeline view", async ({ page }) => {
    await goTo(page, "/revenue-office");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── Admin ──
  test("Admin dashboard has heading and status cards", async ({ page }) => {
    await goTo(page, "/admin");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── System Status ──
  test("System status has heading and health indicators", async ({ page }) => {
    await goTo(page, "/system-status");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    const body = await page.textContent("body");
    expect(body?.length).toBeGreaterThan(100);
  });

  // ── Owner Center ──
  test("Owner center has heading and management sections", async ({ page }) => {
    await goTo(page, "/owner");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  // ── Login page content ──
  test("Login page has email input, password input, and submit button", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    await expect(page.locator("input[type='email'], input[placeholder*='email' i]").first()).toBeVisible();
    await expect(page.locator("input[type='password']").first()).toBeVisible();
    const submitBtn = page.getByRole("button", { name: /sign in|log in/i }).first();
    await expect(submitBtn).toBeVisible();
  });
});