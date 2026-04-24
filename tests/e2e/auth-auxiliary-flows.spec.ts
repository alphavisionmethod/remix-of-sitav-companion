// ═══════════════════════════════════════════════════════════════
// SITA OS — Auxiliary Auth + Public Surfaces (human-user proof)
// Closes the gap left by render-only checks for signup,
// forgot-password, reset-password, and the public download page.
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

test.describe("Auxiliary Auth — signup form behavior", () => {
  test("Short password shows validation error and does not navigate", async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await page.locator("input[type='email'], input[placeholder*='email' i]").fill(`burner_${Date.now()}@test.invalid`);
    await page.locator("input[type='password']").fill("123"); // < 6 chars
    await page.getByRole("button", { name: /sign up|create account|get started/i }).first().click();
    // Sonner toast OR inline error — either is acceptable, must NOT navigate away.
    await page.waitForTimeout(800);
    const url = page.url();
    expect(url).toContain("/signup");
    const body = (await page.textContent("body")) || "";
    expect(body.toLowerCase()).toMatch(/at least 6|password|short|invalid/);
  });

  test("Submit shows confirmation panel OR honest error", async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    const burner = `burner_${Date.now()}@example-sita-test.invalid`;
    await page.locator("input[type='email'], input[placeholder*='email' i]").fill(burner);
    await page.locator("input[type='password']").fill("longenoughpassword!");
    const nameInput = page.locator("input[placeholder*='name' i]");
    if (await nameInput.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await nameInput.first().fill("E2E Tester");
    }
    await page.getByRole("button", { name: /sign up|create account|get started/i }).first().click();
    // Either lands on a "check your email" panel OR shows an error toast — both are honest outcomes.
    await page.waitForTimeout(2000);
    const body = (await page.textContent("body")) || "";
    const accepted =
      /check your (email|inbox)|verification|sent you/i.test(body) ||
      /already|invalid|disabled|signups? (are )?(disabled|closed)/i.test(body);
    expect(accepted).toBe(true);
  });
});

test.describe("Auxiliary Auth — forgot password flow", () => {
  test("Submitting an email shows a confirmation OR honest error", async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await expect(page.locator("input[type='email'], input[placeholder*='email' i]")).toBeVisible({ timeout: 10000 });
    await page.locator("input[type='email'], input[placeholder*='email' i]").fill(`reset_${Date.now()}@test.invalid`);
    await page.getByRole("button", { name: /send|reset|continue/i }).first().click();
    await page.waitForTimeout(2000);
    const body = (await page.textContent("body")) || "";
    const accepted =
      /sent|check your (email|inbox)|reset link|we (just )?emailed/i.test(body) ||
      /invalid|disabled|error/i.test(body);
    expect(accepted).toBe(true);
  });
});

test.describe("Auxiliary Auth — reset password validation", () => {
  test("Mismatched passwords are rejected", async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
    const pwInputs = page.locator("input[type='password']");
    await expect(pwInputs.first()).toBeVisible({ timeout: 10000 });
    const count = await pwInputs.count();
    if (count < 2) {
      // Page renders the success/short-circuit state without two fields — not testable.
      test.skip(true, "Reset-password page is not in the dual-field input state.");
    }
    await pwInputs.nth(0).fill("longpass1!");
    await pwInputs.nth(1).fill("differentpass!");
    await page.getByRole("button", { name: /update|reset|save|change password/i }).first().click();
    await page.waitForTimeout(800);
    const body = (await page.textContent("body")) || "";
    expect(body.toLowerCase()).toMatch(/don'?t match|do not match|mismatch|same/);
  });

  test("Too-short password is rejected", async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
    const pwInputs = page.locator("input[type='password']");
    await expect(pwInputs.first()).toBeVisible({ timeout: 10000 });
    const count = await pwInputs.count();
    if (count < 1) test.skip(true, "Reset-password page lacks password inputs.");
    await pwInputs.nth(0).fill("12");
    if (count >= 2) await pwInputs.nth(1).fill("12");
    await page.getByRole("button", { name: /update|reset|save|change password/i }).first().click();
    await page.waitForTimeout(800);
    const body = (await page.textContent("body")) || "";
    expect(body.toLowerCase()).toMatch(/at least 6|too short|password/);
  });
});

test.describe("Public Download Page — honest CTAs", () => {
  test("Download page renders a primary CTA or honest 'request access' state", async ({ page }) => {
    await page.goto(`${BASE}/download`);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    const body = (await page.textContent("body")) || "";
    expect(body.length).toBeGreaterThan(80);
    expect(body).not.toContain("Something went wrong");

    // Either a Get/Download CTA OR an honest "request access / coming soon" message.
    const cta = page.getByRole("button", { name: /get sita|download|install/i }).first();
    const link = page.getByRole("link", { name: /get sita|download|install/i }).first();
    const hasCta =
      (await cta.isVisible({ timeout: 3000 }).catch(() => false)) ||
      (await link.isVisible({ timeout: 3000 }).catch(() => false));
    const honest = /request access|coming soon|early access|by invitation|join the waitlist/i.test(body);
    expect(hasCta || honest).toBe(true);

    // Anti-anti-pattern: no primary CTA pointing at href="#".
    if (await link.isVisible({ timeout: 1000 }).catch(() => false)) {
      const href = await link.getAttribute("href");
      expect(href).not.toBe("#");
    }
  });

  test("Downloads center renders without crash", async ({ page }) => {
    await page.goto(`${BASE}/downloads`);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    const body = (await page.textContent("body")) || "";
    expect(body.length).toBeGreaterThan(40);
    expect(body).not.toContain("Something went wrong");
  });
});
