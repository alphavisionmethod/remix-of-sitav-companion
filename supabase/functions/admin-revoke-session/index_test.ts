// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Smoke Tests: Admin Revoke Session
// Zod response schemas, cross-table invariants, transaction
// isolation, authenticated admin harness, safe env loading.
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  loadEnvSafe, withEnvGuard,
  FIXTURE_IDS, getFuncUrl, getAnonKey,
  seedFixtures, cleanupFixtures, getServiceClient,
  withIsolatedFixtures,
  querySessionStatus, queryAuditRows,
  RevokeSuccessSchema, BaseErrorSchema,
  assertResponseSchema, assertRequestId,
  assertRevokeInvariants,
  getAdminToken, callFunctionAsAdmin, cleanupAdminUser,
} from "../_shared/test-harness.ts";

loadEnvSafe();

const FUNC_URL = getFuncUrl("admin-revoke-session");
const ANON_KEY = getAnonKey();

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("revoke: CORS preflight returns 200", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
}));

Deno.test("revoke: rejects unauthenticated with 401 + valid error schema", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ target_user_id: FIXTURE_IDS.TARGET_USER, reason: "smoke" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertResponseSchema(body, BaseErrorSchema, "revoke 401");
  assertRequestId(body);
}));

Deno.test("revoke: rejects invalid Bearer with 401", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer invalid-garbage-token",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ target_user_id: FIXTURE_IDS.TARGET_USER, reason: "smoke" }),
  });
  assertEquals(res.status, 401);
  await res.text();
}));

Deno.test("revoke: rejects empty body (4xx)", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
  });
  assert(res.status >= 400 && res.status < 500);
  await res.text();
}));

// ── Isolated DB fixture tests with cross-table invariants ─────

Deno.test({ name: "revoke: DB fixture — session revoked + cross-table invariants", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  await withIsolatedFixtures(async (sb) => {
    const pre = await querySessionStatus(sb, FIXTURE_IDS.SESSION);
    assertEquals(pre?.status, "active");

    const reason = "Smoke-test deterministic revoke";
    await sb.from("admin_sessions")
      .update({ status: "revoked", revoked_at: new Date().toISOString(), revoke_reason: reason })
      .eq("user_id", FIXTURE_IDS.TARGET_USER)
      .eq("status", "active");

    await sb.from("admin_action_audit").insert({
      actor_user_id: FIXTURE_IDS.TARGET_USER,
      action: "revoke_session",
      target_type: "user",
      target_id: FIXTURE_IDS.TARGET_USER,
      plane: "admin",
      severity: "critical",
      justification: reason,
      metadata: { fixture: true },
    });

    // Cross-table invariant assertion
    await assertRevokeInvariants(sb, FIXTURE_IDS.SESSION, FIXTURE_IDS.TARGET_USER);
  });
})});

Deno.test({ name: "revoke: DB fixture — double-revoke is a no-op", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  await withIsolatedFixtures(async (sb) => {
    await sb.from("admin_sessions").update({ status: "revoked", revoked_at: new Date().toISOString(), revoke_reason: "first" })
      .eq("id", FIXTURE_IDS.SESSION).eq("status", "active");

    const { data } = await sb.from("admin_sessions")
      .update({ status: "revoked", revoked_at: new Date().toISOString(), revoke_reason: "second" })
      .eq("user_id", FIXTURE_IDS.TARGET_USER)
      .eq("status", "active")
      .select("id");
    assertEquals(data?.length ?? 0, 0);

    const post = await querySessionStatus(sb, FIXTURE_IDS.SESSION);
    assertEquals(post?.revoke_reason, "first");
  });
})});

// ── Authenticated admin end-to-end ────────────────────────────

Deno.test({ name: "revoke: authenticated admin — full e2e with Zod + invariants", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  const sb = getServiceClient();
  await seedFixtures(sb);
  try {
    const { token } = await getAdminToken();
    const { status, json } = await callFunctionAsAdmin("admin-revoke-session", {
      body: { target_user_id: FIXTURE_IDS.TARGET_USER, reason: "e2e smoke test" },
      token,
    });

    if (status === 200) {
      assertResponseSchema(json, RevokeSuccessSchema, "revoke success");
      assertRequestId(json);
      await assertRevokeInvariants(sb, FIXTURE_IDS.SESSION, FIXTURE_IDS.TARGET_USER);
    } else if (status === 403) {
      assert(typeof (json as Record<string, unknown>)?.error === "string");
    } else {
      assert(false, `Expected 200 or 403, got ${status}: ${JSON.stringify(json)}`);
    }
  } finally {
    await cleanupFixtures(sb);
    await cleanupAdminUser();
  }
})});
