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