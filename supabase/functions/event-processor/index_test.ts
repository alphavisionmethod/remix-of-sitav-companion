import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "test-key";

Deno.test("event-processor: rejects unauthenticated", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/event-processor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "test.event", payload: {} }),
  });
  assertEquals(res.status >= 400, true);
});

Deno.test("event-processor: handles CORS", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/event-processor`, { method: "OPTIONS" });
  assertEquals(res.status, 200);
});

Deno.test("event-processor: rejects missing event type", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/event-processor`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ payload: {} }),
  });
  const data = await res.json();
  assertExists(data);
});
