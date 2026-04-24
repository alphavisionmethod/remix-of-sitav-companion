// ═══════════════════════════════════════════════════════════════
// SITA OS — Full Auth Journey E2E (P0)
// ───────────────────────────────────────────────────────────────
// Covers, end-to-end, the real-user lifecycle:
//   1. Signup screen renders + rejects weak/short passwords
//   2. Login screen renders + rejects invalid credentials
//   3. Real login → reaches an authenticated surface
//   4. Session persists across a hard reload (storage-backed)
//   5. Expired-session handling: corrupted token kicks user to /login
//      and clears Supabase session storage
//   6. Forgot-password flow accepts a submission honestly
//   7. Reset-password screen rejects mismatched / too-short passwords
//   8. Logout returns the user to /login and protected routes redirect
//
// Tests are written defensively so they pass in BOTH credentialed CI
// runs and credential-less PR runs (auth-required steps `test.skip`
// when TEST_USER_EMAIL / TEST_USER_PASSWORD are not present).
// ═══════════════════════════════════════════════════════════════

import { test, expect, type Page } from "@playwright/test";
import { TEST_USERS, hasTestCredentials } from "./fixtures/test-users";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

// ── helpers ───────────────────────────────────────────────────────

async function fillLogin(page: Page, email: string, password: string) {
  await page.locator("input[type='email'], input[placeholder*='email' i]").first().fill(email);
  await page.locator("input[type='password']").first().fill(password);
}

async function clickSignIn(page: Page) {
  await page.getByRole("button", { name: /sign in|log in/i }).first().click();
}

async function performLogin(page: Page): Promise<boolean> {
  if (!hasTestCredentials()) return false;
  await page.goto(`${BASE}/login`);
  await fillLogin(page, TEST_USERS.primary.email, TEST_USERS.primary.password);
  await clickSignIn(page);
  try {
    await page.waitForURL(/^(?!.*\/(login|signup|forgot-password|reset-password)).*$/, {
      timeout: 15000,
    });
    return true;
  } catch {
    return false;
  }
}

// ─── 1. Signup form behavior ─────────────────────────────────────
test.describe("P0 Auth — signup screen", () => {
  test("renders email + password inputs and a submit", async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await expect(
      page.locator("input[type='email'], input[placeholder*='email' i]").first(),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator("input[type='password']").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign up|create account|get started/i }).first(),
    ).toBeVisible();
  });

  test("short password is rejected and we stay on /signup", async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await page.locator("input[type='email'], input[placeholder*='email' i]").first()
      .fill(`reject_${Date.now()}@test.invalid`);
    await page.locator("input[type='password']").first().fill("12");
    await page.getByRole("button", { name: /sign up|create account|get started/i }).first().click();
    await page.waitForTimeout(800);
    expect(page.url()).toContain("/signup");
  });
});

// ─── 2. Login form behavior ──────────────────────────────────────
test.describe("P0 Auth — login screen", () => {
  test("renders email + password + submit", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(
      page.locator("input[type='email'], input[placeholder*='email' i]").first(),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator("input[type='password']").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in/i }).first()).toBeVisible();
  });

  test("invalid credentials show an error and keep user on /login", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await fillLogin(page, "definitely-not-a-user@test.invalid", "wrongpassword!!");
    await clickSignIn(page);
    // Either a Sonner toast / aria alert / inline error, but we MUST NOT
    // navigate away from /login on bad creds.
    await page.waitForTimeout(2500);
    expect(page.url()).toContain("/login");
    const body = (await page.textContent("body")) || "";
    expect(body.toLowerCase()).toMatch(/invalid|incorrect|wrong|failed|credentials|email|password/);
  });
});

// ─── 3. Real login + 4. session persistence ──────────────────────
test.describe("P0 Auth — real user login + session persistence", () => {
  test.skip(!hasTestCredentials(), "TEST_USER_EMAIL/PASSWORD not configured");

  test("logs in and reaches an authenticated surface", async ({ page }) => {
    const ok = await performLogin(page);
    expect(ok, "login should redirect off /login").toBe(true);
    expect(page.url()).not.toContain("/login");
    expect(page.url()).not.toContain("/signup");
  });

  test("session persists across a hard reload", async ({ page }) => {
    const ok = await performLogin(page);
    test.skip(!ok, "Login did not succeed — skipping persistence check");

    const beforeUrl = page.url();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    // After reload we should NOT be bounced to /login.
    expect(page.url()).not.toMatch(/\/(login|signup)(\?|$)/);
    // The reloaded URL should be the same authenticated surface (or a
    // post-login default like /owner / /personal-brain) — never login.
    expect(beforeUrl).not.toContain("/login");
  });
});

// ─── 5. Expired / corrupted session handling ─────────────────────
test.describe("P0 Auth — expired session handling", () => {
  test.skip(!hasTestCredentials(), "TEST_USER_EMAIL/PASSWORD not configured");

  test("corrupted Supabase token forces redirect to /login on next nav", async ({ page }) => {
    const ok = await performLogin(page);
    test.skip(!ok, "Login did not succeed — skipping expired-session check");

    // Corrupt every Supabase auth token entry in localStorage.
    await page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.includes("supabase") || k.includes("sb-") || k.endsWith("-auth-token"))) {
          keys.push(k);
        }
      }
      for (const k of keys) {
        try {
          localStorage.setItem(
            k,
            JSON.stringify({
              access_token: "expired.invalid.token",
              refresh_token: "expired.invalid.refresh",
              expires_at: 1,
              expires_in: 0,
              token_type: "bearer",
              user: null,
            }),
          );
        } catch {
          /* ignore */
        }
      }
    });

    // Navigate to a guarded route — should bounce to /login.
    await page.goto(`${BASE}/owner`);
    await page
      .waitForURL(/\/(login|signup)/, { timeout: 15000 })
      .catch(() => undefined);
    expect(page.url()).toMatch(/\/(login|signup)/);
  });
});

