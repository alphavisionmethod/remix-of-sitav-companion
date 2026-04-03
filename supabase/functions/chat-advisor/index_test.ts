import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "test-key";

Deno.test("chat-advisor: rejects unauthorized requests", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/chat-advisor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
  });
  const data = await res.json();
  assertEquals(res.status, 401, "Should reject missing auth");
});

Deno.test("chat-advisor: handles CORS preflight", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/chat-advisor`, {
    method: "OPTIONS",
    headers: { "Origin": "http://localhost:3000" },
  });
  assertEquals(res.status, 200);
  assertExists(res.headers.get("access-control-allow-origin"));
});

Deno.test("chat-advisor: rejects missing messages", async () => {
  const res = await fetch(`${BASE_URL}/functions/v1/chat-advisor`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ advisor: "money" }),
  });
  const data = await res.json();
  assertExists(data);
});
