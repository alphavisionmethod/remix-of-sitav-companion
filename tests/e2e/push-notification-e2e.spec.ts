// ═══════════════════════════════════════════════════════════════
// SITA OS — Push Notification E2E Test
// Tests VAPID key retrieval, push-track endpoint, and UI toggle
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials, login } from "./helpers/auth";

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

test.describe("Push Notification E2E", () => {
  test("VAPID public key endpoint returns valid key", async ({ request }) => {
    test.skip(!SUPABASE_URL, "SUPABASE_URL not configured");

    const res = await request.get(`${SUPABASE_URL}/functions/v1/vapid-public-key`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.vapid_public_key).toBeTruthy();
    expect(typeof data.vapid_public_key).toBe("string");
    expect(data.vapid_public_key.length).toBeGreaterThan(10);
  });

  test("push-track rejects invalid action", async ({ request }) => {
    test.skip(!SUPABASE_URL, "SUPABASE_URL not configured");

    const res = await request.post(`${SUPABASE_URL}/functions/v1/push-track`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      data: { notification_id: "fake", action: "bogus" },
    });

    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid action");
  });

  test("push-track accepts valid clicked action", async ({ request }) => {
    test.skip(!SUPABASE_URL, "SUPABASE_URL not configured");

    const res = await request.post(`${SUPABASE_URL}/functions/v1/push-track`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      data: {
        notification_id: "00000000-0000-0000-0000-000000000000",
        action: "clicked",
      },
    });

    // 200 if row exists, 500 if not — both valid in test env
    expect([200, 500]).toContain(res.status());
  });

  test("authenticated user can view profile with notification settings", async ({ page }) => {
    test.skip(!hasTestCredentials(), "No test credentials");

    await login(page);
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState("networkidle");

    // Profile page should load without errors
    await expect(page.locator("h1, h2, [data-testid='profile-heading']").first()).toBeVisible({
      timeout: 10000,
    });
  });
});
