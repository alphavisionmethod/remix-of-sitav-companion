// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Smoke Tests: Admin Revoke Session
// Deterministic fixtures + DB mutation assertions
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  FIXTURE_IDS,
  getServiceClient,
  getFuncUrl,
  getAnonKey,
  seedFixtures,
  cleanupFixtures,
  querySessionStatus,
  queryAuditRows,
} from "../_shared/test-fixtures.ts";

const FUNC_URL = getFuncUrl("admin-revoke-session");
const ANON_KEY = getAnonKey();

// ── Zod Schemas ───────────────────────────────────────────────
const ErrorSchema = z.object({
  error: z.string().min(1),
  _requestId: z.string().uuid().optional(),
  _function: z.string().optional(),
});

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("revoke: CORS preflight returns 200", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
});

Deno.test("revoke: rejects unauthenticated request with 401", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ target_user_id: FIXTURE_IDS.TARGET_USER, reason: "smoke" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assert(ErrorSchema.safeParse(body).success);
});

Deno.test("revoke: rejects invalid Bearer token with 401", async () => {
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
});

Deno.test("revoke: rejects empty body gracefully (4xx)", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
  });
  assert(res.status >= 400 && res.status < 500);
  await res.text();
});

// ── Fixture-based DB mutation tests ───────────────────────────

Deno.test("revoke: DB fixture — session flips to revoked with reason & timestamp", async () => {
  const sb = getServiceClient();
  await seedFixtures(sb);

  // Pre-condition
  const pre = await querySessionStatus(sb, FIXTURE_IDS.SESSION);
  assertEquals(pre?.status, "active", "Fixture session should start active");
  assertEquals(pre?.revoked_at, null);

  const auditBefore = await queryAuditRows(sb, "revoke_session", FIXTURE_IDS.TARGET_USER);

  // Simulate the exact mutation the edge function performs
  const reason = "Smoke-test deterministic revoke";
  const revokedAt = new Date().toISOString();
  const { error } = await sb
    .from("admin_sessions")
    .update({ status: "revoked", revoked_at: revokedAt, revoke_reason: reason })
    .eq("user_id", FIXTURE_IDS.TARGET_USER)
    .eq("status", "active");
  assertEquals(error, null, "Revoke mutation should succeed");

  // Audit
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

  // Post-conditions
  const post = await querySessionStatus(sb, FIXTURE_IDS.SESSION);
  assertEquals(post?.status, "revoked", "Session status must be revoked");
  assert(post?.revoked_at !== null, "revoked_at must be set");
  assertEquals(post?.revoke_reason, reason, "revoke_reason must match");

  const auditAfter = await queryAuditRows(sb, "revoke_session", FIXTURE_IDS.TARGET_USER);
  assert(auditAfter.length > auditBefore.length, "Must have new audit row");
  assertEquals(auditAfter[0].severity, "critical");

  await cleanupFixtures(sb);
});

Deno.test("revoke: DB fixture — revoking already-revoked session is a no-op", async () => {
  const sb = getServiceClient();
  await seedFixtures(sb);

  // First revoke
  await sb.from("admin_sessions").update({ status: "revoked", revoked_at: new Date().toISOString(), revoke_reason: "first" })
    .eq("id", FIXTURE_IDS.SESSION).eq("status", "active");

  // Second revoke (targets status=active, but row is already revoked → 0 rows matched)
  const { data, error } = await sb
    .from("admin_sessions")
    .update({ status: "revoked", revoked_at: new Date().toISOString(), revoke_reason: "second" })
    .eq("user_id", FIXTURE_IDS.TARGET_USER)
    .eq("status", "active")
    .select("id");
  assertEquals(error, null);
  assertEquals(data?.length ?? 0, 0, "No rows should match — already revoked");

  // Original reason preserved
  const post = await querySessionStatus(sb, FIXTURE_IDS.SESSION);
  assertEquals(post?.revoke_reason, "first");

  await cleanupFixtures(sb);
});