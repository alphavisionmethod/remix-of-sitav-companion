// ═══════════════════════════════════════════════════════════════
// Shared deterministic test fixture helper for admin endpoint E2E tests.
// Seeds DB rows, creates a service-role Supabase client, and
// provides cleanup utilities.
// ═══════════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// ── Deterministic IDs ─────────────────────────────────────────
export const FIXTURE_IDS = {
  // A fake "target user" UUID for all admin operations
  TARGET_USER: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001",
  // Fixture account row
  ACCOUNT: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0010",
  // Fixture admin session row
  SESSION: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0020",
  // Fixture webhook delivery log row (no target_url → simulated replay)
  WEBHOOK_SIM: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0030",
  // Fixture webhook delivery log row (with bogus target_url → replay_failed)
  WEBHOOK_FAIL: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0031",
} as const;

/** Unique tag to identify audit rows created during a single test run */
export const TEST_RUN_TAG = `smoke-${Date.now()}`;

// ── Service-role client ───────────────────────────────────────

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  return createClient(url, key);
}

export function getFuncUrl(funcName: string): string {
  const url = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL")!;
  return `${url}/functions/v1/${funcName}`;
}

export function getAnonKey(): string {
  return Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
}

// ── Seed fixtures ─────────────────────────────────────────────

export async function seedFixtures(sb: SupabaseClient) {
  // 1) Account row for target user — status = "active" so we can assert it flips to "pending_setup"
  await sb.from("accounts").upsert({
    id: FIXTURE_IDS.ACCOUNT,
    user_id: FIXTURE_IDS.TARGET_USER,
    display_name: "Smoke-Test Target",
    status: "active",
    metadata: { seed: true },
  }, { onConflict: "id" });

  // 2) Active admin session for target user — so revoke can flip it
  await sb.from("admin_sessions").upsert({
    id: FIXTURE_IDS.SESSION,
    user_id: FIXTURE_IDS.TARGET_USER,
    status: "active",
    mfa_verified: false,
    started_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600_000).toISOString(),
  }, { onConflict: "id" });

  // 3) Failed webhook — no target_url (simulated replay)
  await sb.from("webhook_delivery_log").upsert({
    id: FIXTURE_IDS.WEBHOOK_SIM,
    status: "failed",
    event_type: "test.simulated",
    payload: { test: true },
    target_url: null,
    retry_count: 0,
    source: "smoke-test",
  }, { onConflict: "id" });

  // 4) Failed webhook — bogus target_url (will fail on replay)
  await sb.from("webhook_delivery_log").upsert({
    id: FIXTURE_IDS.WEBHOOK_FAIL,
    status: "failed",
    event_type: "test.will_fail",
    payload: { test: true },
    target_url: "https://0.0.0.0:1/nonexistent",
    retry_count: 0,
    source: "smoke-test",
  }, { onConflict: "id" });
}

// ── Cleanup fixtures ─────────────────────────────────────────

export async function cleanupFixtures(sb: SupabaseClient) {
  // Delete in reverse-dependency order; ignore errors for rows that may not exist.
  await sb.from("admin_action_audit").delete().in("target_id", [
    FIXTURE_IDS.TARGET_USER,
    FIXTURE_IDS.WEBHOOK_SIM,
    FIXTURE_IDS.WEBHOOK_FAIL,
  ]);
  await sb.from("webhook_delivery_log").delete().in("id", [FIXTURE_IDS.WEBHOOK_SIM, FIXTURE_IDS.WEBHOOK_FAIL]);
  await sb.from("admin_sessions").delete().eq("id", FIXTURE_IDS.SESSION);
  await sb.from("accounts").delete().eq("id", FIXTURE_IDS.ACCOUNT);
}

// ── DB Query Helpers ──────────────────────────────────────────

export async function queryAccountStatus(sb: SupabaseClient, accountId: string): Promise<string | null> {
  const { data } = await sb.from("accounts").select("status").eq("id", accountId).maybeSingle();
  return data?.status ?? null;
}

export async function querySessionStatus(sb: SupabaseClient, sessionId: string): Promise<{ status: string; revoked_at: string | null; revoke_reason: string | null } | null> {
  const { data } = await sb.from("admin_sessions").select("status, revoked_at, revoke_reason").eq("id", sessionId).maybeSingle();
  return data ?? null;
}

export async function queryWebhookStatus(sb: SupabaseClient, webhookId: string): Promise<{ status: string; retry_count: number; last_error: string | null } | null> {
  const { data } = await sb.from("webhook_delivery_log").select("status, retry_count, last_error").eq("id", webhookId).maybeSingle();
  return data ?? null;
}

export async function queryAuditRows(sb: SupabaseClient, action: string, targetId: string) {
  const { data } = await sb
    .from("admin_action_audit")
    .select("*")
    .eq("action", action)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}