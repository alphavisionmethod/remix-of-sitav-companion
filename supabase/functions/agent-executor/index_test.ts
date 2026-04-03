import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "test-key";

Deno.test("agent-executor: rejects unauthorized requests", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/agent-executor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId: "test-agent" }),
  });
  const data = await res.json();
  assertEquals(res.status, 401, "Should reject missing auth");
});

Deno.test("agent-executor: handles CORS preflight", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/agent-executor`, {
    method: "OPTIONS",
    headers: { "Origin": "http://localhost:3000" },
  });
  assertEquals(res.status, 200);
  assertExists(res.headers.get("access-control-allow-origin"));
});

Deno.test("agent-executor: returns structured response", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/agent-executor`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ agentId: "connector-health", action: "diagnose" }),
  });
  const data = await res.json();
  assertExists(data);
});
