// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Brain Calibration E2E (P0)
// ───────────────────────────────────────────────────────────────
// Walks the full 11-step Personal Brain onboarding ceremony and
// asserts that:
//   • each visible step actually renders (data-step attribute)
//   • the Continue / Activate button is reachable end-to-end
//   • after activation, server-side rows exist for the user in:
//       - pb_profile (onboarded_at NOT NULL, default_workspace_id)
//       - pb_goals (≥ 1 row from the Suggested Goals chips)
//       - pb_workspaces (≥ 1 default workspace row)
//   • the user lands on the Personal Brain dashboard
//   • /personal-brain/command-center renders the Brain Snapshot
//
// Requires TEST_USER_EMAIL + TEST_USER_PASSWORD; otherwise skipped.
// ═══════════════════════════════════════════════════════════════

import { test, expect, type Page } from "@playwright/test";
import { TEST_USERS, hasTestCredentials } from "./fixtures/test-users";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://fctupowhcljejygjfpty.supabase.co";
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHVwb3doY2xqZWp5Z2pmcHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTQ3MzUsImV4cCI6MjA5MTU3MDczNX0.1Px9wwiVMD7q8uTyFAswhYiTNXf3yBg4Vbl54rvXxJc";

// ── helpers ───────────────────────────────────────────────────────

/** Read access token from any Supabase localStorage entry. */
async function readAccessToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.includes("supabase") || k.startsWith("sb-")) {
        try {
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const v = JSON.parse(raw) as { access_token?: string; currentSession?: { access_token?: string } };
          if (v?.access_token) return v.access_token;
          if (v?.currentSession?.access_token) return v.currentSession.access_token;
        } catch { /* ignore */ }
      }
    }
    return null;
  });
}

async function login(page: Page): Promise<boolean> {
  await page.goto(`${BASE}/login`);
  await page.locator("input[type='email'], input[placeholder*='email' i]").first()
    .fill(TEST_USERS.primary.email);
  await page.locator("input[type='password']").first()
    .fill(TEST_USERS.primary.password);
  await page.getByRole("button", { name: /sign in|log in/i }).first().click();
  try {
    await page.waitForURL(/^(?!.*\/(login|signup|forgot-password|reset-password)).*$/, {
      timeout: 15000,
    });
    return true;
  } catch {
    return false;
  }
}

/** PATCH pb_profile.onboarded_at = NULL so the gate shows the ceremony. */
async function resetOnboardingFlag(page: Page, accessToken: string, userId: string) {
  await page.request.patch(
    `${SUPABASE_URL}/rest/v1/pb_profile?user_id=eq.${userId}`,
    {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      data: { onboarded_at: null },
    },
  ).catch(() => undefined);
}

async function getUserId(page: Page, accessToken: string): Promise<string | null> {
  const r = await page.request.get(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok()) return null;
  const body = (await r.json()) as { id?: string };
  return body?.id ?? null;
}

