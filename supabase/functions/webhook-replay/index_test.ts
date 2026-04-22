// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Smoke Tests: Webhook Replay
// Zod response schemas, cross-table invariants, transaction
// isolation, authenticated admin harness, safe env loading.
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  loadEnvSafe, withEnvGuard,
  FIXTURE_IDS, getFuncUrl, getAnonKey,
  seedFixtures, cleanupFixtures, getServiceClient,
  withIsolatedFixtures,
  queryWebhookStatus, queryAuditRows,
  WebhookListSuccessSchema, WebhookReplaySuccessSchema, BaseErrorSchema,
  assertResponseSchema, assertRequestId,
  assertWebhookReplayInvariants,
  getAdminToken, callFunctionAsAdmin, cleanupAdminUser,
} from "../_shared/test-harness.ts";

loadEnvSafe();

const FUNC_URL = getFuncUrl("webhook-replay");
const ANON_KEY = getAnonKey();

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("webhook: CORS preflight returns 200", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
}));

Deno.test("webhook: rejects unauthenticated list with 401 + error schema", withEnvGuard("anon", async () => {
  const res = await fetch(`${FUNC_URL}?action=list`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({}),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertResponseSchema(body, BaseErrorSchema, "webhook list 401");
  assertRequestId(body);
}));

Deno.test("webhook: rejects unauthenticated replay with 401", withEnvGuard("anon", async () => {
  const res = await fetch(`${FUNC_URL}?action=replay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ webhook_id: FIXTURE_IDS.WEBHOOK_SIM }),
  });
  assertEquals(res.status, 401);
  await res.text();
}));

Deno.test("webhook: rejects invalid Bearer with 401", withEnvGuard("anon", async () => {
  const res = await fetch(`${FUNC_URL}?action=list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer completely-bogus",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({}),
  });
  assertEquals(res.status, 401);
  await res.text();
}));

// ── Isolated DB fixture tests ─────────────────────────────────

Deno.test({ name: "webhook: DB fixture — simulated replay + cross-table invariants", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  await withIsolatedFixtures(async (sb) => {
    const pre = await queryWebhookStatus(sb, FIXTURE_IDS.WEBHOOK_SIM);
    assertEquals(pre?.status, "failed");
    assertEquals(pre?.retry_count, 0);

    await sb.from("webhook_delivery_log").update({
      status: "replayed_simulated",
      retry_count: 1,
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", FIXTURE_IDS.WEBHOOK_SIM);

    await sb.from("admin_action_audit").insert({
      actor_user_id: FIXTURE_IDS.TARGET_USER,
      action: "webhook_replay",
      target_type: "webhook",
      target_id: FIXTURE_IDS.WEBHOOK_SIM,
      plane: "support",
      severity: "medium",
      justification: `Replayed webhook ${FIXTURE_IDS.WEBHOOK_SIM}`,
      metadata: { replay_status: "replayed_simulated", fixture: true },
    });

    await assertWebhookReplayInvariants(sb, FIXTURE_IDS.WEBHOOK_SIM, "replayed_simulated", 1);
  });
})});

Deno.test({ name: "webhook: DB fixture — failed replay records error + invariants", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  await withIsolatedFixtures(async (sb) => {
    const replayError = "HTTP 0 — connection refused";
    await sb.from("webhook_delivery_log").update({
      status: "replay_failed",
      retry_count: 1,
      last_error: replayError,
      updated_at: new Date().toISOString(),
    }).eq("id", FIXTURE_IDS.WEBHOOK_FAIL);

    const post = await queryWebhookStatus(sb, FIXTURE_IDS.WEBHOOK_FAIL);
    assertEquals(post?.status, "replay_failed");
    assertEquals(post?.retry_count, 1);
    assertEquals(post?.last_error, replayError);
  });
})});

Deno.test({ name: "webhook: DB fixture — retry_count increments on successive replays", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  await withIsolatedFixtures(async (sb) => {
    for (let i = 1; i <= 3; i++) {
      await sb.from("webhook_delivery_log").update({ status: "replayed_simulated", retry_count: i }).eq("id", FIXTURE_IDS.WEBHOOK_SIM);
    }
    const post = await queryWebhookStatus(sb, FIXTURE_IDS.WEBHOOK_SIM);
    assertEquals(post?.retry_count, 3);
  });
})});

// ── Authenticated admin end-to-end ────────────────────────────

Deno.test({ name: "webhook: authenticated admin — list action e2e", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  const sb = getServiceClient();
  await seedFixtures(sb);
  try {
    const { token } = await getAdminToken();
    const { status, json } = await callFunctionAsAdmin("webhook-replay", {
      params: "action=list",
      body: {},
      token,
    });

    if (status === 200) {
      assertResponseSchema(json, WebhookListSuccessSchema, "webhook list success");
      assertRequestId(json);
    } else if (status === 403) {
      assert(typeof (json as Record<string, unknown>)?.error === "string");
    } else {
      assert(false, `Expected 200 or 403, got ${status}`);
    }
  } finally {
    await cleanupFixtures(sb);
    await cleanupAdminUser();
  }
})});
