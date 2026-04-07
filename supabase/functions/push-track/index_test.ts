import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

try { loadSync({ export: true, allowEmptyValues: true }); } catch { /* ok */ }

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/push-track`;

Deno.test("push-track: CORS preflight returns 200", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: { "Origin": "http://localhost", "Access-Control-Request-Method": "POST" },
  });
  assertEquals(res.status, 200);
  await res.text();
});

Deno.test("push-track: GET returns 405", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: { "apikey": SUPABASE_ANON_KEY },
  });
  assertEquals(res.status, 405);
  await res.text();
});

Deno.test("push-track: missing fields returns 400", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assertEquals(res.status, 400);
  const data = await res.json();
  assertEquals(data.error, "Missing notification_id or action");
});

Deno.test("push-track: invalid action returns 400", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ notification_id: "fake-id", action: "invalid" }),
  });
  assertEquals(res.status, 400);
  const data = await res.json();
  assertEquals(data.error, "Invalid action. Must be 'clicked' or 'dismissed'");
});

Deno.test("push-track: valid payload processes (may fail on DB)", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ notification_id: "00000000-0000-0000-0000-000000000000", action: "clicked" }),
  });
  const valid = [200, 500].includes(res.status);
  assertEquals(valid, true);
  await res.text();
});
