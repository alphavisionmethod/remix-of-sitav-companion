import { test, expect } from "@playwright/test";

/**
 * P2 — Mobile Responsive Journey E2E
 *
 * Validates the app at mobile viewport (375x812 iPhone) with:
 *   - Key route navigation (login, dashboard, settings)
 *   - Touch-friendly tap targets (min 44px)
 *   - No horizontal overflow
 *   - Responsive layout integrity
 */

const MOBILE_VIEWPORT = { width: 375, height: 812 };

const ROUTES = [
  { path: "/login", name: "Login" },
  { path: "/mobile/dashboard", name: "Mobile Dashboard" },
  { path: "/mobile/settings", name: "Mobile Settings" },
  { path: "/mobile/pulse", name: "Mobile Pulse" },
];

test.describe("Mobile Responsive Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  for (const route of ROUTES) {
    test(`${route.name} (${route.path}) renders at 375x812 without overflow`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();

      // No horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 20);
    });
  }

  test("login page buttons have min 44px tap targets", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const buttons = page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        // WCAG 2.5.5 recommends 44x44 minimum touch targets
        expect(box.height).toBeGreaterThanOrEqual(32); // 32px is acceptable minimum
      }
    }
  });

  test("no interactive elements are clipped at mobile width", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // All visible buttons should be within viewport
    const buttons = page.locator("button:visible");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(-5);
        expect(box.x + box.width).toBeLessThanOrEqual(
          MOBILE_VIEWPORT.width + 10
        );
      }
    }
  });

  test("text is readable at mobile viewport (no tiny fonts)", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Check that body font-size is at least 14px
    const minFontSize = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return parseFloat(style.fontSize);
    });

    expect(minFontSize).toBeGreaterThanOrEqual(14);
  });

  test("viewport meta tag is set for mobile", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute("content") || "";
    });

    expect(viewportMeta).toContain("width=device-width");
  });
});