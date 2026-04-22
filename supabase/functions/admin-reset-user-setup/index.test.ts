// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Tools E2E Smoke Tests (Unified)
// Auth gating for: reset, revoke, webhook replay, support bundle,
// error-ingest, alert-ingest. Zod-validated responses. Safe env.
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  loadEnvSafe, withEnvGuard,
  getFuncUrl, getAnonKey,
  BaseErrorSchema, ErrorIngestSuccessSchema, AlertIngestSuccessSchema,
  assertResponseSchema, assertRequestId,
} from "../_shared/test-harness.ts";

loadEnvSafe();

const ANON_KEY = getAnonKey();

async function callFunction(name: string, opts: { method?: string; body?: unknown; params?: string } = {}) {
  const method = opts.method ?? "POST";
  const url = `${getFuncUrl(name)}${opts.params ? `?${opts.params}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, json, text };
}

// ── Admin endpoint auth gating ────────────────────────────────

Deno.test("admin-reset: rejects unauthenticated with valid error schema", withEnvGuard("anon", async () => {
  const { status, json } = await callFunction("admin-reset-user-setup", {
    body: { target_user_id: "00000000-0000-0000-0000-000000000000" },
  });
  assertEquals(status, 401);
  assertResponseSchema(json, BaseErrorSchema, "admin-reset 401");
}));

Deno.test("admin-revoke: rejects unauthenticated with valid error schema", withEnvGuard("anon", async () => {
  const { status, json } = await callFunction("admin-revoke-session", {
    body: { target_user_id: "00000000-0000-0000-0000-000000000000", reason: "smoke-test" },
  });
  assertEquals(status, 401);
  assertResponseSchema(json, BaseErrorSchema, "admin-revoke 401");
}));

Deno.test("webhook-replay: rejects unauthenticated with valid error schema", withEnvGuard("anon", async () => {
  const { status, json } = await callFunction("webhook-replay", {
    params: "action=list",
    body: {},
  });
  assertEquals(status, 401);
  assertResponseSchema(json, BaseErrorSchema, "webhook-replay 401");
}));

Deno.test("generate-support-bundle: rejects unauthenticated with valid error schema", withEnvGuard("anon", async () => {
  const { status, json } = await callFunction("generate-support-bundle", {
    body: { target_user_id: "00000000-0000-0000-0000-000000000000" },
  });
  assertEquals(status, 401);
  assertResponseSchema(json, BaseErrorSchema, "support-bundle 401");
}));

Deno.test("admin-reset: rejects missing body (4xx)", withEnvGuard("anon", async () => {
  const { status } = await callFunction("admin-reset-user-setup", { body: {} });
  assert(status >= 400 && status < 500);
}));

// ── error-ingest (public) ─────────────────────────────────────

Deno.test("error-ingest: accepts valid error batch with Zod schema", withEnvGuard("anon", async () => {
  const { status, json } = await callFunction("error-ingest", {
    body: {
      errors: [{
        message: "smoke-test-error",
        severity: "info",
        source: "edge",
        route: "/test",
        metadata: { smoke: true },
      }],
    },
  });
  assertEquals(status, 200);
  assertResponseSchema(json, ErrorIngestSuccessSchema, "error-ingest success");
}));

Deno.test("error-ingest: handles empty batch gracefully", withEnvGuard("anon", async () => {
  const { status, json } = await callFunction("error-ingest", { body: { errors: [] } });
  assertEquals(status, 200);
  const data = json as Record<string, unknown>;
  assertEquals(data.ok, true);
}));

Deno.test("error-ingest: rejects invalid JSON with 400", withEnvGuard("anon", async () => {
  const url = getFuncUrl("error-ingest");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain", apikey: ANON_KEY },
    body: "not json",
  });
  assertEquals(res.status, 400);
  await res.text();
}));

// ── alert-ingest (public) ─────────────────────────────────────

Deno.test("alert-ingest: accepts valid alert with Zod schema", withEnvGuard("anon", async () => {
  const { status, json } = await callFunction("alert-ingest", {
    body: {
      alerts: [{
        source: "smoke-test",
        severity: "low",
        subsystem: "testing",
        title: "Smoke test alert",
        description: "E2E smoke test — safe to ignore",
        metadata: { smoke: true },
      }],
    },
  });
  assertEquals(status, 200);
  assertResponseSchema(json, AlertIngestSuccessSchema, "alert-ingest success");
}));

Deno.test("alert-ingest: rejects invalid severity gracefully", withEnvGuard("anon", async () => {
  const { status, json } = await callFunction("alert-ingest", {
    body: {
      alerts: [{ source: "test", severity: "banana", subsystem: "x", title: "bad" }],
    },
  });
  assertEquals(status, 200);
  assertEquals((json as Record<string, unknown>).inserted, 0);
}));
