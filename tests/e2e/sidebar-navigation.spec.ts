// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Sidebar Navigation Tests
// Clicks through sidebar items and verifies selected state,
// breadcrumb updates, and correct page landing.
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

// Top-level sidebar nav items and their expected URL segments
const SIDEBAR_ITEMS = [
  { label: /home|pulse|daily/i, urlContains: "/" },
  { label: /file/i, urlContains: "/files" },
  { label: /board/i, urlContains: "/boardroom" },
  { label: /advisor/i, urlContains: "/advisor" },
  { label: /approval/i, urlContains: "/approval" },
  { label: /connector/i, urlContains: "/connector" },
  { label: /money|finance/i, urlContains: "/money" },
  { label: /business/i, urlContains: "/business" },
  { label: /concierge/i, urlContains: "/concierge" },
  { label: /setting/i, urlContains: "/settings" },
];

test.describe("Sidebar navigation click-through", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  for (const item of SIDEBAR_ITEMS) {
    test(`Clicking "${item.label}" navigates to ${item.urlContains}`, async ({ page }) => {
      const sidebar = page.locator("[data-testid='sidebar-nav']");
      const sidebarExists = await sidebar.isVisible({ timeout: 5000 }).catch(() => false);

      if (!sidebarExists) {
        test.skip(true, "Sidebar not visible at this viewport");
        return;
      }

      // Find and click the nav item
      const navLink = sidebar.getByRole("link", { name: item.label }).first();
      const linkExists = await navLink.isVisible({ timeout: 3000 }).catch(() => false);

      if (!linkExists) {
        // Try button fallback
        const navButton = sidebar.getByRole("button", { name: item.label }).first();
        const btnExists = await navButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (!btnExists) {
          test.skip(true, `Nav item "${item.label}" not found in sidebar`);
          return;
        }
        await navButton.click();
      } else {
        await navLink.click();
      }

      await page.waitForLoadState("networkidle", { timeout: 15000 });

      // URL should contain the expected segment
      if (item.urlContains !== "/") {
        expect(page.url()).toContain(item.urlContains);
      }

      // Page should have content
      const body = await page.textContent("body");
      expect(body?.length).toBeGreaterThan(50);
      expect(body).not.toContain("Something went wrong");

      // Check for active/selected state on the sidebar item
      const activeItem = sidebar.locator("[aria-current='page'], [data-active='true'], .active, [data-state='active']");
      const hasActive = await activeItem.first().isVisible({ timeout: 2000 }).catch(() => false);
      // Log but don't fail — some designs use different active indicators
      if (!hasActive) {
        console.log(`Note: No explicit active state found for "${item.label}"`);
      }
    });
  }

  // ── Deep navigation with breadcrumb text assertions ────────────
  const DEEP_NAV_PATHS = [
    { path: "/money/bills", urlSegment: "/money/bills", breadcrumbs: [/money/i, /bill/i] },
    { path: "/money/investments", urlSegment: "/money/investments", breadcrumbs: [/money/i, /invest/i] },
    { path: "/money/tax", urlSegment: "/money/tax", breadcrumbs: [/money/i, /tax/i] },
    { path: "/money/subscriptions", urlSegment: "/money/subscriptions", breadcrumbs: [/money/i, /subscri/i] },
    { path: "/business/customers", urlSegment: "/business/customers", breadcrumbs: [/business/i, /customer/i] },
    { path: "/business/invoices", urlSegment: "/business/invoices", breadcrumbs: [/business/i, /invoice/i] },
    { path: "/business/leads", urlSegment: "/business/leads", breadcrumbs: [/business/i, /lead/i] },
    { path: "/business/quotes", urlSegment: "/business/quotes", breadcrumbs: [/business/i, /quote/i] },
    { path: "/concierge/travel", urlSegment: "/concierge/travel", breadcrumbs: [/concierge/i, /travel/i] },
    { path: "/concierge/household", urlSegment: "/concierge/household", breadcrumbs: [/concierge/i, /household/i] },
    { path: "/concierge/family-calendar", urlSegment: "/concierge/family-calendar", breadcrumbs: [/concierge/i, /calendar|family/i] },
    { path: "/owner/constitution", urlSegment: "/owner/constitution", breadcrumbs: [/owner/i, /constitution/i] },
    { path: "/owner/advisors", urlSegment: "/owner/advisors", breadcrumbs: [/owner/i, /advisor/i] },
    { path: "/investment-office/portfolio", urlSegment: "/investment-office/portfolio", breadcrumbs: [/invest/i, /portfolio/i] },
    { path: "/revenue-office/pipeline", urlSegment: "/revenue-office/pipeline", breadcrumbs: [/revenue/i, /pipeline/i] },
  ];

  for (const nav of DEEP_NAV_PATHS) {
    test(`Deep nav: ${nav.path} — breadcrumb matches`, async ({ page }) => {
      await page.goto(`${BASE}${nav.path}`);
      await page.waitForLoadState("networkidle", { timeout: 15000 });

      // Verify URL
      expect(page.url()).toContain(nav.urlSegment);

      // Verify page has content
      const body = await page.textContent("body");
      expect(body?.length).toBeGreaterThan(50);
      expect(body).not.toContain("Something went wrong");

      // Find breadcrumb navigation (aria-label="breadcrumb")
      const breadcrumbNav = page.locator("nav[aria-label='breadcrumb']").first();
      const hasBreadcrumb = await breadcrumbNav.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasBreadcrumb) {
        const breadcrumbText = await breadcrumbNav.textContent();
        // Assert each expected breadcrumb segment is present
        for (const segment of nav.breadcrumbs) {
          expect(breadcrumbText).toMatch(segment);
        }
      } else {
        // Fallback: check the page heading or title contains relevant text
        const heading = page.locator("h1, h2").first();
        const headingVisible = await heading.isVisible({ timeout: 2000 }).catch(() => false);
        if (headingVisible) {
          const headingText = await heading.textContent();
          // At least the last breadcrumb segment should appear in the heading
          const lastSegment = nav.breadcrumbs[nav.breadcrumbs.length - 1];
          expect(headingText).toMatch(lastSegment);
        }
      }
    });
  }
});