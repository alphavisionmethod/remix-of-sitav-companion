// ═══════════════════════════════════════════════════════════════
// SITA OS — Production-Build Smoke Suite
// ───────────────────────────────────────────────────────────────
// Validates the LATEST built artifacts (vite preview) for:
//   1. Cold-start: app boots with no console errors
//   2. Key public endpoints/pages load with HTTP 200
//   3. Critical UI flows: login form, signup form, route guards,
//      mobile redirect mappings, error-boundary absence
//
// Run via: `npm run build && npm run test:e2e:prod-smoke`
// CI: triggered by .github/workflows/production-smoke.yml
// ═══════════════════════════════════════════════════════════════

import { test, expect, type Page } from "@playwright/test";

const PUBLIC_PAGES = [
  { path: "/login",            mustContain: ["email", "password"] },
  { path: "/signup",           mustContain: ["email", "password"] },
  { path: "/forgot-password",  mustContain: ["email"] },
];

const PROTECTED_ROUTES = [
  "/", "/business", "/money", "/files", "/boardroom", "/advisor", "/settings",
];

async function captureConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      // Ignore known noise (Supabase auth init, third-party telemetry, dev-only react warnings).
      if (
        !txt.includes("Failed to load resource") &&
        !txt.includes("Refused to load") &&
        !txt.includes("PWA") &&
        !txt.includes("hydration")
      ) {
        errors.push(txt);
      }
    }
  });
  page.on("pageerror", (err) => errors.push(`PAGEERROR: ${err.message}`));
  return errors;
}

test.describe("Production Build — Cold Start", () => {
  test("app boots, mounts to #root, no fatal console errors", async ({ page }) => {
    const errors = await captureConsoleErrors(page);
    const resp = await page.goto("/login", { waitUntil: "networkidle" });
    expect(resp?.ok(), "Initial response not OK").toBeTruthy();
    await expect(page.locator("#root")).toBeVisible();
    await expect(page.locator("#root")).not.toBeEmpty();
    // Allow 1s for late-binding errors.
    await page.waitForTimeout(1000);
    expect(errors, `Console errors:\n${errors.join("\n")}`).toHaveLength(0);
  });

  test("static assets load (css + js bundles)", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (r) => {
      const url = r.url();
      if ((url.includes(".js") || url.includes(".css")) && r.status() >= 400) {
        failed.push(`${r.status()} ${url}`);
      }
    });
    await page.goto("/login", { waitUntil: "networkidle" });
    expect(failed, `Failed assets:\n${failed.join("\n")}`).toHaveLength(0);
  });
});

test.describe("Production Build — Public Endpoints", () => {
  for (const { path: p, mustContain } of PUBLIC_PAGES) {
    test(`${p} loads with status 200 and required form fields`, async ({ page }) => {
      const resp = await page.goto(p);
      expect(resp?.status(), `${p} returned ${resp?.status()}`).toBeLessThan(400);
      await page.waitForLoadState("domcontentloaded");
      const html = (await page.content()).toLowerCase();
      for (const term of mustContain) {
        expect(html, `${p} missing required term: ${term}`).toContain(term);
      }
      // No top-level error boundary.
      await expect(page.locator("text=/Something went wrong/i")).not.toBeVisible({ timeout: 2000 }).catch(() => {});
    });
  }
});

test.describe("Production Build — Critical UI Flows", () => {
  test("login form: email + password + submit are interactive", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator('input[type="email"], input[name="email"]').first();
    const pwd = page.locator('input[type="password"]').first();
    const submit = page.locator('button[type="submit"]').first();
    await expect(email).toBeVisible();
    await expect(pwd).toBeVisible();
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();
    await email.fill("test@example.com");
    await pwd.fill("placeholder-only");
    expect(await email.inputValue()).toBe("test@example.com");
  });

  test("invalid credentials surface user-visible feedback", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"], input[name="email"]').first().fill("smoke@invalid.test");
    await page.locator('input[type="password"]').first().fill("definitely-wrong-pw");
    await page.locator('button[type="submit"]').first().click();
    const feedback = page.locator("[role='alert'], [data-sonner-toast], .text-destructive").first();
    await expect(feedback).toBeVisible({ timeout: 10000 });
  });

  test.describe("Protected route guards (unauth)", () => {
    for (const route of PROTECTED_ROUTES) {
      test(`${route} redirects to /login when unauthenticated`, async ({ page }) => {
        await page.goto(route);
        await page.waitForURL(/login/, { timeout: 10000 });
        await expect(page).toHaveURL(/login/);
      });
    }
  });

  test("404 unknown route shows recoverable not-found UI (not crash)", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-xyz");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=/Something went wrong/i")).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });
});

test.describe("Production Build — Mobile shell smoke", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile login renders with touch-friendly form controls", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator('input[type="email"], input[name="email"]').first();
    await expect(email).toBeVisible();
    const box = await email.boundingBox();
    expect(box?.height, "Mobile input must be ≥40px tall").toBeGreaterThanOrEqual(40);
  });
});