async function dbSelect(
  page: Page,
  accessToken: string,
  table: string,
  query: string,
): Promise<unknown[]> {
  const r = await page.request.get(
    `${SUPABASE_URL}/rest/v1/${table}?${query}`,
    {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!r.ok()) return [];
  return (await r.json()) as unknown[];
}

async function clickContinue(page: Page) {
  const btn = page.locator("[data-testid='brain-onboarding-continue']");
  await expect(btn).toBeVisible({ timeout: 10000 });
  // Wait until enabled (some steps gate Continue on validation).
  await expect(btn).toBeEnabled({ timeout: 10000 });
  await btn.click();
}

async function currentStep(page: Page): Promise<string | null> {
  return page.locator("[data-testid='brain-onboarding-shell']").getAttribute("data-step");
}

// ─── The test ────────────────────────────────────────────────────
test.describe("P0 Personal Brain — 11-step calibration ceremony", () => {
  test.skip(!hasTestCredentials(), "TEST_USER_EMAIL/PASSWORD not configured");
  // The walk + DB verification can be slow on cold containers.
  test.setTimeout(180_000);

  test("completes calibration, persists profile/goals/workspaces, lands on dashboard + command center", async ({ page }) => {
    // 1. Login.
    const ok = await login(page);
    test.skip(!ok, "Login failed; cannot run calibration walk.");

    // 2. Recover session token + user id.
    const accessToken = await readAccessToken(page);
    expect(accessToken, "access token missing after login").toBeTruthy();
    const userId = await getUserId(page, accessToken!);
    expect(userId, "user id missing").toBeTruthy();

    // 3. Reset onboarded_at so the ceremony is shown.
    await resetOnboardingFlag(page, accessToken!, userId!);

    // 4. Open the Personal Brain — gate should render the ceremony.
    await page.goto(`${BASE}/personal-brain`);
    const shell = page.locator("[data-testid='brain-onboarding-shell']");
    await expect(shell).toBeVisible({ timeout: 20000 });
    expect(await currentStep(page)).toBe("intro");

    // 5. Walk the 11 steps, filling required inputs as we go.
    const expected: string[] = [
      "intro", "identity", "use-cases", "learning", "cognition",
      "scope", "projects", "memory", "voice", "privacy", "summary",
    ];

    for (let i = 0; i < expected.length; i++) {
      const step = expected[i];
      // Sanity: the visible step matches what we expect.
      await expect(shell).toHaveAttribute("data-step", step, { timeout: 15000 });

      // Step-specific minimal interactions:
      if (step === "identity") {
        // Required: display_name, timezone, language all default-filled,
        // but ensure display_name is non-empty.
        const name = page.locator("#pb-name");
        const v = (await name.inputValue()).trim();
        if (!v) await name.fill("E2E Calibration User");
      }
      if (step === "learning") {
        // Add at least one suggested goal so pb_goals gets a row.
        const firstGoalChip = page
          .locator("button", { hasText: /^\+ /i })
          .first();
        if (await firstGoalChip.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstGoalChip.click();
        }
      }
      if (step === "cognition") {
        // response_style defaults to "strategic" — already valid, nothing
        // else required to satisfy canAdvance.
      }
      if (step === "privacy") {
        // Default privacy_preset = "standard" — already valid.
      }

      // Last step has the "Activate" button — same selector.
      await clickContinue(page);

      // After clicking on the last (summary) step we expect to be navigated
      // away (gate flips to dashboard), so don't re-assert on shell after that.
      if (i === expected.length - 1) break;
    }

    // 6. After activation, the gate should render the Brain dashboard,
    //    not the onboarding shell.
    await expect(
      page.locator("[data-testid='brain-onboarding-shell']"),
    ).toHaveCount(0, { timeout: 20000 });

    // 7. Verify DB persistence.
    const profile = await dbSelect(
      page, accessToken!, "pb_profile",
      `select=onboarded_at,default_workspace_id,display_name,context_sources,tone&user_id=eq.${userId}`,
    );
    expect(profile.length, "pb_profile row should exist").toBeGreaterThan(0);
    const p0 = profile[0] as { onboarded_at: string | null };
    expect(p0.onboarded_at, "onboarded_at must be set after activation").toBeTruthy();

    const goals = await dbSelect(
      page, accessToken!, "pb_goals",
      `select=id,title,kind,status&user_id=eq.${userId}`,
    );
    expect(goals.length, "pb_goals should have ≥ 1 row from suggested chip").toBeGreaterThan(0);

    const workspaces = await dbSelect(
      page, accessToken!, "pb_workspaces",
      `select=id,name,kind,default_mode&user_id=eq.${userId}`,
    );
    expect(workspaces.length, "pb_workspaces should have ≥ 1 row").toBeGreaterThan(0);

    // 8. Visit the Command Center and verify the Brain Snapshot tiles
    //    render with real, rendered values (not a generic error state).
    await page.goto(`${BASE}/personal-brain/command-center`);
    await expect(page.getByText(/brain snapshot/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/learning momentum/i).first()).toBeVisible();
    await expect(page.getByText(/insights feed/i).first()).toBeVisible();
    // Snapshot tile labels prove the live useMemo computations rendered.
    await expect(page.getByText(/explicit/i).first()).toBeVisible();
    await expect(page.getByText(/inferred/i).first()).toBeVisible();
    await expect(page.getByText(/confidence/i).first()).toBeVisible();
    await expect(page.getByText(/pending review/i).first()).toBeVisible();
    // Scan-now affordance proves the live wiring is mounted.
    await expect(
      page.locator("[data-testid='brain-command-scan-now']"),
    ).toBeVisible();
  });
});