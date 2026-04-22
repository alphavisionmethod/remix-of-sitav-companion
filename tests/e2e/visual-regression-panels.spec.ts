// ═══════════════════════════════════════════════════════════════
// SITA OS — Visual Regression: SlidePanel & SplitWorkspace
// Captures baselines across breakpoints for CI comparison
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

// Pages that use SlidePanel or SplitWorkspace patterns
const PANEL_PAGES = [
  { path: "/advisors", label: "Advisors-SlidePanel" },
  { path: "/files", label: "Files-SplitWorkspace" },
  { path: "/business/customers", label: "Customers-SplitWorkspace" },
  { path: "/settings", label: "Settings-Panel" },
];

const BREAKPOINTS = [
  { width: 1920, height: 1080, label: "DesktopFHD" },
  { width: 1366, height: 768, label: "Laptop" },
  { width: 768, height: 1024, label: "TabletPortrait" },
  { width: 375, height: 812, label: "Mobile" },
];

test.describe("Visual regression — Panel components", () => {
  test.skip(!EMAIL, "No TEST_USER_EMAIL configured");

  // Configure snapshot path for CI storage
  test.describe.configure({ mode: "serial" });

  for (const bp of BREAKPOINTS) {
    for (const pg of PANEL_PAGES) {
      test(`${pg.label}@${bp.label}`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await login(page);
        await page.goto(`${BASE}${pg.path}`);
        await page.waitForLoadState("networkidle", { timeout: 20000 });
        // Wait for animations and lazy content to settle
        await page.waitForTimeout(1000);
        // Disable animations for deterministic screenshots
        await page.addStyleTag({
          content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`,
        });
        await page.waitForTimeout(100);

        const snapshotName = `${pg.label}--${bp.label}.png`;
        await expect(page).toHaveScreenshot(
          snapshotName,
          {
            maxDiffPixelRatio: 0.01,
            threshold: 0.2,
            fullPage: false,
            animations: "disabled",
          }
        );
      });
    }
  }
});