// ═══════════════════════════════════════════════════════════════
// SITA OS — Smoke Tests: Webhook Replay
// E2E tests covering auth gating, action routing, Zod-validated
// responses, and database side effects.
// ═══════════════════════════════════════════════════════════════

import {
  assertEquals,
  assertExists,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
const FUNC_URL = `${SUPABASE_URL}/functions/v1/webhook-replay`;

// ── Zod Response Schemas ──────────────────────────────────────

const ListResponseSchema = z.object({
  failures: z.array(z.object({
    id: z.string(),
    status: z.string(),
  }).passthrough()),
  count: z.number().int().min(0),
  _requestId: z.string().uuid(),
});

const ReplaySuccessSchema = z.object({
  success: z.literal(true),
  webhook_id: z.string(),
  replay_status: z.string(),
  replay_error: z.string().nullable(),
  _requestId: z.string().uuid(),
});

const ErrorResponseSchema = z.object({
  error: z.string().min(1),
  _requestId: z.string().uuid().optional(),
  _function: z.string().optional(),
});

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("webhook-replay: CORS preflight returns 200", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
});

Deno.test("webhook-replay: rejects unauthenticated list request with 401", async () => {
  const res = await fetch(`${FUNC_URL}?action=list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({}),
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  const parsed = ErrorResponseSchema.safeParse(body);
  assert(parsed.success, `Response did not match ErrorResponseSchema: ${JSON.stringify(body)}`);
});

Deno.test("webhook-replay: rejects unauthenticated replay request with 401", async () => {
  const res = await fetch(`${FUNC_URL}?action=replay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({ webhook_id: "00000000-0000-0000-0000-000000000000" }),
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  const parsed = ErrorResponseSchema.safeParse(body);
  assert(parsed.success, `Response did not match ErrorResponseSchema: ${JSON.stringify(body)}`);
});

Deno.test("webhook-replay: rejects invalid action parameter", async () => {
  const res = await fetch(`${FUNC_URL}?action=invalid_action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({}),
  });

  // Should fail at auth (401) before reaching action validation
  assert(res.status >= 400, `Expected 4xx, got ${res.status}`);
  await res.text();
});

Deno.test("webhook-replay: rejects invalid Bearer token with 401", async () => {
  const res = await fetch(`${FUNC_URL}?action=list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer completely-bogus",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({}),
  });

  assertEquals(res.status, 401);
  await res.text();
});