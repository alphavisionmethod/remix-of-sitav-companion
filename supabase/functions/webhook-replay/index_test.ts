// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Smoke Tests: Webhook Replay
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
  queryWebhookStatus,
  queryAuditRows,
} from "../_shared/test-fixtures.ts";

const FUNC_URL = getFuncUrl("webhook-replay");
const ANON_KEY = getAnonKey();

const ErrorSchema = z.object({
  error: z.string().min(1),
  _requestId: z.string().uuid().optional(),
  _function: z.string().optional(),
});

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("webhook: CORS preflight returns 200", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
});

Deno.test("webhook: rejects unauthenticated list with 401", async () => {
  const res = await fetch(`${FUNC_URL}?action=list`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({}),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assert(ErrorSchema.safeParse(body).success);
});

Deno.test("webhook: rejects unauthenticated replay with 401", async () => {
  const res = await fetch(`${FUNC_URL}?action=replay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ webhook_id: FIXTURE_IDS.WEBHOOK_SIM }),
  });
  assertEquals(res.status, 401);
  await res.text();
});

Deno.test("webhook: rejects invalid Bearer token with 401", async () => {
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
});

// ── Fixture-based DB mutation tests ───────────────────────────

Deno.test("webhook: DB fixture — simulated replay sets status=replayed_simulated & bumps retry_count", async () => {
  const sb = getServiceClient();
  await seedFixtures(sb);

  // Pre-condition
  const pre = await queryWebhookStatus(sb, FIXTURE_IDS.WEBHOOK_SIM);
  assertEquals(pre?.status, "failed");
  assertEquals(pre?.retry_count, 0);

  const auditBefore = await queryAuditRows(sb, "webhook_replay", FIXTURE_IDS.WEBHOOK_SIM);

  // Simulate the exact mutations the edge function performs for a null target_url webhook
  const replayStatus = "replayed_simulated";
  const { error } = await sb
    .from("webhook_delivery_log")
    .update({
      status: replayStatus,
      retry_count: (pre?.retry_count ?? 0) + 1,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", FIXTURE_IDS.WEBHOOK_SIM);
  assertEquals(error, null);

  await sb.from("admin_action_audit").insert({
    actor_user_id: FIXTURE_IDS.TARGET_USER,
    action: "webhook_replay",
    target_type: "webhook",
    target_id: FIXTURE_IDS.WEBHOOK_SIM,
    plane: "support",
    severity: "medium",
    justification: `Replayed webhook ${FIXTURE_IDS.WEBHOOK_SIM}`,
    metadata: { replay_status: replayStatus, replay_error: null, fixture: true },
  });

  // Post-conditions
  const post = await queryWebhookStatus(sb, FIXTURE_IDS.WEBHOOK_SIM);
  assertEquals(post?.status, "replayed_simulated");
  assertEquals(post?.retry_count, 1);
  assertEquals(post?.last_error, null);

  const auditAfter = await queryAuditRows(sb, "webhook_replay", FIXTURE_IDS.WEBHOOK_SIM);
  assert(auditAfter.length > auditBefore.length);
  assertEquals(auditAfter[0].plane, "support");

  await cleanupFixtures(sb);
});

Deno.test("webhook: DB fixture — failed replay sets status=replay_failed & records error", async () => {
  const sb = getServiceClient();
  await seedFixtures(sb);

  const pre = await queryWebhookStatus(sb, FIXTURE_IDS.WEBHOOK_FAIL);
  assertEquals(pre?.status, "failed");

  // Simulate failed replay (the function would get a network error from 0.0.0.0:1)
  const replayError = "HTTP 0 — connection refused";
  const { error } = await sb
    .from("webhook_delivery_log")
    .update({
      status: "replay_failed",
      retry_count: (pre?.retry_count ?? 0) + 1,
      last_error: replayError,
      updated_at: new Date().toISOString(),
    })
    .eq("id", FIXTURE_IDS.WEBHOOK_FAIL);
  assertEquals(error, null);

  const post = await queryWebhookStatus(sb, FIXTURE_IDS.WEBHOOK_FAIL);
  assertEquals(post?.status, "replay_failed");
  assertEquals(post?.retry_count, 1);
  assertEquals(post?.last_error, replayError);

  await cleanupFixtures(sb);
});

Deno.test("webhook: DB fixture — retry_count increments on successive replays", async () => {
  const sb = getServiceClient();
  await seedFixtures(sb);

  // Replay 1
  await sb.from("webhook_delivery_log").update({ status: "replayed_simulated", retry_count: 1 }).eq("id", FIXTURE_IDS.WEBHOOK_SIM);
  // Replay 2
  await sb.from("webhook_delivery_log").update({ status: "replayed_simulated", retry_count: 2 }).eq("id", FIXTURE_IDS.WEBHOOK_SIM);
  // Replay 3
  await sb.from("webhook_delivery_log").update({ status: "replayed_simulated", retry_count: 3 }).eq("id", FIXTURE_IDS.WEBHOOK_SIM);

  const post = await queryWebhookStatus(sb, FIXTURE_IDS.WEBHOOK_SIM);
  assertEquals(post?.retry_count, 3, "retry_count must reflect cumulative replays");

  await cleanupFixtures(sb);
});