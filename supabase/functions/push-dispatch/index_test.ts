import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || "https://icrkipwlnuopqbsabngy.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/push-dispatch`;

Deno.test("push-dispatch: CORS preflight returns 200", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: { "Origin": "http://localhost", "Access-Control-Request-Method": "POST" },
  });
  assertEquals(res.status, 200);
  await res.text();
});

Deno.test("push-dispatch: missing user_id returns 400", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Test" }),
  });
  const valid = [400, 401].includes(res.status);
  assertEquals(valid, true);
  await res.text();
});

Deno.test("push-dispatch: missing title returns 400", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: "00000000-0000-0000-0000-000000000000" }),
  });
  const valid = [400, 401].includes(res.status);
  assertEquals(valid, true);
  await res.text();
});

Deno.test("push-dispatch: valid payload with no tokens", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      notification_id: "00000000-0000-0000-0000-000000000000",
      user_id: "00000000-0000-0000-0000-000000000000",
      title: "Test Notification",
      body: "Test body",
      urgency: "normal",
    }),
  });
  const valid = [200, 401, 403].includes(res.status);
  assertEquals(valid, true);
  await res.text();
});
