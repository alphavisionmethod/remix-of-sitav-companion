import { test, expect } from "@playwright/test";

const VISUAL_PAGES = [
  { name: "login", path: "/login" },
  { name: "signup", path: "/signup" },
  { name: "forgot-password", path: "/forgot-password" },
];

const AUTH_PAGES = [
  { name: "home", path: "/" },
  { name: "business", path: "/business" },
  { name: "money", path: "/money" },
  { name: "files", path: "/files" },
  { name: "settings", path: "/settings" },
  { name: "boardroom", path: "/boardroom" },
  { name: "advisor", path: "/advisor" },
];

const OS_WINDOW_SURFACES = [
  { name: "desktop", path: "/desktop" },
  { name: "boardroom-full", path: "/boardroom" },
  { name: "approval-chamber", path: "/approval-chamber" },
  { name: "governance", path: "/governance" },
  { name: "sovereign-export", path: "/sovereign-export" },
  { name: "digital-twins", path: "/digital-twins" },
];

const PAGESHELL_SURFACES = [
  { name: "agent-activity", path: "/agent-activity" },
  { name: "outcome-engine", path: "/outcome-engine" },
  { name: "scenario-lab", path: "/scenario-lab" },
  { name: "notification-center", path: "/notification-center" },
  { name: "connector-hub", path: "/connector-hub" },
  { name: "customer-health", path: "/customer-health" },
  { name: "life-simulator", path: "/life-simulator" },
];

const ADMIN_SURFACES = [
  { name: "admin-ai-debate", path: "/admin/ai-agent-debate" },
  { name: "admin-runtime-status", path: "/admin/ai-runtime-status" },
];

test.describe("Visual Regression — Public Pages", () => {
  for (const pg of VISUAL_PAGES) {
    test(`${pg.name} visual snapshot`, async ({ page }) => {
      await page.goto(pg.path);
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`${pg.name}.png`, {
        maxDiffPixelRatio: 0.02,
        threshold: 0.2,
        animations: "disabled",
      });
    });
  }
});

// ── Revenue Office Surface Screenshots ──────────────────────────
const REVENUE_PAGES = [
  { name: "growth-boardroom", path: "/revenue-office/growth-boardroom" },
  { name: "booking-center", path: "/revenue-office/booking-center" },
  { name: "pipeline-studio", path: "/revenue-office/pipeline-studio" },
  { name: "conversion-lab", path: "/revenue-office/conversion-lab" },
  { name: "offers-workspace", path: "/revenue-office/offers-workspace" },
  { name: "leak-detector", path: "/revenue-office/leak-detector" },
];

test.describe("Visual Regression — Revenue Office", () => {
  for (const pg of REVENUE_PAGES) {
    test(`${pg.name} renders with PageShell framing`, async ({ page }) => {
      await page.goto(pg.path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(`revenue-${pg.name}.png`, {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: "disabled",
      });
    });
  }
});

test.describe("Visual Regression — OS/Window Surfaces", () => {
  for (const pg of OS_WINDOW_SURFACES) {
    test(`${pg.name} layout snapshot`, async ({ page }) => {
      await page.goto(pg.path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(`${pg.name}-surface.png`, {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: "disabled",
      });
    });
  }
});

test.describe("Visual Regression — PageShell Standalone Pages", () => {
  for (const pg of PAGESHELL_SURFACES) {
    test(`${pg.name} framing snapshot`, async ({ page }) => {
      await page.goto(pg.path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(`${pg.name}-pageshell.png`, {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: "disabled",
      });
    });
  }
});

test.describe("Visual Regression — Admin Surfaces", () => {
  for (const pg of ADMIN_SURFACES) {
    test(`${pg.name} layout snapshot`, async ({ page }) => {
      await page.goto(pg.path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(`${pg.name}-admin.png`, {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: "disabled",
      });
    });
  }
});

test.describe("Visual Regression — Auth-Gated Pages", () => {
  for (const pg of AUTH_PAGES) {
    test(`${pg.name} renders or redirects cleanly`, async ({ page }) => {
      await page.goto(pg.path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(`${pg.name}-gate.png`, {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: "disabled",
      });
    });
  }
});