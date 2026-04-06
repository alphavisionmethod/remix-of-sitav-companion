import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("ai-health — returns health status", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-health`, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
  });
  const body = await res.json();
  assertEquals(res.status, 200);
  assertExists(body);
});

Deno.test("ai-health — CORS preflight", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-health`, {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:3000", "Access-Control-Request-Method": "GET" },
  });
  await res.text();
  assertEquals(res.status, 200);
});
