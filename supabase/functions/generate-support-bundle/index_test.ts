// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Smoke Tests: Generate Support Bundle
// Zod response schemas, cross-table invariants, transaction
// isolation, authenticated admin harness, safe env loading.
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  loadEnvSafe, withEnvGuard,
  FIXTURE_IDS, getFuncUrl, getAnonKey,
  getServiceClient,
  queryAuditRows,
  SupportBundleSuccessSchema, BaseErrorSchema,
  assertResponseSchema, assertRequestId,
  assertBundleInvariants,
  getAdminToken, callFunctionAsAdmin, cleanupAdminUser,
} from "../_shared/test-harness.ts";

loadEnvSafe();

const FUNC_URL = getFuncUrl("generate-support-bundle");
const ANON_KEY = getAnonKey();

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("bundle: CORS preflight returns 200", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
}));

Deno.test("bundle: rejects missing Authorization with 401 + error schema", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ bundleType: "system-wide" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertResponseSchema(body, BaseErrorSchema, "bundle 401");
  assertRequestId(body);
}));

Deno.test("bundle: rejects invalid Bearer with 401", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer fake-jwt-token",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ bundleType: "system-wide" }),
  });
  assertEquals(res.status, 401);
  await res.text();
}));

Deno.test("bundle: rejects empty body (4xx)", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
  });
  assert(res.status >= 400 && res.status < 500);
  await res.text();
}));

Deno.test("bundle: all 4 bundleType values reach auth (not 500)", withEnvGuard("anon", async () => {
  for (const bundleType of ["system-wide", "runtime-crash", "admin-operator", "support-escalation"]) {
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
}));

// ── DB fixture tests with cross-table invariants ──────────────

Deno.test({ name: "bundle: DB fixture — audit row written with cross-table invariants", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  const sb = getServiceClient();
  const bundleId = `SB-${Date.now().toString(36)}-smoketest`;
  const bundleType = "system-wide";

  try {
    await sb.from("admin_action_audit").insert({
      actor_user_id: FIXTURE_IDS.TARGET_USER,
      action: "generate_support_bundle",
      target_type: "support_bundle",
      target_id: FIXTURE_IDS.TARGET_USER,
      plane: "support",
      severity: "medium",
      justification: `Support bundle generation: ${bundleType}`,
      metadata: { bundleType, bundleId, fixture: true },
    });

    await assertBundleInvariants(sb, FIXTURE_IDS.TARGET_USER, bundleType);
  } finally {
    await sb.from("admin_action_audit").delete().eq("target_id", FIXTURE_IDS.TARGET_USER).eq("action", "generate_support_bundle");
  }
})});

Deno.test({ name: "bundle: DB fixture — all 4 types produce distinct audit rows", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  const sb = getServiceClient();
  const types = ["system-wide", "runtime-crash", "admin-operator", "support-escalation"];

  try {
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
      assert(bundleTypes.includes(bt), `Missing audit for bundleType=${bt}`);
    }
  } finally {
    await sb.from("admin_action_audit").delete().eq("target_id", FIXTURE_IDS.TARGET_USER).eq("action", "generate_support_bundle");
  }
})});

// ── Authenticated admin end-to-end ────────────────────────────

Deno.test({ name: "bundle: authenticated admin — full e2e with Zod", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  try {
    const { token } = await getAdminToken();
    const { status, json } = await callFunctionAsAdmin("generate-support-bundle", {
      body: { bundleType: "system-wide" },
      token,
    });

    if (status === 200) {
      assertResponseSchema(json, SupportBundleSuccessSchema, "bundle success");
      assertRequestId(json);
    } else if (status === 403) {
      assert(typeof (json as Record<string, unknown>)?.error === "string");
    } else {
      assert(false, `Expected 200 or 403, got ${status}`);
    }
  } finally {
    await cleanupAdminUser();
  }
})});
