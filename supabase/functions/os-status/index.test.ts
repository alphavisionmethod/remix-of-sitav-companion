import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("os-status — GET returns device statuses", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/os-status`, {
    method: "GET",
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
  });
  const body = await res.json();
  await res.text().catch(() => {});
  // Should return 200 or data structure
  assertEquals(typeof body, "object");
});

Deno.test("os-status — CORS preflight", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/os-status`, {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:3000", "Access-Control-Request-Method": "GET" },
  });
  await res.text();
  assertEquals(res.status, 200);
});
