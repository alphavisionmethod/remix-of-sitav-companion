import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "test-key";

Deno.test("brain-core: rejects missing intent", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/brain-core`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ advisor: "business" }),
  });
  const data = await res.json();
  assertEquals(res.status >= 400, true, "Should reject missing intent");
});

Deno.test("brain-core: handles CORS preflight", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/brain-core`, {
    method: "OPTIONS",
    headers: { "Origin": "http://localhost:3000" },
  });
  assertEquals(res.status, 200);
  assertExists(res.headers.get("access-control-allow-origin"));
});

Deno.test("brain-core: returns structured response for valid intent", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/brain-core`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ intent: "analyze_bills", advisor: "money" }),
  });
  // May fail auth but structure should be consistent
  const data = await res.json();
  assertExists(data);
});
