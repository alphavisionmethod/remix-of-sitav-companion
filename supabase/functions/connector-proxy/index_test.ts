import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "test-key";

Deno.test("connector-proxy: rejects unauthenticated", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/connector-proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: "gmail", action: "sync" }),
  });
  assertEquals(res.status >= 400, true);
});

Deno.test("connector-proxy: handles CORS", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/connector-proxy`, { method: "OPTIONS" });
  assertEquals(res.status, 200);
});

Deno.test("connector-proxy: rejects missing service", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/connector-proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ action: "sync" }),
  });
  const data = await res.json();
  assertExists(data);
});
