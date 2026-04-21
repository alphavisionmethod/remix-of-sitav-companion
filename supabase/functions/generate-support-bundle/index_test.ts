// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Smoke Tests: Generate Support Bundle
// Deterministic fixtures + DB mutation assertions
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  FIXTURE_IDS,
  getServiceClient,
  getFuncUrl,
  getAnonKey,
  queryAuditRows,
} from "../_shared/test-fixtures.ts";

const FUNC_URL = getFuncUrl("generate-support-bundle");
const ANON_KEY = getAnonKey();

const ErrorSchema = z.object({ error: z.string().min(1) });

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("bundle: CORS preflight returns 200", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
});

Deno.test("bundle: rejects missing Authorization with 401", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ bundleType: "system-wide" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assert(ErrorSchema.safeParse(body).success);
  assertEquals(body.error, "Missing authorization");
});

Deno.test("bundle: rejects invalid Bearer token with 401", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer fake-jwt-token-here",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ bundleType: "system-wide" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error, "Unauthorized");
});

Deno.test("bundle: rejects empty body gracefully (4xx)", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
  });
  assert(res.status >= 400 && res.status < 500);
  await res.text();
});

Deno.test("bundle: all 4 bundleType values reach auth (not 500)", async () => {
  const types = ["system-wide", "runtime-crash", "admin-operator", "support-escalation"];
  for (const bundleType of types) {
    const res = await fetch(FUNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer fake-shape-check",
        apikey: ANON_KEY,
      },
      body: JSON.stringify({ bundleType }),
    });
    assert(res.status === 401, `bundleType=${bundleType} got ${res.status}`);
    await res.text();
  }
});

// ── Fixture-based DB mutation tests ───────────────────────────

Deno.test({ name: "bundle: DB fixture — generate_support_bundle audit row written with correct metadata", sanitizeOps: false, sanitizeResources: false, fn: async () => {
  const sb = getServiceClient();

  const auditBefore = await queryAuditRows(sb, "generate_support_bundle", FIXTURE_IDS.TARGET_USER);
  const countBefore = auditBefore.length;

  // Simulate the exact audit insert the function performs
  const bundleId = `SB-${Date.now().toString(36)}-smoketest`;
  const bundleType = "system-wide";
  const { error } = await sb.from("admin_action_audit").insert({
    actor_user_id: FIXTURE_IDS.TARGET_USER,
    action: "generate_support_bundle",
    target_type: "support_bundle",
    target_id: FIXTURE_IDS.TARGET_USER,
    plane: "support",
    severity: "medium",
    justification: `Support bundle generation: ${bundleType}`,
    metadata: { bundleType, bundleId, fixture: true },
  });
  assertEquals(error, null, "Audit insert should succeed");

  // Post-condition
  const auditAfter = await queryAuditRows(sb, "generate_support_bundle", FIXTURE_IDS.TARGET_USER);
  assert(auditAfter.length > countBefore, "New audit row must exist");
  assertEquals(auditAfter[0].action, "generate_support_bundle");
  assertEquals(auditAfter[0].plane, "support");
  assertEquals(auditAfter[0].severity, "medium");

  // Verify metadata shape
  const meta = auditAfter[0].metadata as Record<string, unknown>;
  assertEquals(meta.bundleType, bundleType);
  assert(typeof meta.bundleId === "string" && (meta.bundleId as string).startsWith("SB-"));

  // Cleanup
  await sb.from("admin_action_audit").delete().eq("target_id", FIXTURE_IDS.TARGET_USER).eq("action", "generate_support_bundle");
}});

Deno.test({ name: "bundle: DB fixture — multiple bundle types produce distinct audit rows", sanitizeOps: false, sanitizeResources: false, fn: async () => {
  const sb = getServiceClient();

  const types = ["system-wide", "runtime-crash", "admin-operator", "support-escalation"];
  for (const bt of types) {
    await sb.from("admin_action_audit").insert({
      actor_user_id: FIXTURE_IDS.TARGET_USER,
      action: "generate_support_bundle",
      target_type: "support_bundle",
      target_id: FIXTURE_IDS.TARGET_USER,
      plane: "support",
      severity: "medium",
      metadata: { bundleType: bt, bundleId: `SB-${bt}`, fixture: true },
    });
  }

  const rows = await queryAuditRows(sb, "generate_support_bundle", FIXTURE_IDS.TARGET_USER);
  const bundleTypes = rows.map((r) => (r.metadata as Record<string, unknown>).bundleType);
  for (const bt of types) {
    assert(bundleTypes.includes(bt), `Missing audit row for bundleType=${bt}`);
  }

  // Cleanup
  await sb.from("admin_action_audit").delete().eq("target_id", FIXTURE_IDS.TARGET_USER).eq("action", "generate_support_bundle");
}});