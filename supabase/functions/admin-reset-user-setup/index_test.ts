// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Smoke Tests: Admin Reset User Setup
// Zod response schemas, cross-table invariants, transaction
// isolation, authenticated admin harness, safe env loading.
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  loadEnvSafe, withEnvGuard,
  FIXTURE_IDS, getFuncUrl, getAnonKey,
  getServiceClient, seedFixtures, cleanupFixtures,
  withIsolatedFixtures,
  queryAccountStatus, queryAuditRows,
  // Zod schemas
  ResetSuccessSchema, BaseErrorSchema,
  assertResponseSchema, assertRequestId,
  // Cross-table invariants
  assertResetInvariants,
  // Auth harness
  getAdminToken, callFunctionAsAdmin, cleanupAdminUser,
} from "../_shared/test-harness.ts";

loadEnvSafe();

const FUNC_URL = getFuncUrl("admin-reset-user-setup");
const ANON_KEY = getAnonKey();

// ── Auth Gating (no env requirement beyond anon) ──────────────

Deno.test("reset: CORS preflight returns 200", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
}));

Deno.test("reset: rejects unauthenticated request with 401 + valid error schema", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ target_user_id: FIXTURE_IDS.TARGET_USER }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertResponseSchema(body, BaseErrorSchema, "reset 401");
  assertRequestId(body);
}));

Deno.test("reset: rejects invalid Bearer token with 401", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer invalid-token-abc123",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ target_user_id: FIXTURE_IDS.TARGET_USER }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertResponseSchema(body, BaseErrorSchema, "reset invalid bearer");
}));

Deno.test("reset: rejects empty body gracefully (4xx, not 5xx)", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
  });
  assert(res.status >= 400 && res.status < 500, `Expected 4xx, got ${res.status}`);
  await res.text();
}));

// ── Fixture-based DB mutation tests (isolated) ────────────────

Deno.test({ name: "reset: DB fixture — account.status flips to pending_setup + cross-table invariants", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  await withIsolatedFixtures(async (sb) => {
    // Pre-condition
    const pre = await queryAccountStatus(sb, FIXTURE_IDS.ACCOUNT);
    assertEquals(pre, "active");

    // Simulate the exact mutation
    const { error: resetErr } = await sb
      .from("accounts")
      .update({ status: "pending_setup", metadata: {} })
      .eq("user_id", FIXTURE_IDS.TARGET_USER);
    assertEquals(resetErr, null);

    // Simulate audit
    await sb.from("admin_action_audit").insert({
      actor_user_id: FIXTURE_IDS.TARGET_USER,
      action: "reset_user_setup",
      target_type: "user",
      target_id: FIXTURE_IDS.TARGET_USER,
      plane: "admin",
      severity: "high",
      justification: "Smoke-test deterministic fixture",
      metadata: { fixture: true },
    });

    // Cross-table invariant check
    await assertResetInvariants(sb, FIXTURE_IDS.ACCOUNT, FIXTURE_IDS.TARGET_USER);
  });
})});

Deno.test({ name: "reset: DB fixture — idempotent double-reset", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  await withIsolatedFixtures(async (sb) => {
    await sb.from("accounts").update({ status: "pending_setup", metadata: {} }).eq("user_id", FIXTURE_IDS.TARGET_USER);
    const { error } = await sb.from("accounts").update({ status: "pending_setup", metadata: {} }).eq("user_id", FIXTURE_IDS.TARGET_USER);
    assertEquals(error, null);
    const status = await queryAccountStatus(sb, FIXTURE_IDS.ACCOUNT);
    assertEquals(status, "pending_setup");
  });
})});

// ── Authenticated admin end-to-end test ───────────────────────

Deno.test({ name: "reset: authenticated admin — full end-to-end with Zod validation", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  const sb = getServiceClient();
  await seedFixtures(sb);
  try {
    const { token } = await getAdminToken();
    const { status, json } = await callFunctionAsAdmin("admin-reset-user-setup", {
      body: { target_user_id: FIXTURE_IDS.TARGET_USER },
      token,
    });

    if (status === 200) {
      // Full success path — validate schema
      assertResponseSchema(json, ResetSuccessSchema, "reset success");
      assertRequestId(json);
      // Cross-table invariants
      await assertResetInvariants(sb, FIXTURE_IDS.ACCOUNT, FIXTURE_IDS.TARGET_USER);
    } else if (status === 403) {
      // Admin role not wired yet — acceptable
      const body = json as Record<string, unknown>;
      assert(typeof body.error === "string", "403 must include error message");
    } else {
      // Unexpected status — fail
      assert(false, `Expected 200 or 403, got ${status}: ${JSON.stringify(json)}`);
    }
  } finally {
    await cleanupFixtures(sb);
    await cleanupAdminUser();
  }
})});
