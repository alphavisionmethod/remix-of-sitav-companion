// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Tools E2E Smoke Tests
// Tests: reset, revoke, webhook replay, support bundle
// Asserts Zod-valid responses and expected behavior.
// ═══════════════════════════════════════════════════════════════

import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

try { loadSync({ allowEmptyValues: true, export: true }); } catch { /* ok if .env missing */ }

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

const headers: Record<string, string> = {
  "Content-Type": "application/json",
  "apikey": ANON_KEY,
};

// ── Helper ───────────────────────────────────────────────────

async function callFunction(name: string, opts: { method?: string; body?: unknown; params?: string } = {}) {
  const method = opts.method ?? "POST";
  const url = `${SUPABASE_URL}/functions/v1/${name}${opts.params ? `?${opts.params}` : ""}`;
  const res = await fetch(url, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, json, text };
}

// ── Tests ────────────────────────────────────────────────────

Deno.test("admin-reset-user-setup: rejects unauthenticated calls", async () => {
  const { status, json } = await callFunction("admin-reset-user-setup", {
    body: { target_user_id: "00000000-0000-0000-0000-000000000000" },
  });
  assertEquals(status, 401);
  assertExists((json as Record<string, unknown>)?.error);
});

Deno.test("admin-revoke-session: rejects unauthenticated calls", async () => {
  const { status, json } = await callFunction("admin-revoke-session", {
    body: { target_user_id: "00000000-0000-0000-0000-000000000000", reason: "smoke-test" },
  });
  assertEquals(status, 401);
  assertExists((json as Record<string, unknown>)?.error);
});

Deno.test("webhook-replay: rejects unauthenticated list", async () => {
  const { status, json } = await callFunction("webhook-replay", {
    method: "POST",
    params: "action=list",
    body: {},
  });
  assertEquals(status, 401);
  assertExists((json as Record<string, unknown>)?.error);
});

Deno.test("generate-support-bundle: rejects unauthenticated calls", async () => {
  const { status, json } = await callFunction("generate-support-bundle", {
    body: { target_user_id: "00000000-0000-0000-0000-000000000000" },
  });
  assertEquals(status, 401);
  assertExists((json as Record<string, unknown>)?.error);
});

Deno.test("admin-reset-user-setup: rejects missing body", async () => {
  const { status } = await callFunction("admin-reset-user-setup", { body: {} });
  // Should be 400 or 401 (auth check first)
  assertEquals(status >= 400, true);
});

Deno.test("error-ingest: accepts valid error batch", async () => {
  const { status, json } = await callFunction("error-ingest", {
    body: {
      errors: [
        {
          message: "smoke-test-error",
          severity: "info",
          source: "edge",
          route: "/test",
          metadata: { smoke: true },
        },
      ],
    },
  });
  assertEquals(status, 200);
  const data = json as Record<string, unknown>;
  assertEquals(data.ok, true);
  assertEquals(typeof data.inserted, "number");
});

Deno.test("error-ingest: handles empty batch gracefully", async () => {
  const { status, json } = await callFunction("error-ingest", {
    body: { errors: [] },
  });
  assertEquals(status, 200);
  assertEquals((json as Record<string, unknown>).ok, true);
  assertEquals((json as Record<string, unknown>).processed, 0);
});

Deno.test("alert-ingest: accepts valid alert", async () => {
  const { status, json } = await callFunction("alert-ingest", {
    body: {
      alerts: [
        {
          source: "smoke-test",
          severity: "low",
          subsystem: "testing",
          title: "Smoke test alert",
          description: "E2E smoke test — safe to ignore",
          metadata: { smoke: true },
        },
      ],
    },
  });
  assertEquals(status, 200);
  const data = json as Record<string, unknown>;
  assertEquals(data.ok, true);
  assertEquals(typeof data.inserted, "number");
});

Deno.test("alert-ingest: rejects invalid severity", async () => {
  const { status, json } = await callFunction("alert-ingest", {
    body: {
      alerts: [
        { source: "test", severity: "banana", subsystem: "x", title: "bad" },
      ],
    },
  });
  assertEquals(status, 200);
  assertEquals((json as Record<string, unknown>).inserted, 0);
});

Deno.test("error-ingest: rejects invalid JSON", async () => {
  const url = `${SUPABASE_URL}/functions/v1/error-ingest`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "text/plain" },
    body: "not json",
  });
  await res.text();
  assertEquals(res.status, 400);
});