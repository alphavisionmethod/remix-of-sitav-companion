import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "test-key";

Deno.test("admin-intelligence: rejects unauthenticated", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/admin-intelligence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "anomalies" }),
  });
  assertEquals(res.status >= 400, true);
});

Deno.test("admin-intelligence: handles CORS", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/admin-intelligence`, { method: "OPTIONS" });
  assertEquals(res.status, 200);
});
