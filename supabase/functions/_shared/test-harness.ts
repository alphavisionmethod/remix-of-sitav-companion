// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Edge Function Test Harness
// Safe env loading, Zod response schemas, transaction isolation,
// authenticated admin user, cross-table invariant assertions.
// ═══════════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

// ═══════════════════════════════════════════════════════════════
// 1. SAFE ENV LOADER
// ═══════════════════════════════════════════════════════════════

/** Load .env files gracefully — never throws */
export function loadEnvSafe(): void {
  try {
    // deno-lint-ignore no-explicit-any
    const dotenv = (globalThis as any).__dotenvLoaded;
    if (dotenv) return;
    // Attempt sync load from project root .env
    const load = async () => {
      const { loadSync } = await import("https://deno.land/std@0.224.0/dotenv/mod.ts");
      loadSync({ allowEmptyValues: true, export: true });
    };
    load().catch(() => { /* .env not found — ok */ });
    // deno-lint-ignore no-explicit-any
    (globalThis as any).__dotenvLoaded = true;
  } catch { /* graceful */ }
}

/** Get an env var or return undefined — never throws */
export function safeEnv(key: string): string | undefined {
  return Deno.env.get(key);
}

/** Get an env var or skip the test with a clear message */
export function requireEnv(key: string): string {
  const val = safeEnv(key);
  if (!val) {
    throw new Deno.errors.NotSupported(`Env var ${key} missing — skipping test`);
  }
  return val;
}

/** Check if the minimum env for edge function smoke tests is available */
export function hasRequiredEnv(): boolean {
  const url = safeEnv("SUPABASE_URL") ?? safeEnv("VITE_SUPABASE_URL");
  const key = safeEnv("SUPABASE_ANON_KEY") ?? safeEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
  return !!(url && key);
}

/** Check if service-role env is available (needed for DB fixture tests) */
export function hasServiceRoleEnv(): boolean {
  return hasRequiredEnv() && !!safeEnv("SUPABASE_SERVICE_ROLE_KEY");
}

/** Wrap a test fn to skip gracefully when env is missing */
export function withEnvGuard(
  requiredLevel: "anon" | "service_role",
  fn: () => Promise<void>,
): () => Promise<void> {
  return async () => {
    const ok = requiredLevel === "service_role" ? hasServiceRoleEnv() : hasRequiredEnv();
    if (!ok) {
      console.warn(`⚠️  Skipping: ${requiredLevel} env vars not available`);
      return;
    }
    await fn();
  };
}

// ═══════════════════════════════════════════════════════════════
// 2. ZOD RESPONSE SCHEMAS
// ═══════════════════════════════════════════════════════════════

/** Standard _requestId format — UUID v4 */
export const RequestIdSchema = z.string().uuid();

/** Standard success envelope — every admin endpoint must include _requestId */
export const BaseSuccessSchema = z.object({
  _requestId: RequestIdSchema,
}).passthrough();

/** Standard error envelope */
export const BaseErrorSchema = z.object({
  error: z.string().min(1),
  _requestId: RequestIdSchema.optional(),
  _function: z.string().optional(),
});

// ── Per-endpoint success schemas ──────────────────────────────

export const ResetSuccessSchema = z.object({
  success: z.literal(true),
  target_user_id: z.string().uuid(),
  _requestId: RequestIdSchema,
});

export const RevokeSuccessSchema = z.object({
  success: z.literal(true),
  revoked_count: z.number().int().min(0),
  target_user_id: z.string().uuid(),
  _requestId: RequestIdSchema,
});

export const WebhookListSuccessSchema = z.object({
  ok: z.literal(true),
  webhooks: z.array(z.object({
    id: z.string().uuid(),
    status: z.string(),
    event_type: z.string(),
  }).passthrough()),
  _requestId: RequestIdSchema,
});

export const WebhookReplaySuccessSchema = z.object({
  ok: z.literal(true),
  webhook_id: z.string().uuid(),
  replay_status: z.string(),
  _requestId: RequestIdSchema,
});

