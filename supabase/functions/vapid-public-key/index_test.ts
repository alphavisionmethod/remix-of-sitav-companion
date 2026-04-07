import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/vapid-public-key`;

Deno.test("vapid-public-key: CORS preflight returns 200", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: { "Origin": "http://localhost", "Access-Control-Request-Method": "GET" },
  });
  assertEquals(res.status, 200);
  await res.text();
});

Deno.test("vapid-public-key: GET returns valid key", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: { "apikey": SUPABASE_ANON_KEY },
  });
  assertEquals(res.status, 200);
  const data = await res.json();
  assertExists(data.vapid_public_key);
  assertEquals(typeof data.vapid_public_key, "string");
  assertEquals(data.vapid_public_key.length > 0, true);
});

Deno.test("vapid-public-key: POST returns 405", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assertEquals(res.status, 405);
  await res.text();
});