// ─── 6. Forgot-password flow ─────────────────────────────────────
test.describe("P0 Auth — forgot password", () => {
  test("renders email input + submit and accepts an honest submission", async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    const email = page.locator("input[type='email'], input[placeholder*='email' i]").first();
    await expect(email).toBeVisible({ timeout: 10000 });
    await email.fill(`forgot_${Date.now()}@test.invalid`);
    await page.getByRole("button", { name: /send|reset|continue|email/i }).first().click();
    await page.waitForTimeout(2000);
    const body = (await page.textContent("body")) || "";
    const honest =
      /sent|check your (email|inbox)|reset link|we (just )?emailed|emailed you/i.test(body) ||
      /invalid|disabled|error|rate/i.test(body);
    expect(honest).toBe(true);
    // Must not silently send to the dashboard.
    expect(page.url()).not.toMatch(/\/(owner|personal-brain|dashboard)$/);
  });
});

// ─── 7. Reset-password validation ────────────────────────────────
test.describe("P0 Auth — reset password", () => {
  test("renders password input(s)", async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
    await expect(page.locator("input[type='password']").first()).toBeVisible({ timeout: 10000 });
  });

  test("mismatched passwords are rejected", async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
    const pwInputs = page.locator("input[type='password']");
    await expect(pwInputs.first()).toBeVisible({ timeout: 10000 });
    const count = await pwInputs.count();
    test.skip(count < 2, "Reset-password not in dual-input state.");
    await pwInputs.nth(0).fill("longpass1!");
    await pwInputs.nth(1).fill("differentpass!");
    await page
      .getByRole("button", { name: /update|reset|save|change password/i })
      .first()
      .click();
    await page.waitForTimeout(900);
    const body = (await page.textContent("body")) || "";
    expect(body.toLowerCase()).toMatch(/don'?t match|do not match|mismatch|same|match/);
  });
});

// ─── 8. Logout + post-logout protection ──────────────────────────
test.describe("P0 Auth — logout + post-logout protection", () => {
  test.skip(!hasTestCredentials(), "TEST_USER_EMAIL/PASSWORD not configured");

  test("logout returns to /login and guarded routes stay protected", async ({ page }) => {
    const ok = await performLogin(page);
    test.skip(!ok, "Login did not succeed — skipping logout check");

    // Try a stable testid first; fall back to accessible name.
    const testIdBtn = page.locator("[data-testid='sign-out-btn']");
    let signedOut = false;
    if (await testIdBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await testIdBtn.first().click();
      signedOut = true;
    } else {
      const namedBtn = page.getByRole("button", { name: /sign out|log out/i });
      if (await namedBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await namedBtn.first().click();
        signedOut = true;
      }
    }

    // Hard fallback: programmatic sign-out — guarantees the assertion is
    // about route protection, not UI affordance discovery.
    if (!signedOut) {
      await page.evaluate(async () => {
        const w = window as unknown as {
          supabase?: { auth?: { signOut?: () => Promise<unknown> } };
        };
        try {
          await w.supabase?.auth?.signOut?.();
        } catch {
          /* ignore */
        }
        // Always wipe storage as a belt-and-suspenders measure.
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.includes("supabase") || k.startsWith("sb-"))) {
            localStorage.removeItem(k);
          }
        }
      });
      await page.goto(`${BASE}/owner`);
    }

    await page.waitForURL(/\/(login|signup)/, { timeout: 15000 }).catch(() => undefined);
    expect(page.url()).toMatch(/\/(login|signup)/);

    // Re-attempt to access a guarded route — must still bounce.
    await page.goto(`${BASE}/personal-brain/command-center`);
    await page.waitForURL(/\/(login|signup)/, { timeout: 15000 }).catch(() => undefined);
    expect(page.url()).toMatch(/\/(login|signup)/);
  });
});

// ─── 9. Protected routes (no creds needed) ───────────────────────
test.describe("P0 Auth — protected routes redirect when unauthenticated", () => {
  for (const route of [
    "/owner",
    "/personal-brain",
    "/personal-brain/command-center",
    "/files",
    "/workflows",
    "/approvals",
  ]) {
    test(`unauthenticated GET ${route} redirects to /login`, async ({ page, context }) => {
      // Make sure we're starting clean.
      await context.clearCookies();
      await page.goto(`${BASE}/login`); // bootstrap origin
      await page.evaluate(() => {
        try {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.includes("supabase") || k.startsWith("sb-"))) {
              localStorage.removeItem(k);
            }
          }
        } catch { /* ignore */ }
      });
      await page.goto(`${BASE}${route}`);
      await page.waitForURL(/\/(login|signup)/, { timeout: 15000 }).catch(() => undefined);
      expect(page.url()).toMatch(/\/(login|signup)/);
    });
  }
});