export const SupportBundleSuccessSchema = z.object({
  ok: z.literal(true),
  bundleId: z.string().min(1),
  bundleType: z.string(),
  _requestId: RequestIdSchema,
});

export const EnvGatePassSchema = z.object({
  gate: z.literal("pass"),
  platform: z.string(),
  release_tag: z.string().nullable(),
  dry_run: z.boolean(),
  checked_at: z.string(),
  total_vars_checked: z.number().int().min(0),
  errors: z.array(z.unknown()).length(0),
  warnings: z.array(z.string()),
  _requestId: RequestIdSchema,
});

export const EnvGateFailSchema = z.object({
  gate: z.literal("fail"),
  platform: z.string(),
  errors: z.array(z.object({
    path: z.string(),
    code: z.string(),
    message: z.string(),
    received: z.string(),
  })).min(1),
  warnings: z.array(z.string()),
  _requestId: RequestIdSchema,
});

export const ErrorIngestSuccessSchema = z.object({
  ok: z.literal(true),
  inserted: z.number().int().min(0),
  _requestId: RequestIdSchema.optional(),
});

export const AlertIngestSuccessSchema = z.object({
  ok: z.literal(true),
  inserted: z.number().int().min(0),
  _requestId: RequestIdSchema.optional(),
});

// ═══════════════════════════════════════════════════════════════
// 3. DETERMINISTIC IDS & SERVICE CLIENT
// ═══════════════════════════════════════════════════════════════

export const FIXTURE_IDS = {
  TARGET_USER: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001",
  ACCOUNT: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0010",
  SESSION: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0020",
  WEBHOOK_SIM: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0030",
  WEBHOOK_FAIL: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0031",
  // Test admin user (created by auth harness)
  ADMIN_EMAIL: "sita-smoke-admin@test.local",
  ADMIN_PASSWORD: "SitaSmokeT3st!Adm1n$2024",
} as const;

export const TEST_RUN_TAG = `smoke-${Date.now()}`;

