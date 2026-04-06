import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("main — health endpoint returns healthy", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/main`, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
  });
  const body = await res.json();
  assertEquals(res.status, 200);
  assertExists(body.status);
  assertEquals(body.status, "healthy");
});

Deno.test("main — CORS preflight returns 200", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/main`, {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:3000", "Access-Control-Request-Method": "POST" },
  });
  await res.text();
  assertEquals(res.status, 200);
});
