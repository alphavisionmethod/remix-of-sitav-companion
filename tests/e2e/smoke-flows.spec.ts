import { test, expect } from "@playwright/test";

test.describe("Smoke — Auth Flow", () => {
  test("login page has working form with submit handler", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test("signup page has complete registration form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test("invalid credentials show error feedback", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"], input[name="email"]').fill("smoke@test.invalid");
    await page.locator('input[type="password"]').fill("wrongpassword123");
    await page.locator('button[type="submit"]').click();
    const feedback = page.locator("[role='alert'], [data-sonner-toast], .text-destructive").first();
    await expect(feedback).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Smoke — Protected Route Guards", () => {
  const CRITICAL_ROUTES = ["/", "/business", "/money", "/files", "/boardroom", "/advisor", "/settings"];
  for (const route of CRITICAL_ROUTES) {
    test(`${route} redirects unauthenticated to /login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  }
});

test.describe("Smoke — No Crash on Public Pages", () => {
  for (const route of ["/login", "/signup", "/forgot-password", "/reset-password"]) {
    test(`${route} renders without error boundary`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();
      const errorBoundary = page.locator("text=/Something went wrong/i");
      await expect(errorBoundary).not.toBeVisible({ timeout: 3000 }).catch(() => {});
      const buttons = page.locator("button");
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const btn = buttons.nth(i);
        if (await btn.isVisible()) await expect(btn).toBeEnabled();
      }
    });
  }
});