export function getServiceClient(): SupabaseClient {
  const url = requireEnv("SUPABASE_URL") ?? safeEnv("VITE_SUPABASE_URL")!;
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

export function getFuncUrl(funcName: string): string {
  const url = safeEnv("SUPABASE_URL") ?? safeEnv("VITE_SUPABASE_URL")!;
  return `${url}/functions/v1/${funcName}`;
}

export function getAnonKey(): string {
  return safeEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ?? safeEnv("SUPABASE_ANON_KEY")!;
}

// ═══════════════════════════════════════════════════════════════
// 4. TRANSACTION-ISOLATED TEST WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Wraps a test function in fixture seed → action → assert → cleanup.
 * Cleanup always runs, even on assertion failure.
 * Each test gets its own seeded state and deterministic IDs.
 */
export async function withIsolatedFixtures(
  fn: (sb: SupabaseClient) => Promise<void>,
): Promise<void> {
  const sb = getServiceClient();
  await seedFixtures(sb);
  try {
    await fn(sb);
  } finally {
    await cleanupFixtures(sb);
  }
}

/**
 * Same as withIsolatedFixtures but generates a unique suffix for all
 * fixture IDs so multiple tests can run concurrently without collisions.
 */
export function isolatedTestIds(suffix: string) {
  return {
    ACCOUNT: `aaaaaaaa-bbbb-cccc-dddd-${suffix.padEnd(12, "0").slice(0, 12)}`,
    SESSION: `aaaaaaaa-bbbb-cccc-eeee-${suffix.padEnd(12, "0").slice(0, 12)}`,
    WEBHOOK_SIM: `aaaaaaaa-bbbb-cccc-ffff-${suffix.padEnd(12, "0").slice(0, 12)}`,
    TARGET_USER: FIXTURE_IDS.TARGET_USER,
  };
}

// ═══════════════════════════════════════════════════════════════
// 5. AUTHENTICATED ADMIN HARNESS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates (or re-uses) a real admin user with an admin role,
 * returns a valid JWT access token for authenticated endpoint tests.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 *
 * IMPORTANT: This creates a real user in auth.users and assigns
 * the 'admin' role via user_roles. Call `cleanupAdminUser()` after.
 */
export async function getAdminToken(): Promise<{ token: string; userId: string }> {
  const sb = getServiceClient();
  const url = safeEnv("SUPABASE_URL") ?? safeEnv("VITE_SUPABASE_URL")!;
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  // Try sign in first (user may already exist from prior run)
  const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({
    email: FIXTURE_IDS.ADMIN_EMAIL,
    password: FIXTURE_IDS.ADMIN_PASSWORD,
  });

  let userId: string;
  let token: string;

  if (signInData?.session) {
    userId = signInData.session.user.id;
    token = signInData.session.access_token;
  } else {
    // Create user via admin API
    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        email: FIXTURE_IDS.ADMIN_EMAIL,
        password: FIXTURE_IDS.ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "SITA Smoke Admin" },
      }),
    });
    const createBody = await createRes.json();
    if (!createBody.id) {
      throw new Error(`Failed to create admin user: ${JSON.stringify(createBody)}`);
    }
    userId = createBody.id;

    // Sign in to get token
    const { data: newSignIn, error: newErr } = await sb.auth.signInWithPassword({
      email: FIXTURE_IDS.ADMIN_EMAIL,
      password: FIXTURE_IDS.ADMIN_PASSWORD,
    });
    if (!newSignIn?.session) {
      throw new Error(`Failed to sign in as admin: ${JSON.stringify(newErr)}`);
    }
    token = newSignIn.session.access_token;
  }

  // Ensure admin role exists (idempotent upsert)
  await sb.from("user_roles").upsert(
    { user_id: userId, role: "admin" },
    { onConflict: "user_id,role" },
  );

  // Ensure profile exists
  await sb.from("profiles").upsert(
    { user_id: userId, display_name: "SITA Smoke Admin" },
    { onConflict: "user_id" },
  );

  // Ensure account exists
  await sb.from("accounts").upsert(
    {
      user_id: userId,
      display_name: "Smoke Admin Account",
      status: "active",
      metadata: { smoke_admin: true },
    },
    { onConflict: "user_id" },
  );

  return { token, userId };
}

/** Cleanup the smoke-test admin user (call in afterAll/cleanup) */
export async function cleanupAdminUser(): Promise<void> {
  try {
    const sb = getServiceClient();
    const url = safeEnv("SUPABASE_URL") ?? safeEnv("VITE_SUPABASE_URL")!;
    const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

    // Find user by email
    const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=50`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    });
    const listBody = await listRes.json();
    const users = listBody.users ?? listBody ?? [];
    const adminUser = users.find((u: { email?: string }) => u.email === FIXTURE_IDS.ADMIN_EMAIL);
    if (adminUser) {
      // Remove role, profile, account first
      await sb.from("user_roles").delete().eq("user_id", adminUser.id);
      await sb.from("profiles").delete().eq("user_id", adminUser.id);
      await sb.from("accounts").delete().eq("user_id", adminUser.id);
      // Delete auth user
      await fetch(`${url}/auth/v1/admin/users/${adminUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
      });
    }
  } catch (e) {
    console.warn("Admin user cleanup failed (non-fatal):", e);
  }
}

/**
 * Call an edge function with a real admin JWT.
 * Returns { status, json, text, headers }.
 */
export async function callFunctionAsAdmin(
  funcName: string,
  opts: { method?: string; body?: unknown; params?: string; token?: string } = {},
): Promise<{ status: number; json: unknown; text: string; headers: Headers }> {
  const token = opts.token ?? (await getAdminToken()).token;
  const method = opts.method ?? "POST";
  const funcUrl = getFuncUrl(funcName);
  const url = `${funcUrl}${opts.params ? `?${opts.params}` : ""}`;
  const anonKey = getAnonKey();

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, json, text, headers: res.headers };
}

