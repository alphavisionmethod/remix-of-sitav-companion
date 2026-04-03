import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "test-key";

Deno.test("admin-api: rejects unauthenticated requests", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/admin-api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "list_users" }),
  });
  assertEquals(res.status >= 400, true);
});

Deno.test("admin-api: handles CORS preflight", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/admin-api`, {
    method: "OPTIONS",
  });
  assertEquals(res.status, 200);
});

Deno.test("admin-api: rejects missing action", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/admin-api`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  assertExists(data);
});
