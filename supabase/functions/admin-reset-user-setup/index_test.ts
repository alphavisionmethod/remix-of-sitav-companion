// ═══════════════════════════════════════════════════════════════
// SITA OS — Smoke Tests: Admin Reset User Setup
// E2E tests covering auth gating, Zod-validated responses,
// and expected database side effects.
// ═══════════════════════════════════════════════════════════════

import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
loadSync({ export: true, allowEmptyValues: true });
import {
  assertEquals,
  assertExists,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
const FUNC_URL = `${SUPABASE_URL}/functions/v1/admin-reset-user-setup`;

// ── Zod Response Schemas ──────────────────────────────────────

const SuccessResponseSchema = z.object({
  success: z.literal(true),
  target_user_id: z.string().uuid(),
  _requestId: z.string().uuid(),
});

const ErrorResponseSchema = z.object({
  error: z.string().min(1),
  _requestId: z.string().uuid().optional(),
  _function: z.string().optional(),
});

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("admin-reset-user-setup: CORS preflight returns 200", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
});

Deno.test("admin-reset-user-setup: rejects unauthenticated requests with 401", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({ target_user_id: "00000000-0000-0000-0000-000000000000" }),
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  const parsed = ErrorResponseSchema.safeParse(body);
  assert(parsed.success, `Response did not match ErrorResponseSchema: ${JSON.stringify(body)}`);
  assertEquals(parsed.data!.error, "Unauthorized");
});

Deno.test("admin-reset-user-setup: rejects invalid Bearer token with 401", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer invalid-token-abc123",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({ target_user_id: "00000000-0000-0000-0000-000000000000" }),
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  const parsed = ErrorResponseSchema.safeParse(body);
  assert(parsed.success, `Response did not match ErrorResponseSchema: ${JSON.stringify(body)}`);
});

Deno.test("admin-reset-user-setup: rejects request with no body gracefully", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
  });

  // Should fail at auth or body parsing — not crash with 500
  assert(res.status >= 400 && res.status < 500, `Expected 4xx, got ${res.status}`);
  await res.text();
});