// ═══════════════════════════════════════════════════════════════
// 6. CROSS-TABLE INVARIANT ASSERTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * After a session revocation, assert cross-table consistency:
 * - admin_sessions row has status=revoked, revoked_at set, revoke_reason set
 * - admin_action_audit has a corresponding revoke_session row
 * - The audit row's target_id matches the session's user_id
 */
export async function assertRevokeInvariants(
  sb: SupabaseClient,
  sessionId: string,
  userId: string,
): Promise<void> {
  const session = await querySessionStatus(sb, sessionId);
  assert(session !== null, "Session row must exist");
  assert(session.status === "revoked", `Session status must be 'revoked', got '${session.status}'`);
  assert(session.revoked_at !== null, "revoked_at must be set");
  assert(session.revoke_reason !== null, "revoke_reason must be set");

  const audits = await queryAuditRows(sb, "revoke_session", userId);
  assert(audits.length > 0, "Audit table must have a revoke_session row");
  assert(audits[0].target_id === userId, "Audit target_id must match user_id");
  assert(audits[0].severity === "critical", "Revoke audit must be critical severity");
  assert(audits[0].plane === "admin", "Revoke audit must be admin plane");
}

/**
 * After a user reset, assert cross-table consistency:
 * - accounts row has status=pending_setup, metadata reset
 * - admin_action_audit has a corresponding reset_user_setup row
 */
export async function assertResetInvariants(
  sb: SupabaseClient,
  accountId: string,
  userId: string,
): Promise<void> {
  const status = await queryAccountStatus(sb, accountId);
  assert(status === "pending_setup", `Account status must be 'pending_setup', got '${status}'`);

  const audits = await queryAuditRows(sb, "reset_user_setup", userId);
  assert(audits.length > 0, "Audit table must have a reset_user_setup row");
  assert(audits[0].target_id === userId, "Audit target_id must match user_id");
  assert(audits[0].severity === "high", "Reset audit must be high severity");
}

/**
 * After a webhook replay, assert cross-table consistency:
 * - webhook_delivery_log row has expected status and incremented retry_count
 * - admin_action_audit has a corresponding webhook_replay row
 */
export async function assertWebhookReplayInvariants(
  sb: SupabaseClient,
  webhookId: string,
  expectedStatus: string,
  expectedRetryCount: number,
): Promise<void> {
  const wh = await queryWebhookStatus(sb, webhookId);
  assert(wh !== null, "Webhook row must exist");
  assert(wh.status === expectedStatus, `Webhook status must be '${expectedStatus}', got '${wh.status}'`);
  assert(wh.retry_count === expectedRetryCount, `retry_count must be ${expectedRetryCount}, got ${wh.retry_count}`);

  const audits = await queryAuditRows(sb, "webhook_replay", webhookId);
  assert(audits.length > 0, "Audit table must have a webhook_replay row");
  assert(audits[0].target_id === webhookId, "Audit target_id must match webhook_id");
}

/**
 * After a support bundle generation, assert cross-table consistency:
 * - admin_action_audit has the correct action, plane, severity, and metadata
 */
export async function assertBundleInvariants(
  sb: SupabaseClient,
  targetId: string,
  bundleType: string,
): Promise<void> {
  const audits = await queryAuditRows(sb, "generate_support_bundle", targetId);
  assert(audits.length > 0, "Audit must have generate_support_bundle row");
  assert(audits[0].plane === "support", "Bundle audit must be support plane");
  assert(audits[0].severity === "medium", "Bundle audit must be medium severity");
  const meta = audits[0].metadata as Record<string, unknown>;
  assert(meta.bundleType === bundleType, `Metadata bundleType must be '${bundleType}'`);
  assert(typeof meta.bundleId === "string", "Metadata must include bundleId string");
}

/**
 * After a release env gate check, assert audit row consistency:
 * - admin_action_audit row exists with correct gate result and platform
 */
