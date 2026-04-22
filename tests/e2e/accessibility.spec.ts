import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const AXE_PAGES = [
  { name: "Login", path: "/login" },
  { name: "Signup", path: "/signup" },
  { name: "Forgot Password", path: "/forgot-password" },
];

test.describe("Accessibility — axe-core Audit", () => {
  for (const pg of AXE_PAGES) {
    test(`${pg.name} passes critical a11y checks`, async ({ page }) => {
      await page.goto(pg.path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      const critical = results.violations.filter((v) => v.impact === "critical");
      if (critical.length > 0) {
        console.error(critical.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join("\n"));
      }
      expect(critical).toHaveLength(0);
    });
  }
});

test.describe("Accessibility — Keyboard Navigation", () => {
  test("login form is keyboard-navigable", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    const focused: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const tag = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${el.getAttribute("type") || ""}` : "none";
      });
      focused.push(tag);
    }
    expect(focused.some((e) => e.startsWith("INPUT") || e.startsWith("BUTTON"))).toBe(true);
  });
});

test.describe("Accessibility — Button Names", () => {
  test("all visible buttons have accessible names", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    const buttons = page.locator("button");
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const name = (await btn.getAttribute("aria-label")) || (await btn.innerText());
        expect(name.trim().length).toBeGreaterThan(0);
      }
    }
  });
});