export async function assertEnvGateInvariants(
  sb: SupabaseClient,
  releaseTag: string,
  expectedGate: "pass" | "fail",
  expectedPlatform: string,
): Promise<void> {
  const audits = await queryAuditRows(sb, "release_env_gate", releaseTag);
  assert(audits.length > 0, "Audit must have release_env_gate row");
  const meta = audits[0].metadata as Record<string, unknown>;
  assert(meta.gate === expectedGate, `Gate must be '${expectedGate}', got '${meta.gate}'`);
  assert(meta.platform === expectedPlatform, `Platform must be '${expectedPlatform}', got '${meta.platform}'`);
  if (expectedGate === "pass") {
    assert(audits[0].severity === "info", "Pass gate must be info severity");
    assert(meta.error_count === 0, "Pass gate must have 0 errors");
  } else {
    assert(audits[0].severity === "high", "Fail gate must be high severity");
    assert((meta.error_count as number) > 0, "Fail gate must have >0 errors");
  }
}

// ═══════════════════════════════════════════════════════════════
// 7. DB QUERY HELPERS (carried forward + enhanced)
// ═══════════════════════════════════════════════════════════════

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
    .limit(10);
  return data ?? [];
}

// ═══════════════════════════════════════════════════════════════
// 8. SEED / CLEANUP FIXTURES
// ═══════════════════════════════════════════════════════════════

export async function seedFixtures(sb: SupabaseClient) {
  await sb.from("accounts").upsert({
    id: FIXTURE_IDS.ACCOUNT,
    user_id: FIXTURE_IDS.TARGET_USER,
    display_name: "Smoke-Test Target",
    status: "active",
    metadata: { seed: true },
  }, { onConflict: "id" });

  await sb.from("admin_sessions").upsert({
    id: FIXTURE_IDS.SESSION,
    user_id: FIXTURE_IDS.TARGET_USER,
    status: "active",
    mfa_verified: false,
    started_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600_000).toISOString(),
  }, { onConflict: "id" });

  await sb.from("webhook_delivery_log").upsert({
    id: FIXTURE_IDS.WEBHOOK_SIM,
    status: "failed",
    event_type: "test.simulated",
    payload: { test: true },
    target_url: null,
    retry_count: 0,
    source: "smoke-test",
  }, { onConflict: "id" });

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

export async function cleanupFixtures(sb: SupabaseClient) {
  await sb.from("admin_action_audit").delete().in("target_id", [
    FIXTURE_IDS.TARGET_USER,
    FIXTURE_IDS.WEBHOOK_SIM,
    FIXTURE_IDS.WEBHOOK_FAIL,
  ]);
  await sb.from("webhook_delivery_log").delete().in("id", [FIXTURE_IDS.WEBHOOK_SIM, FIXTURE_IDS.WEBHOOK_FAIL]);
  await sb.from("admin_sessions").delete().eq("id", FIXTURE_IDS.SESSION);
  await sb.from("accounts").delete().eq("id", FIXTURE_IDS.ACCOUNT);
}

// ═══════════════════════════════════════════════════════════════
// 9. RESPONSE VALIDATION HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Validate a response body against a Zod schema and assert _requestId format.
 * Throws with a clear message on mismatch.
 */
export function assertResponseSchema<T>(
  body: unknown,
  schema: z.ZodType<T>,
  context: string,
): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues.map(i => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`${context}: response schema mismatch:\n${issues}\n\nBody: ${JSON.stringify(body, null, 2)}`);
  }
  return result.data;
}

/**
 * Assert that _requestId is a valid UUID v4 (if present).
 */
export function assertRequestId(body: unknown): void {
  if (body && typeof body === "object" && "_requestId" in body) {
    const rid = (body as Record<string, unknown>)._requestId;
    if (typeof rid === "string") {
      assert(RequestIdSchema.safeParse(rid).success, `_requestId '${rid}' is not a valid UUID`);
    }
  }
}
